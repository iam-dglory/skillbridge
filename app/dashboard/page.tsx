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

  if (loading) return <div className="text-center py-20 text-gray-400">Loading your dashboard...</div>
  if (!user) return null

  const countryFlag = COUNTRIES[user.country]?.flag ?? ''

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 mb-6 text-sm font-medium">
          🎉 Order placed successfully! The seller will be in touch soon.
        </div>
      )}
      {listingCreated && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl p-4 mb-6 text-sm font-medium">
          🚀 Your listing is live! Buyers in your selected countries can now find and hire you.
        </div>
      )}

      {/* Profile card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-7 flex items-center gap-5">
        <span className="text-5xl">{user.avatar_url || '👤'}</span>
        <div>
          <h1 className="text-xl font-black">{user.name}</h1>
          <div className="text-indigo-200 text-sm">{user.email}</div>
          <div className="text-indigo-200 text-sm">{countryFlag} {user.country}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black">{orders.length}</div>
          <div className="text-xs text-indigo-200">Purchases</div>
          <div className="text-2xl font-black mt-2">{listings.length}</div>
          <div className="text-xs text-indigo-200">Listings</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[['purchases', '🛒 My Purchases'], ['listings', '📦 My Listings']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'purchases' && (
        orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
            <div className="text-5xl mb-3">🛒</div>
            <div className="font-semibold">No purchases yet</div>
            <a href="/browse" className="mt-2 inline-block text-sm text-indigo-500 hover:underline">Browse skills</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cat = CATEGORY_META[order.listings?.category ?? '']
              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat?.grad ?? 'from-gray-400 to-gray-500'} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {cat?.icon ?? '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{order.listings?.title}</div>
                    <div className="text-sm text-gray-500">{order.listings?.category}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-indigo-600">{order.local_currency} {Math.round(order.price_local).toLocaleString()}</div>
                    <div className={`text-xs font-semibold mt-0.5 ${order.status === 'paid' || order.status === 'delivered' ? 'text-green-500' : 'text-yellow-500'}`}>
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
            <a href="/sell" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition inline-block">
              + Add new listing
            </a>
          </div>
          {listings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
              <div className="text-5xl mb-3">📦</div>
              <div className="font-semibold">No listings yet</div>
              <div className="text-sm mt-1">Share your skills with the world</div>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(l => {
                const cat = CATEGORY_META[l.category]
                return (
                  <div key={l.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{cat?.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{l.title}</div>
                        <div className="text-sm text-gray-500">{l.category} · {l.available_countries.length} markets · {l.delivery_days}d delivery</div>
                        <div className="text-xs text-gray-400 mt-0.5">{l.orders?.length ?? 0} orders received</div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${l.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {l.is_active ? '● Live' : '○ Draft'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {l.available_countries.map(c => {
                        const p = getMaxPrice(l.category, c)
                        return (
                          <span key={c} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cat?.bg} ${cat?.text}`}>
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
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
