import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { COUNTRIES, CATEGORY_META, getMaxPrice } from '@/lib/ppp'
import CheckoutButton from '@/components/CheckoutButton'
import WishlistButton from '@/components/WishlistButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const ENGAGE_LABELS: Record<string, string> = {
  'Freelance': '⚡ Freelance',
  'Part-time': '🕐 Part-time',
  'Long-term': '🔗 Long-term',
}

export default async function ListingPage({ params, searchParams }: { params: { id: string }; searchParams: { country?: string } }) {
  const supabase = createClient(cookies())
  const { data: listing } = await supabase.from('listings').select('*, users(name,avatar_url,bio,country)').eq('id', params.id).single()
  if (!listing) notFound()

  const country = searchParams.country ?? listing.available_countries[0] ?? 'India'
  const pricing = getMaxPrice(listing.category, country)
  const meta = CATEGORY_META[listing.category] ?? { icon: '🔧', grad: 'from-violet-500 to-cyan-500' }
  const engagements: string[] = (listing as any).engagement_types ?? []

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-300 transition mb-6">
          ← Back to Browse
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* Header card */}
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
                  <p className="text-slate-400 text-sm mt-1">{listing.category} · {listing.delivery_days} day delivery</p>
                </div>
              </div>

              {/* Engagement types */}
              {engagements.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {engagements.map(e => (
                    <span key={e} className={
                      e === 'Freelance' ? 'badge-freelance' :
                      e === 'Part-time' ? 'badge-parttime' : 'badge-longterm'
                    }>{ENGAGE_LABELS[e] ?? e}</span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {listing.tags && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((t: string) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-violet-900/40 text-violet-300 border border-violet-700/30">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass p-6">
              <h2 className="font-bold text-white mb-3 text-sm uppercase tracking-wider text-violet-300">About this service</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{listing.description}</p>
            </div>

            {/* Seller */}
            {listing.users && (
              <div className="glass p-6">
                <h2 className="font-bold text-sm uppercase tracking-wider text-violet-300 mb-4">About the seller</h2>
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{(listing.users as any).avatar_url || '👤'}</span>
                  <div>
                    <div className="font-bold text-white">{(listing.users as any).name}</div>
                    <div className="text-sm text-slate-400">{COUNTRIES[(listing.users as any).country]?.flag} {(listing.users as any).country}</div>
                    {(listing.users as any).bio && (
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{(listing.users as any).bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Country selector */}
            <div className="glass p-5">
              <label className="label-dark mb-2">Your country</label>
              <select
                className="input-dark"
                defaultValue={country}
                onChange={e => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('country', e.target.value)
                  window.location.href = url.toString()
                }}
              >
                {listing.available_countries.map((c: string) => (
                  <option key={c} value={c} style={{ background: '#1a0533' }}>
                    {COUNTRIES[c]?.flag} {c}
                  </option>
                ))}
              </select>

              <div className="mt-4 text-center">
                <div className="card-price text-2xl">{pricing.currency} {Math.round(pricing.local).toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">PPP-adjusted · ≈ ${pricing.usd} USD base</div>
              </div>
            </div>

            {/* Buy / UPI */}
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

            {/* Delivery & markets */}
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
