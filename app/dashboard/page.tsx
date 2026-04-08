'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META, getMaxPrice } from '@/lib/ppp'
import type { UserRow, OrderRow, ListingRow } from '@/types/database'

type OrderWithListing = OrderRow & { listings: Pick<ListingRow, 'title' | 'category'> }
type ListingWithOrders = ListingRow & { orders: { id: string }[] }

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [user, setUser] = useState<UserRow | null>(null)
  const [orders, setOrders] = useState<OrderWithListing[]>([])
  const [listings, setListings] = useState<ListingWithOrders[]>([])
  const [tab, setTab] = useState<'purchases' | 'listings'>('purchases')
  const [loading, setLoading] = useState(true)

  const showSuccess = searchParams.get('order') === 'success'
  const listingCreated = searchParams.get('listing') === 'created'

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login?redirect=/dashboard'); return }
      const [{ data: userData }, { data: ordersData }, { data: listingsData }] = await Promise.all([
        supabase.from('users').select('*').eq('id', session.user.id).single(),
        supabase.from('orders').select('*, listings(title, category)').eq('buyer_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('listings').select('*, orders(id)').eq('seller_id', session.user.id).order('created_at', { ascending: false }),
      ])
      setUser(userData)
      setOrders((ordersData as OrderWithListing[]) ?? [])
      setListings((listingsData as ListingWithOrders[]) ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-violet-300 animate-pulse pt-20">Loading your dashboard...</div>
  if (!user) return null

  const countryFlag = COUNTRIES[user.country]?.flag ?? ''

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {showSuccess && (
          <div className="glass border border-green-500/30 text-green-300 rounded-2xl p-4 mb-6 text-sm font-semibold">
            🎉 Order placed successfully! The seller will be in touch soon.
          </div>
        )}
        {listingCreated && (
          <div className="glass border border-violet-500/30 text-violet-300 rounded-2xl p-4 mb-6 text-sm font-semibold">
            🚀 Your listing is live! Buyers in your selected countries can now find and hire you.
          </div>
        )}

        {/* Profile card */}
        <div className="glass p-6 mb-7 flex items-center gap-5 bg-gradient-to-br from-violet-900/40 to-cyan-900/20">
          <span className="text-5xl">{user.avatar_url || '👤'}</span>
          <div>
            <h1 className="text-xl font-black text-white">{user.name}</h1>
            <div className="text-violet-300 text-sm">{user.email}</div>
            <div className="text-slate-400 text-sm">{countryFlag} {user.country}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-black gradient-text">{orders.length}</div>
            <div className="text-xs text-slate-400">Purchases</div>
            <div className="text-3xl font-black gradient-text mt-2">{listings.length}</div>
            <div className="text-xs text-slate-400">Listings</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[['purchases', '🛒 My Purchases'], ['listings', '📦 My Listings']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab === t ? 'bg-violet-600 text-white' : 'glass text-slate-300 hover:text-violet-300'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'purchases' && (
          orders.length === 0 ? (
            <div className="glass text-center py-20">
              <div className="text-5xl mb-3">🛒</div>
              <div className="font-semibold text-white mb-1">No purchases yet</div>
              <a href="/browse" className="mt-2 inline-block text-sm text-violet-400 hover:underline">Browse skills</a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const cat = CATEGORY_META[order.listings?.category ?? '']
                return (
                  <div key={order.id} className="glass p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat?.grad ?? 'from-violet-500 to-cyan-500'} flex items-center justify-center text-2xl shrink-0`}>
                      {cat?.icon ?? '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{order.listings?.title}</div>
                      <div className="text-sm text-slate-400">{order.listings?.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="card-price">{order.local_currency} {Math.round(order.price_local).toLocaleString()}</div>
                      <div className={`text-xs font-semibold mt-0.5 ${order.status === 'paid' || order.status === 'delivered' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {order.status === 'paid' ? '✓ Paid' : order.status === 'delivered' ? '✓ Delivered' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {tab === 'listings' && (
          <div>
            <div className="mb-4">
              <a href="/sell" className="btn-primary text-sm px-5 py-2.5 inline-block">+ Add new listing</a>
            </div>
            {listings.length === 0 ? (
              <div className="glass text-center py-20">
                <div className="text-5xl mb-3">📦</div>
                <div className="font-semibold text-white mb-1">No listings yet</div>
                <div className="text-sm text-slate-400">Share your skills with the world</div>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(l => {
                  const cat = CATEGORY_META[l.category]
                  const engagements: string[] = (l as any).engagement_types ?? []
                  return (
                    <div key={l.id} className="glass p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{cat?.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-white">{l.title}</div>
                          <div className="text-sm text-slate-400">{l.category} · {l.available_countries.length} markets · {l.delivery_days}d delivery</div>
                          <div className="text-xs text-slate-500 mt-0.5">{l.orders?.length ?? 0} orders received</div>
                          {engagements.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {engagements.map(e => (
                                <span key={e} className={e === 'Freelance' ? 'badge-freelance' : e === 'Part-time' ? 'badge-parttime' : 'badge-longterm'}>
                                  {e}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${l.is_active ? 'bg-green-900/30 text-green-400' : 'bg-white/5 text-slate-400'}`}>
                          {l.is_active ? '● Live' : '○ Draft'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {l.available_countries.map(c => {
                          const p = getMaxPrice(l.category, c)
                          return (
                            <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-violet-900/30 text-violet-300 border border-violet-700/20">
                              {COUNTRIES[c]?.flag} {c}: {p.formatted}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-violet-300 animate-pulse">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
