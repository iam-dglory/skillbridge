'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WishlistButton({ listingId }: { listingId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    setLoading(true)
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, action: saved ? 'remove' : 'add' }),
    })
    setSaved(!saved)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:scale-110 transition-transform z-10 border border-gray-100"
    >
      <span className="text-base leading-none">{saved ? '❤️' : '🤍'}</span>
    </button>
  )
}
