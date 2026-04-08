'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META } from '@/lib/ppp'

const ENGAGEMENT_OPTIONS = ['Freelance', 'Part-time', 'Long-term']
const ALL_TAGS = [
  'Python', 'React', 'Node.js', 'Next.js', 'TypeScript', 'JavaScript',
  'Figma', 'Canva', 'Photoshop', 'Illustrator',
  'SEO', 'Copywriting', 'Blog Writing', 'Translation',
  'Video Editing', 'Thumbnail Design', 'YouTube', 'TikTok',
  'AI', 'ChatGPT', 'Automation', 'WordPress', 'Shopify', 'Branding',
]

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

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  const addCustomTag = () => {
    const t = customTag.trim()
    if (t && !selectedTags.includes(t) && selectedTags.length < 10) {
      setSelectedTags(prev => [...prev, t])
    }
    setCustomTag('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!category) { setError('Please select a category.'); return }
    if (!description.trim()) { setError('Please write a description.'); return }
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
    }, { onConflict: 'id' })

    const { error: insertError } = await supabase.from('listings').insert({
      seller_id: session.user.id,
      title: title.trim(),
      category,
      description: description.trim(),
      delivery_days: deliveryDays,
      available_countries: selectedCountries,
      engagement_types: selectedEngagements,
      tags: selectedTags,
      is_active: true,
      featured: false,
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }
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
            <div className="text-xs text-slate-500 mt-1">{title.length}/100</div>
          </div>

          {/* Category */}
          <div className="glass p-5">
            <label className="label-dark">Category *</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {cats.map(([key, meta]) => (
                <button type="button" key={key}
                  onClick={() => setCategory(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition border text-left ${category === key ? 'border-violet-500 bg-violet-600/20 text-violet-300' : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/40'}`}>
                  <span className="text-2xl">{meta.icon}</span>
                  <span>{key}</span>
                  {category === key && <span className="ml-auto text-violet-400">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement types */}
          <div className="glass p-5">
            <label className="label-dark">Engagement type *</label>
            <p className="text-xs text-slate-500 mb-3">Select all that apply — buyers can filter by this.</p>
            <div className="flex gap-3 flex-wrap">
              {ENGAGEMENT_OPTIONS.map(e => (
                <button type="button" key={e}
                  onClick={() => toggleItem(selectedEngagements, setSelectedEngagements, e)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition border ${selectedEngagements.includes(e) ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/40'}`}>
                  {e === 'Freelance' ? '⚡' : e === 'Part-time' ? '🕐' : '🔗'} {e}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="glass p-5">
            <label className="label-dark">Description *</label>
            <textarea className="input-dark resize-none" rows={5}
              placeholder="Describe what you offer, your process, what the buyer will receive, and any requirements..."
              value={description} onChange={e => setDescription(e.target.value.slice(0, 1000))} required />
            <div className="text-xs text-slate-500 mt-1">{description.length}/1000</div>
          </div>

          {/* Delivery days */}
          <div className="glass p-5">
            <label className="label-dark">Delivery time: <span className="text-violet-300">{deliveryDays} {deliveryDays === 1 ? 'day' : 'days'}</span></label>
            <input type="range" min={1} max={30} value={deliveryDays}
              onChange={e => setDeliveryDays(Number(e.target.value))}
              className="w-full mt-2 accent-violet-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 day</span><span>30 days</span>
            </div>
          </div>

          {/* Tags */}
          <div className="glass p-5">
            <label className="label-dark">Tags (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {ALL_TAGS.map(t => (
                <button type="button" key={t} onClick={() => toggleItem(selectedTags, setSelectedTags, t)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition border ${selectedTags.includes(t) ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/40'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-dark flex-1" placeholder="Add custom tag..."
                value={customTag} onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }} />
              <button type="button" onClick={addCustomTag} className="btn-secondary px-4 py-2 text-xs whitespace-nowrap">+ Add</button>
            </div>
          </div>

          {/* Countries */}
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="label-dark mb-0">{selectedCountries.length} countries selected</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedCountries(countriesList)}
                  className="text-xs text-violet-400 hover:text-violet-300 transition">All</button>
                <span className="text-slate-600">·</span>
                <button type="button" onClick={() => setSelectedCountries([])}
                  className="text-xs text-slate-400 hover:text-slate-300 transition">None</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {countriesList.map(c => {
                const info = COUNTRIES[c]
                return (
                  <button type="button" key={c} onClick={() => toggleItem(selectedCountries, setSelectedCountries, c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${selectedCountries.includes(c) ? 'border-violet-500 bg-violet-600/20 text-violet-300' : 'border-white/10 bg-white/5 text-slate-400 hover:border-violet-500/30'}`}>
                    {info.flag} {c}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="glass border border-red-500/30 text-red-300 px-5 py-3 text-sm rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="btn-primary w-full py-4 text-base font-bold disabled:opacity-60">
            {submitting ? '⏳ Publishing...' : '🚀 Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
