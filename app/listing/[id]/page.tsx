'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META, getMaxPrice } from '@/lib/ppp'
import CheckoutButton from '@/components/CheckoutButton'
import WishlistButton from '@/components/WishlistButton'
import Link from 'next/link'

const ENGAGE_LABELS: Record<string, string> = {
  'Freelance': '⚡ Freelance',
  'Part-time': '🕐 Part-time',
  'Long-term': '🔗 Long-term',
}

export default function ListingPage() {
  const { id } = useParams()
  const supabase = createClient()

  const [listing, setListing] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [country, setCountry] = useState('India')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auto-detect country from URL param or IP
    const params = new URLSearchParams(window.location.search)
    const urlCountry = params.get('country')
    if (urlCountry && COUNTRIES[urlCountry]) {
      setCountry(urlCountry)
    } else {
      import('@/lib/ppp').then(m => m.detectCountryFromIP().then(c => setCountry(c)))
    }
  }, [])

  useEffect(() => {
    if (!id) return
    supabase
      .from('listings')
      .select('*')
      .eq('id', id as string)
      .single()
      .then(({ data }) => {
        if (!data) { setLoading(false); return }
        setListing(data)
        // Fetch seller separately
        supabase.from('users').select('name,avatar_url,bio,country').eq('id', data.seller_id).single()
          .then(({ data: s }) => setSeller(s))
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20 text-violet-300 animate-pulse">
      Loading listing...
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="glass text-center p-10">
        <div className="text-5xl mb-3">😕</div>
        <div className="font-bold text-white mb-2">Listing not found</div>
        <Link href="/browse" className="btn-primary px-6 py-2 text-sm inline-block mt-2">Browse Skills</Link>
      </div>
    </div>
  )

  const pricing = getMaxPrice(listing.category, country)
  const meta = CATEGORY_META[listing.category] ?? { icon: '🔧', grad: 'from-violet-500 to-cyan-500' }
  const engagements: string[] = listing.engagement_types ?? []

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-300 transition mb-6">
          ← Back to Browse
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main */}
          <div className="md:col-span-2 space-y-5">
            {/* Header */}
            <div className="glass p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.grad} flex items-center justify-center text-3xl shrink-0`}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-xl font-black text-white leading-snug">{listing.title}</h1>
                    <WishlistButton listingId={listing.id} />
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    {listing.category} · {listing.delivery_days} day delivery
                  </p>
                </div>
              </div>

              {engagements.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {engagements.map((e: string) => (
                    <span key={e} className={
                      e === 'Freelance' ? 'badge-freelance' :
                      e === 'Part-time' ? 'badge-parttime' : 'badge-longterm'
                    }>{ENGAGE_LABELS[e] ?? e}</span>
                  ))}
                </div>
              )}

              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((t: string) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-violet-900/40 text-violet-300 border border-violet-700/30">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass p-6">
              <h2 className="font-bold text-sm uppercase tracking-wider text-violet-300 mb-3">About this service</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{listing.description}</p>
            </div>

            {/* Seller */}
            {seller && (
              <div className="glass p-6">
                <h2 className="font-bold text-sm uppercase tracking-wider text-violet-300 mb-4">About the seller</h2>
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{seller.avatar_url || '👤'}</span>
                  <div>
                    <div className="font-bold text-white">{seller.name}</div>
                    <div className="text-sm text-slate-400">
                      {COUNTRIES[seller.country]?.flag ?? ''} {seller.country}
                    </div>
                    {seller.bio && (
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{seller.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Country + price */}
            <div className="glass p-5">
              <label className="label-dark">Your country</label>
              <select
                className="input-dark mt-1"
                value={country}
                onChange={e => {
                  setCountry(e.target.value)
                  const url = new URL(window.location.href)
                  url.searchParams.set('country', e.target.value)
                  window.history.replaceState({}, '', url.toString())
                }}
              >
                {listing.available_countries.map((c: string) => (
                  <option key={c} value={c} style={{ background: '#1a0533' }}>
                    {COUNTRIES[c]?.flag ?? ''} {c}
                  </option>
                ))}
              </select>

              <div className="mt-4 text-center">
                <div className="card-price text-2xl">{pricing.currency} {Math.round(pricing.local).toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">PPP-adjusted · ~${pricing.usd} USD base</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="glass p-5 space-y-3">
              <CheckoutButton
                listingId={listing.id}
                country={country}
                title={listing.title}
                priceLocal={pricing.local}
                currency={pricing.currency}
              />
              <Link
                href={`/book-call/${listing.id}?country=${country}`}
                className="btn-secondary w-full text-center text-sm py-3 block"
              >
                📞 Book a Free Intro Call
              </Link>
            </div>

            {/* Info */}
            <div className="glass p-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="text-white font-semibold">{listing.delivery_days}-day delivery</div>
                  <div className="text-slate-400 text-xs">From order confirmation</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">🌍</span>
                <div>
                  <div className="text-white font-semibold">{listing.available_countries.length} markets</div>
                  <div className="text-slate-400 text-xs">PPP-priced per country</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="text-white font-semibold">Secure payment</div>
                  <div className="text-slate-400 text-xs">Stripe · Razorpay UPI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
