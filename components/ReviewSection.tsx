'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Review = { id: string; rating: number; comment: string; created_at: string; users: { name: string; avatar_url: string } }

function Stars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(i)}
          className={`text-xl transition ${(hover || rating) >= i ? 'text-amber-400' : 'text-slate-700'} ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >★</button>
      ))}
    </div>
  )
}

export default function ReviewSection({ listingId, sellerId }: { listingId: string; sellerId: string }) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [myId, setMyId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    // Load reviews
    supabase.from('reviews').select('*, users:reviewer_id(name,avatar_url)').eq('listing_id', listingId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews((data as any) ?? []))

    // Check if user has bought this listing
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setMyId(session.user.id)
      if (session.user.id === sellerId) return // seller can't review own listing
      const { data: order } = await supabase.from('orders').select('id').eq('buyer_id', session.user.id).eq('listing_id', listingId).maybeSingle()
      if (order) {
        const { data: existing } = await supabase.from('reviews').select('id').eq('reviewer_id', session.user.id).eq('listing_id', listingId).maybeSingle()
        setCanReview(!existing)
      }
    })
  }, [listingId])

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || submitting) return
    setSubmitting(true)
    // Find buyer's order
    const { data: order } = await supabase.from('orders').select('id').eq('buyer_id', myId).eq('listing_id', listingId).maybeSingle()
    if (!order) { setSubmitting(false); return }
    await supabase.from('reviews').insert({ order_id: order.id, reviewer_id: myId, listing_id: listingId, rating, comment: comment.trim() })
    setSubmitted(true); setCanReview(false); setSubmitting(false)
    // Refresh
    const { data } = await supabase.from('reviews').select('*, users:reviewer_id(name,avatar_url)').eq('listing_id', listingId).order('created_at', { ascending: false })
    setReviews((data as any) ?? [])
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center gap-4 mb-5">
        <h2 className="font-bold text-sm uppercase tracking-wider text-violet-300">Reviews</h2>
        {avg && (
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-lg">★</span>
            <span className="font-black text-white">{avg}</span>
            <span className="text-slate-500 text-xs">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      {canReview && !submitted && (
        <form onSubmit={submit} className="mb-6 space-y-3 pb-6 border-b border-white/5">
          <div className="text-xs font-semibold text-slate-300">Leave a review</div>
          <Stars rating={rating} interactive onChange={setRating} />
          <textarea className="input-dark resize-none text-sm" rows={2}
            placeholder="Share your experience (one line is fine)..."
            value={comment} onChange={e => setComment(e.target.value.slice(0, 200))} required />
          <button type="submit" disabled={submitting} className="btn-primary text-xs px-5 py-2 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
      {submitted && <div className="text-green-400 text-sm mb-4 font-semibold">✓ Review submitted. Thank you!</div>}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center text-slate-600 text-sm py-6">No reviews yet. Be the first!</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="flex gap-3">
              <span className="text-2xl shrink-0">{(r.users as any)?.avatar_url || '👤'}</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-white">{(r.users as any)?.name ?? 'User'}</span>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{r.comment}</p>
                <div className="text-[10px] text-slate-600 mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
