'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META, getMaxPrice } from '@/lib/ppp'
import CheckoutButton from '@/components/CheckoutButton'
import WishlistButton from '@/components/WishlistButton'
import ReviewSection from '@/components/ReviewSection'
import Link from 'next/link'

const ENGAGE_LABELS: Record<string,string> = {
  'Freelance':'⚡ Freelance','Part-time':'🕐 Part-time','Long-term':'🔗 Long-term'
}

export default function ListingPage() {
  const { id } = useParams()
  const supabase = createClient()

  const [listing, setListing] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [country, setCountry] = useState('India')
  const [liveRates, setLiveRates] = useState<Record<string,number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const c = p.get('country')
    if (c && COUNTRIES[c]) setCountry(c)
    else import('@/lib/ppp').then(m => m.detectCountryFromIP().then(setCountry))

    if (!id) return
    supabase.from('listings').select('*').eq('id', id as string).single().then(({ data }) => {
      if (!data) { setLoading(false); return }
      setListing(data)
      supabase.from('users').select('id,name,avatar_url,bio,country,username,calendly_url').eq('id', data.seller_id).single()
        .then(({ data: s }) => setSeller(s))
      // Track view
      supabase.from('listing_views').insert({ listing_id: data.id, viewer_id: null })
      setLoading(false)
    })

    // Live rates
    fetch('/api/currency-rates').then(r => r.json()).then(d => setLiveRates(d.rates ?? {}))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20 text-violet-300 animate-pulse">Loading...</div>
  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="glass p-10 text-center">
        <div className="text-4xl mb-3">😕</div>
        <div className="font-bold text-white mb-2">Listing not found</div>
        <Link href="/browse" className="btn-primary px-6 py-2 text-sm inline-block mt-2">Browse Skills</Link>
      </div>
    </div>
  )

  const meta = CATEGORY_META[listing.category] ?? { icon: '🔧', grad: 'from-violet-500 to-cyan-500' }
  const engagements: string[] = listing.engagement_types ?? []
  const countryInfo = COUNTRIES[country]
  const baseUsd = meta.base ?? 100
  const liveLocal = liveRates[countryInfo?.currency]
    ? Math.round(baseUsd * (countryInfo?.multiplier ?? 0.1) * liveRates[countryInfo.currency])
    : null
  const pricing = getMaxPrice(listing.category, country)

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/browse" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-300 transition mb-5">← Back</Link>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Main */}
          <div className="md:col-span-2 space-y-4">
            <div className="glass p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.grad} flex items-center justify-center text-2xl shrink-0`}>{meta.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-lg font-black text-white leading-snug">{listing.title}</h1>
                    <WishlistButton listingId={listing.id} />
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{listing.category} · {listing.delivery_days}d delivery · {listing.available_countries?.length} markets</p>
                </div>
              </div>
              {engagements.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {engagements.map((e:string) => (
                    <span key={e} className={e==='Freelance'?'badge-freelance':e==='Part-time'?'badge-parttime':'badge-longterm'}>{ENGAGE_LABELS[e]??e}</span>
                  ))}
                </div>
              )}
              {listing.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {listing.tags.map((t:string) => <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-violet-900/30 text-violet-300 border border-violet-700/20">{t}</span>)}
                </div>
              )}
            </div>

            <div className="glass p-6">
              <h2 className="font-bold text-xs uppercase tracking-wider text-violet-400 mb-3">About this service</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {seller && (
              <div className="glass p-6">
                <h2 className="font-bold text-xs uppercase tracking-wider text-violet-400 mb-4">About the seller</h2>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{seller.avatar_url || '👤'}</span>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{seller.name}</div>
                    {seller.username && <div className="text-violet-400 text-xs">@{seller.username}</div>}
                    <div className="text-slate-500 text-xs">{COUNTRIES[seller.country]?.flag} {seller.country}</div>
                    {seller.bio && <p className="text-slate-400 text-xs mt-2 leading-relaxed">{seller.bio}</p>}
                  </div>
                  <Link href={`/messages?with=${seller.id}`} className="btn-secondary text-xs px-3 py-1.5 shrink-0">
                    💬 Message
                  </Link>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection listingId={listing.id} sellerId={listing.seller_id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass p-5">
              <label className="label-dark">Your country</label>
              <select className="input-dark mt-1" value={country} onChange={e => setCountry(e.target.value)}>
                {listing.available_countries.map((c:string) => (
                  <option key={c} value={c} style={{ background: '#1a0533' }}>{COUNTRIES[c]?.flag ?? ''} {c}</option>
                ))}
              </select>

              <div className="mt-4 text-center">
                <div className="card-price text-2xl">
                  {pricing.currency} {liveLocal ? liveLocal.toLocaleString() : Math.round(pricing.local).toLocaleString()}
                </div>
                {liveRates[countryInfo?.currency] && (
                  <div className="text-xs text-cyan-400/70 mt-0.5">
                    Live rate: 1 USD = {liveRates[countryInfo.currency]?.toLocaleString(undefined,{maximumFractionDigits:2})} {countryInfo?.currency}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-0.5">~${pricing.usd} USD base · PPP adjusted</div>
              </div>
            </div>

            <div className="glass p-5 space-y-3">
              <CheckoutButton
                listingId={listing.id} country={country}
                title={listing.title}
                priceLocal={liveLocal ?? pricing.local}
                currency={pricing.currency}
              />
              <Link href={`/book-call/${listing.id}?country=${country}`} className="btn-secondary w-full text-center text-sm py-2.5 block">
                📞 Book a Call
              </Link>
              {seller?.calendly_url && (
                <a href={seller.calendly_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs py-2.5 rounded-xl border border-cyan-700/30 bg-cyan-900/10 text-cyan-300 hover:bg-cyan-900/20 transition w-full">
                  📅 Schedule via Calendly
                </a>
              )}
              {seller && (
                <Link href={`/messages?with=${seller.id}`} className="flex items-center justify-center gap-2 text-xs py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition w-full">
                  💬 Message seller
                </Link>
              )}
            </div>

            <div className="glass p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2.5"><span className="text-xl">⚡</span><div><div className="text-white font-semibold text-xs">{listing.delivery_days}-day delivery</div><div className="text-slate-500 text-[10px]">From order confirmation</div></div></div>
              <div className="flex items-center gap-2.5"><span className="text-xl">🔒</span><div><div className="text-white font-semibold text-xs">Secure checkout</div><div className="text-slate-500 text-[10px]">Stripe · Razorpay UPI</div></div></div>
              <div className="flex items-center gap-2.5"><span className="text-xl">💱</span><div><div className="text-white font-semibold text-xs">Live pricing</div><div className="text-slate-500 text-[10px]">Updated with real exchange rates</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
