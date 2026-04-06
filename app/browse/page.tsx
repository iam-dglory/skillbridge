'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SkillCard from '@/components/SkillCard'
import CountryPicker from '@/components/CountryPicker'
import { CATEGORY_META, detectCountryFromLocale } from '@/lib/ppp'
import type { ListingWithSeller } from '@/types/database'

const CATEGORIES = Object.keys(CATEGORY_META)

export default function BrowsePage() {
  const supabase = createClient()
  const [listings, setListings] = useState<ListingWithSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState('India')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    setCountry(detectCountryFromLocale())
  }, [])

  useEffect(() => {
    fetchListings()
  }, [country, category])

  async function fetchListings() {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select('*, users(name, country, avatar_url), reviews(rating)')
      .eq('is_active', true)
      .contains('available_countries', [country])

    if (category !== 'All') q = q.eq('category', category)

    const { data } = await q
    setListings((data as ListingWithSeller[]) ?? [])
    setLoading(false)
  }

  const filtered = listings
    .filter(l => {
      if (!query) return true
      const q = query.toLowerCase()
      return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      if (sort === 'rating') {
        const ar = a.reviews?.reduce((s, r) => s + r.rating, 0) ?? 0
        const br = b.reviews?.reduce((s, r) => s + r.rating, 0) ?? 0
        return br - ar
      }
      return 0
    })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="🔍  Search skills..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 min-w-52 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <CountryPicker value={country} onChange={setCountry} className="w-44" />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="featured">⭐ Featured</option>
          <option value="rating">★ Top Rated</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap ${
              category === c
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
          >
            {c !== 'All' && CATEGORY_META[c].icon + ' '}{c}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-5">
        {loading ? 'Loading...' : `${filtered.length} skills available in ${country}`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🌐</div>
          <div className="text-lg font-semibold">No results found</div>
          <div className="text-sm mt-1">Try a different category or switch countries</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(l => (
            <SkillCard key={l.id} listing={l} userCountry={country} />
          ))}
        </div>
      )}
    </div>
  )
}
