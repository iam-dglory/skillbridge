'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WishlistButton({ listingId }: { listingId: string }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('listing_id', listingId)
        .maybeSingle()
        .then(({ data }) => setWishlisted(!!data))
    })
  }, [listingId])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return // silently ignore if not logged in
    setLoading(true)
    if (wishlisted) {
      await supabase.from('wishlists').delete()
        .eq('user_id', session.user.id).eq('listing_id', listingId)
      setWishlisted(false)
    } else {
      await supabase.from('wishlists').insert({ user_id: session.user.id, listing_id: listingId })
      setWishlisted(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="p-2 rounded-xl transition hover:bg-white/10 disabled:opacity-50"
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label="Toggle wishlist"
    >
      <span className="text-xl leading-none">{wishlisted ? '❤️' : '🤍'}</span>
    </button>
  )
}
