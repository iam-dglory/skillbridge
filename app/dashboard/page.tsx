'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES, CATEGORY_META, getMaxPrice } from '@/lib/ppp'

function DashboardContent() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [tab, setTab] = useState<'purchases' | 'listings' | 'profile'>('purchases')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Profile edit fields
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('India')
  const [mobile, setMobile] = useState('')
  const [calendlyUrl, setCalendlyUrl] = useState('')
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login?redirect=/dashboard'); return }
      const [{ data: u }, { data: o }, { data: l }] = await Promise.all([
        supabase.from('users').select('*').eq('id', session.user.id).single(),
        supabase.from('orders').select('*, listings(title,category)').eq('buyer_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('listings').select('*, orders(id), listing_views(id)').eq('seller_id', session.user.id).order('created_at', { ascending: false }),
      ])
      setUser({ ...u, id: session.user.id })
      setOrders(o ?? [])
      setListings(l ?? [])
      // Populate edit fields
      setName(u?.name ?? '')
      setUsername(u?.username ?? '')
      setBio(u?.bio ?? '')
      setCountry(u?.country ?? 'India')
      setMobile(u?.mobile ?? '')
      setCalendlyUrl(u?.calendly_url ?? '')
      setAvatar(u?.avatar_url ?? '🌟')
      setLoading(false)
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('users').update({
      name, username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio, country, mobile, calendly_url: calendlyUrl, avatar_url: avatar,
    }).eq('id', user.id)
    setSaveMsg('Profile saved!')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-violet-300 animate-pulse pt-20">Loading...</div>
  if (!user) return null

  const AVATARS = ['🌟', '🚀', '🎯', '🦄', '🔥', '💡', '🎨', '🎵', '🏄', '🧠', '🌈', '⚡']

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {params.get('order') === 'success' && (
          <div className="glass border border-green-500/30 text-green-300 rounded-2xl p-4 mb-5 text-sm">🎉 Payment successful! The seller will be in touch.</div>
        )}
        {params.get('listing') === 'created' && (
          <div className="glass border border-violet-500/30 text-violet-300 rounded-2xl p-4 mb-5 text-sm">🚀 Listing is live! Buyers across 25 countries can now find you.</div>
        )}

        {/* Profile header */}
        <div className="glass p-5 mb-6 flex items-center gap-4">
          <span className="text-5xl">{user.avatar_url || '👤'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-black text-white text-lg">{user.name}</div>
            {user.username && <div className="text-violet-400 text-sm">@{user.username}</div>}
            <div className="text-slate-400 text-xs mt-0.5">{COUNTRIES[user.country]?.flag} {user.country}</div>
            {user.bio && <div className="text-slate-400 text-xs mt-1 line-clamp-2">{user.bio}</div>}
          </div>
          <div className="text-right shrink-0 space-y-1">
            <div className="text-xs text-slate-500">Purchases</div>
            <div className="text-2xl font-black gradient-text">{orders.length}</div>
            <div className="text-xs text-slate-500 mt-2">Listings</div>
            <div className="text-2xl font-black gradient-text">{listings.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['purchases','🛒 Purchases'], ['listings','📦 My Skills'], ['profile','⚙️ Edit Profile']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${tab === t ? 'bg-violet-600 text-white' : 'glass text-slate-300 hover:text-violet-300'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* PURCHASES TAB */}
        {tab === 'purchases' && (
          orders.length === 0 ? (
            <div className="glass text-center py-16">
              <div className="text-4xl mb-3">🛒</div>
              <div className="font-semibold text-white mb-1">No purchases yet</div>
              <a href="/browse" className="text-sm text-violet-400 hover:underline">Browse skills →</a>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => {
                const cat = CATEGORY_META[o.listings?.category ?? '']
                return (
                  <div key={o.id} className="glass p-4 flex items-center gap-3">
                    <span className="text-2xl">{cat?.icon ?? '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{o.listings?.title}</div>
                      <div className="text-xs text-slate-400">{o.listings?.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="card-price text-sm">{o.local_currency} {Math.round(o.price_local).toLocaleString()}</div>
                      <div className={`text-xs mt-0.5 font-semibold ${o.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {o.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* LISTINGS + INSIGHTS TAB */}
        {tab === 'listings' && (
          <div>
            <div className="mb-4">
              <a href="/sell" className="btn-primary text-xs px-5 py-2.5 inline-block">+ New Listing</a>
            </div>
            {listings.length === 0 ? (
              <div className="glass text-center py-16">
                <div className="text-4xl mb-3">📦</div>
                <div className="font-semibold text-white mb-1">No listings yet</div>
                <div className="text-xs text-slate-400">Share a skill and start earning globally</div>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(l => {
                  const cat = CATEGORY_META[l.category]
                  const views   = l.listing_views?.length ?? 0
                  const sales   = l.orders?.length ?? 0
                  const ctr     = views > 0 ? ((sales / views) * 100).toFixed(1) : '0.0'
                  const engage: string[] = l.engagement_types ?? []
                  return (
                    <div key={l.id} className="glass p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-3xl">{cat?.icon ?? '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm truncate">{l.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{l.category} · {l.delivery_days}d delivery · {l.available_countries?.length ?? 0} markets</div>
                          {engage.length > 0 && (
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {engage.map((e: string) => (
                                <span key={e} className={e==='Freelance'?'badge-freelance':e==='Part-time'?'badge-parttime':'badge-longterm'}>{e}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${l.is_active?'bg-green-900/30 text-green-400':'bg-white/5 text-slate-400'}`}>
                          {l.is_active ? '● Live' : '○ Draft'}
                        </span>
                      </div>

                      {/* Insights bar */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Views',       val: views,    icon: '👁️' },
                          { label: 'Sales',        val: sales,    icon: '🛒' },
                          { label: 'Conversion',  val: `${ctr}%`, icon: '📈' },
                          { label: 'Countries',   val: l.available_countries?.length ?? 0, icon: '🌍' },
                        ].map(s => (
                          <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-base mb-0.5">{s.icon}</div>
                            <div className="text-white font-black text-sm">{s.val}</div>
                            <div className="text-slate-500 text-[10px]">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Price breakdown */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(l.available_countries ?? []).slice(0, 6).map((c: string) => {
                          const p = getMaxPrice(l.category, c)
                          return (
                            <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-violet-900/30 text-violet-300 border border-violet-700/20">
                              {COUNTRIES[c]?.flag} {p.formatted}
                            </span>
                          )
                        })}
                        {(l.available_countries?.length ?? 0) > 6 && (
                          <span className="text-xs px-2 py-0.5 text-slate-500">+{l.available_countries.length - 6} more</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE EDIT TAB */}
        {tab === 'profile' && (
          <div className="glass p-6 space-y-5">
            <h2 className="font-black text-white text-base mb-4">Edit your profile</h2>

            {/* Avatar picker */}
            <div>
              <label className="label-dark">Avatar emoji</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVATARS.map(a => (
                  <button key={a} type="button" onClick={() => setAvatar(a)}
                    className={`text-2xl p-2 rounded-xl transition ${avatar === a ? 'bg-violet-600/40 ring-2 ring-violet-500' : 'bg-white/5 hover:bg-white/10'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-dark">Display name</label>
                <input className="input-dark" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="label-dark">Username</label>
                <div className="flex items-center input-dark pr-0 overflow-hidden">
                  <span className="text-slate-500 px-3">@</span>
                  <input className="flex-1 bg-transparent outline-none py-0 px-0 text-slate-200 placeholder:text-slate-600"
                    value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="yourname" maxLength={30} />
                </div>
              </div>
            </div>

            <div>
              <label className="label-dark">Bio <span className="text-slate-600 font-normal">(shown on your listings)</span></label>
              <textarea className="input-dark resize-none" rows={3} value={bio}
                onChange={e => setBio(e.target.value.slice(0, 300))} placeholder="Tell buyers about yourself..." />
              <div className="text-xs text-slate-600 mt-1">{bio.length}/300</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-dark">Country</label>
                <select className="input-dark" value={country} onChange={e => setCountry(e.target.value)}>
                  {Object.entries(COUNTRIES).map(([c, i]) => (
                    <option key={c} value={c} style={{ background: '#1a0533' }}>{i.flag} {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-dark">Mobile (with country code)</label>
                <input className="input-dark" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 98765 43210" type="tel" />
              </div>
            </div>

            <div>
              <label className="label-dark">Calendly link <span className="text-slate-600 font-normal">(optional — lets buyers book meetings with you)</span></label>
              <input className="input-dark" value={calendlyUrl} onChange={e => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/yourname" type="url" />
              <p className="text-xs text-slate-600 mt-1">Create a free Calendly at calendly.com → share the link here.</p>
            </div>

            {saveMsg && <div className="text-green-400 text-sm font-semibold">✓ {saveMsg}</div>}

            <button onClick={saveProfile} disabled={saving} className="btn-primary px-8 py-2.5 text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-violet-300 animate-pulse">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
