'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META } from '@/lib/ppp'

const ENGAGEMENT_OPTIONS = ['Freelance', 'Part-time', 'Long-term']
const ALL_TAGS = ['Python', 'Design', 'SEO', 'React', 'Video', 'Writing', 'AI', 'Figma', 'Canva', 'Excel', 'WordPress', 'Node.js', 'Branding', 'TikTok', 'YouTube']

export default function SellPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [deliveryDays, setDeliveryDays] = useState(3)
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['India'])
  const [selectedEngagements, setSelectedEngagements] = useState<string[]>(['Freelance'])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login?redirect=/sell')
    })
  }, [])

  const toggleCountry = (c: string) => {
    setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }
  const toggleEngagement = (e: string) => {
    setSelectedEngagements(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
  }
  const toggleTag = (t: string) => {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  const addCustomTag = () => {
    const t = customTag.trim()
    if (t && !selectedTags.includes(t)) setSelectedTags(prev => [...prev, t])
    setCustomTag('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title || !category || !description) { setError('Please fill in all required fields.'); return }
    if (selectedCountries.length === 0) { setError('Select at least one country.'); return }
    if (selectedEngagements.length === 0) { setError('Select at least one engagement type.'); return }

    setSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    // Ensure user profile exists
    await supabase.from('users').upsert({
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.name ?? session.user.email!.split('@')[0],
      country: selectedCountries[0],
      avatar_url: '🌟',
    })

    const { error: insertError } = await supabase.from('listings').insert({
      seller_id: session.user.id,
      title,
      category,
      description,
      delivery_days: deliveryDays,
      available_countries: selectedCountries,
      engagement_types: selectedEngagements,
      tags: selectedTags,
      is_active: true,
      featured: false,
    })

    if (insertError) { setError(insertError.message); setSubmitting(false); return }
    router.push('/dashboard?listing=created')
  }

  const cats = Object.entries(CATEGORY_META)
  const countriesList = Object.keys(COUNTRIES)

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-1">List your skill</h1>
        <p className="text-slate-400 text-sm mb-8">Reach buyers across 150+ countries at PPP-adjusted prices.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="glass p-5">
            <label className="label-dark">Service title *</label>
            <input className="input-dark" placeholder="e.g. Professional YouTube Video Editing"
              value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} />
          </div>

          {/* Category */}
          <div className="glass p-5">
            <label className="label-dark">Category *</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {cats.map(([key, meta]) => (
                <button type="button" key={key}
                  onClick={() => setCategory(key)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition border ${category === key ? 'border-violet-500 bg-violet-600/20 text-violet-300' : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/40'}`}>
                  <span>{meta.icon}</span> {key}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement types */}
          <div className="glass p-5">
            <label className="label-dark">Engagement type *</label>
            <div className="flex gap-3 mt-1 flex-wrap">
              {ENGAGEMENT_OPTIONS.map(e => (
                <button type="button" key={e}
                  onClick={() => toggleEngagement(e)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition border ${selectedEngagements.includes(e) ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/40'}`}>
                  {e === 'Freelance' ? '⚡' : e === 'Part-time' ? '🕐' : '🔗'} {e}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Select all that apply. Buyers can filter by this.</p>
          </div>

          {/* Description */}
          <div className="glass p-5">
            <label className="label-dark">Description *</label>
            <textarea className="input-dark resize-none" rows={5}
              placeholder="Describe what you offer, your experience, what the buyer will receive, and any requirements..."
              value={description} onChange={e => setDescription(e.target.value)} required />
            <div className="text-xs text-slate-500 mt-1">{description.length} / 1000 chars</div>
          </div>

          {/* Delivery days */}
          <div className="glass p-5">
            <label className="label-dark">Delivery time</label>
            <div className="flex items-center gap-4 mt-2">
              <input type="range" min={1} max={30} value={deliveryDays}
                onChange={e => setDeliveryDays(Number(e.target.value))}
                className="flex-1 accent-violet-500" />
              <span className="text-white font-bold w-16 text-right">{deliveryDays} {deliveryDays === 1 ? 'day' : 'days'}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="glass p-5">
            <label className="label-dark">Tags</label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {ALL_TAGS.map(t => (
                <button type="button" key={t} onClick={() => toggleTag(t)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition border ${selectedTags.includes(t) ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/40'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-dark flex-1" placeholder="Add custom tag..." value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())} />
              <button type="button" onClick={addCustomTag} className="btn-secondary px-4 py-2 text-xs">Add</button>
            </div>
          </div>

          {/* Countries */}
          <div className="glass p-5">
            <label className="label-dark">Available in ({selectedCountries.length} selected)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 mt-2 max-h-60 overflow-y-auto pr-1">
              {countriesList.map(c => {
                const info = COUNTRIES[c]
                return (
                  <button type="button" key={c} onClick={() => toggleCountry(c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${selectedCountries.includes(c) ? 'border-violet-500 bg-violet-600/20 text-violet-300' : 'border-white/10 bg-white/5 text-slate-400 hover:border-violet-500/30'}`}>
                    {info.flag} {c}
                  </button>
                )
              })}
            </div>
            <button type="button" onClick={() => setSelectedCountries(countriesList)}
              className="text-xs text-violet-400 hover:text-violet-300 mt-2 transition">Select all</button>
          </div>

          {error && <div className="glass border border-red-500/30 text-red-300 px-5 py-3 text-sm rounded-2xl">{error}</div>}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base font-bold disabled:opacity-60">
            {submitting ? 'Publishing...' : '🚀 Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
