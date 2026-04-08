'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']

function getTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function BookCallPage() {
  const { listingId } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [listing, setListing] = useState<any>(null)
  const [date, setDate] = useState(getTomorrow())
  const [time, setTime] = useState('10:00')
  const [mobile, setMobile] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('listings').select('*, users(name,avatar_url)').eq('id', listingId as string).single()
      .then(({ data }) => setListing(data))
  }, [listingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!mobile || mobile.length < 7) { setError('Please enter a valid mobile number.'); return }
    setSubmitting(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    // Save mobile to user profile
    await supabase.from('users').update({ mobile }).eq('id', session.user.id)

    // Save call booking
    await supabase.from('call_bookings').insert({
      listing_id: listingId,
      buyer_id: session.user.id,
      seller_id: listing.users?.id ?? listing.seller_id,
      scheduled_date: date,
      scheduled_time: time,
      message,
    })

    setDone(true)
    setSubmitting(false)
  }

  if (!listing) return (
    <div className="min-h-screen pt-40 flex items-center justify-center text-violet-300 animate-pulse">Loading...</div>
  )

  if (done) return (
    <div className="min-h-screen pt-40 flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-black text-white mb-2">Call request sent!</h2>
        <p className="text-slate-400 text-sm mb-6">
          {listing.users?.name ?? 'The seller'} will confirm your call for <strong className="text-violet-300">{date} at {time}</strong>.
          We'll notify you by email.
        </p>
        <a href="/dashboard" className="btn-primary px-8 py-2.5">Go to Dashboard</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-lg mx-auto">
        <a href={`/listing/${listingId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-300 transition mb-6">
          ← Back to listing
        </a>

        <div className="glass p-6 mb-5">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{listing.users?.avatar_url || '👤'}</span>
            <div>
              <div className="font-bold text-white">{listing.users?.name ?? 'Seller'}</div>
              <div className="text-sm text-slate-400">wants to learn more about your project</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-violet-300 font-semibold line-clamp-2">📋 {listing.title}</div>
        </div>

        <div className="glass p-6">
          <h1 className="text-xl font-black text-white mb-1">Book a Free Intro Call</h1>
          <p className="text-slate-400 text-sm mb-6">No commitment. Just a 15-minute call to see if it's a great fit.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-dark">Preferred date</label>
              <input
                type="date"
                className="input-dark"
                value={date}
                min={getTomorrow()}
                onChange={e => setDate(e.target.value)}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label className="label-dark">Preferred time (your timezone)</label>
              <select className="input-dark" value={time} onChange={e => setTime(e.target.value)}>
                {TIMES.map(t => <option key={t} value={t} style={{ background: '#1a0533' }}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="label-dark">Your mobile number (with country code)</label>
              <input
                type="tel"
                className="input-dark"
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500 mt-1">So the seller can reach you. Stored securely.</p>
            </div>

            <div>
              <label className="label-dark">What do you need help with? (optional)</label>
              <textarea
                className="input-dark resize-none"
                rows={3}
                placeholder="Briefly describe your project or question..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            {error && <div className="text-red-400 text-sm bg-red-900/20 rounded-xl px-4 py-3">{error}</div>}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
              {submitting ? 'Booking...' : '📞 Confirm Call Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
