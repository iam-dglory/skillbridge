'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META, getMaxPrice, detectCountryFromIP } from '@/lib/ppp'
import SkillCard from '@/components/SkillCard'
import type { ListingRow } from '@/types/database'

type ListingWithPrice = ListingRow & { price_local: number; local_currency: string }

const ENGAGEMENT_OPTIONS = ['Freelance', 'Part-time', 'Long-term']

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [country, setCountry] = useState('India')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [engagement, setEngagement] = useState('')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<ListingWithPrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    detectCountryFromIP().then(c => { if (c) setCountry(c) })
  }, [])

  useEffect(() => {
    setLoading(true)
    let q = supabase.from('listings').select('*').eq('is_active', true)
    if (category) q = q.eq('category', category)
    if (search) q = q.ilike('title', `%${search}%`)

    q.order('featured', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => {
        const enriched: ListingWithPrice[] = (data ?? [])
          .filter(l => l.available_countries.includes(country))
          .filter(l => !engagement || ((l as any).engagement_types ?? []).includes(engagement))
          .map(l => {
            const p = getMaxPrice(l.category, country)
            return { ...l, price_local: p.local, local_currency: p.currency }
          })
        setListings(enriched)
        setLoading(false)
      })
  }, [country, category, engagement, search])

  const cats = Object.keys(CATEGORY_META)
  const countryInfo = COUNTRIES[country]

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-1">Browse Skills</h1>
        <p className="text-slate-400 text-sm">Prices shown for <span className="text-violet-300 font-semibold">{countryInfo?.flag} {country}</span></p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="glass p-4 flex flex-wrap gap-3">
          {/* Search */}
          <input
            className="input-dark flex-1 min-w-[200px]"
            placeholder="🔍 Search skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Country */}
          <select className="input-dark w-auto min-w-[150px]" value={country} onChange={e => setCountry(e.target.value)}>
            {Object.entries(COUNTRIES).map(([c, info]) => (
              <option key={c} value={c} style={{ background: '#1a0533' }}>{info.flag} {c}</option>
            ))}
          </select>

          {/* Engagement */}
          <select className="input-dark w-auto min-w-[150px]" value={engagement} onChange={e => setEngagement(e.target.value)}>
            <option value="">All Types</option>
            {ENGAGEMENT_OPTIONS.map(e => <option key={e} value={e} style={{ background: '#1a0533' }}>{e}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button onClick={() => setCategory('')}
            className={`text-xs px-4 py-1.5 rounded-full font-semibold transition ${!category ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-300 border border-white/10 hover:border-violet-500/40'}`}>
            All
          </button>
          {cats.map(c => (
            <button key={c} onClick={() => setCategory(category === c ? '' : c)}
              className={`text-xs px-4 py-1.5 rounded-full font-semibold transition ${category === c ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-300 border border-white/10 hover:border-violet-500/40'}`}>
              {CATEGORY_META[c].icon} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass h-64 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="glass text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <div className="font-bold text-white mb-2">No skills found</div>
            <div className="text-slate-400 text-sm">Try a different country, category, or search term.</div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-slate-400 mb-5">{listings.length} skills available in {countryInfo?.flag} {country}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map(l => <SkillCard key={l.id} listing={l} country={country} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-40 flex items-center justify-center text-violet-300 animate-pulse">Loading skills...</div>}>
      <BrowseContent />
    </Suspense>
  )
}
