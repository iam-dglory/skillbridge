'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META, CATEGORY_BASE_PRICES, getMaxPrice } from '@/lib/ppp'
import type { UserRow } from '@/types/database'

const CATEGORIES = Object.keys(CATEGORY_META)

export default function SellPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', category: '', description: '',
    portfolio: ['', '', ''],
    countries: [] as string[],
    deliveryDays: 3,
    tags: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login?redirect=/sell'); return }
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      setUser(data)
      setLoading(false)
    })
  }, [])

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const toggleCountry = (c: string) =>
    set('countries', form.countries.includes(c) ? form.countries.filter(x => x !== c) : [...form.countries, c])

  const canNext1 = form.category && form.title.trim() && form.description.trim()
  const canNext2 = form.countries.length > 0

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        title: form.title,
        category: form.category,
        description: form.description,
        delivery_days: form.deliveryDays,
        available_countries: form.countries,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_active: true,
        featured: false,
      })
      .select()
      .single()

    if (error || !listing) { setSubmitting(false); alert('Error creating listing. Please try again.'); return }

    // Insert portfolio items
    const portfolioItems = form.portfolio.filter(Boolean).map(title => ({
      listing_id: listing.id,
      title,
      type: 'link' as const,
    }))
    if (portfolioItems.length) {
      await supabase.from('portfolio_items').insert(portfolioItems)
    }

    router.push('/dashboard?listing=created')
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-1">List your skill</h1>
      <p className="text-gray-500 mb-7">Reach global buyers at PPP-fair prices</p>

      {/* Step bar */}
      <div className="flex items-center mb-2">
        {[1, 2, 3].map((s, i) => (
          <span key={s} className="flex items-center flex-1">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
              {step > s ? '✓' : s}
            </span>
            {i < 2 && <span className={`flex-1 h-1 mx-1 rounded transition-all ${step > s ? 'bg-indigo-600' : 'bg-gray-100'}`} />}
          </span>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mb-8 px-1">
        <span>Skill details</span><span>Target markets</span><span>Review & publish</span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Choose a category *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map(c => {
                const d = CATEGORY_META[c]
                return (
                  <button key={c} onClick={() => set('category', c)}
                    className={`p-4 rounded-2xl border-2 text-left transition ${form.category === c ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <span className="text-2xl block mb-1.5">{d.icon}</span>
                    <span className="font-bold text-sm text-gray-800 block">{c}</span>
                    <span className="text-xs text-gray-400">Max ${CATEGORY_BASE_PRICES[c]} in USA</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Listing title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Professional YouTube Video Editing"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
              placeholder="Describe your offering, process, and what makes your work stand out..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Portfolio examples</label>
            {form.portfolio.map((p, i) => (
              <input key={i} value={p}
                onChange={e => { const n = [...form.portfolio]; n[i] = e.target.value; set('portfolio', n) }}
                placeholder={`Example ${i + 1} — e.g. "Brand redesign for a fintech startup"`}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2" />
            ))}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="e.g. YouTube, Color Grading, Captions"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <button onClick={() => canNext1 && setStep(2)}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition ${canNext1 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Select countries to sell in</label>
            <p className="text-xs text-gray-400 mb-4">Your price will be capped at the PPP max for each country</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(COUNTRIES).map(([c, d]) => {
                const p = form.category ? getMaxPrice(form.category, c) : null
                const sel = form.countries.includes(c)
                return (
                  <button key={c} onClick={() => toggleCountry(c)}
                    className={`p-3 rounded-xl border-2 text-left transition ${sel ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <div className="text-sm font-semibold text-gray-800">{d.flag} {c}</div>
                    {p && <div className="text-xs text-indigo-500 mt-0.5 font-medium">Max {p.formatted}</div>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition">← Back</button>
            <button onClick={() => canNext2 && setStep(3)}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition ${canNext2 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h3 className="font-bold text-indigo-900 mb-3">Price caps for your listing</h3>
            <div className="space-y-2">
              {form.countries.map(c => {
                const p = getMaxPrice(form.category, c)
                return (
                  <div key={c} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{COUNTRIES[c].flag} {c}</span>
                    <span className="font-extrabold text-indigo-600">{p.formatted} {p.currency}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Delivery time (days)</label>
            <input type="number" min="1" max="60" value={form.deliveryDays}
              onChange={e => set('deliveryDays', parseInt(e.target.value) || 1)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3">Listing summary</h3>
            <div className="text-sm text-gray-600 space-y-1.5">
              <div><span className="font-semibold text-gray-800">Title:</span> {form.title}</div>
              <div><span className="font-semibold text-gray-800">Category:</span> {CATEGORY_META[form.category]?.icon} {form.category}</div>
              <div><span className="font-semibold text-gray-800">Markets:</span> {form.countries.map(c => COUNTRIES[c].flag).join(' ')} ({form.countries.length})</div>
              <div><span className="font-semibold text-gray-800">Delivery:</span> {form.deliveryDays} days</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition">← Back</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-extrabold transition">
              {submitting ? 'Publishing...' : '🚀 Publish Listing'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
