'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  listingId: string
  country: string
  title: string
  priceLocal: number
  currency: string
}

declare global {
  interface Window { Razorpay: any }
}

export default function CheckoutButton({ listingId, country, title, priceLocal, currency }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const isUPI = currency === 'INR'

  const handleStripe = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login?redirect=' + window.location.pathname; return }
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, country })
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { alert('Payment failed. Try again.'); setLoading(false) }
  }

  const handleUPI = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login?redirect=' + window.location.pathname; return }

    const res = await fetch('/api/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, country })
    })
    const { orderId, amount, currency: cur, keyId } = await res.json()

    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.head.appendChild(script)
      await new Promise(r => script.onload = r)
    }

    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency: cur,
      name: 'SkillBridge',
      description: title,
      order_id: orderId,
      prefill: { email: session.user.email },
      theme: { color: '#7c3aed' },
      handler: async (response: any) => {
        await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...response, listingId, country })
        })
        window.location.href = '/dashboard?order=success'
      },
      modal: { ondismiss: () => setLoading(false) }
    })
    rzp.open()
  }

  if (isUPI) {
    return (
      <button
        onClick={handleUPI}
        disabled={loading}
        className="btn-primary w-full py-3 text-sm font-bold text-center disabled:opacity-60"
      >
        {loading ? 'Opening UPI...' : `🪷 Pay with UPI — ₹${Math.round(priceLocal).toLocaleString()}`}
      </button>
    )
  }

  return (
    <button
      onClick={handleStripe}
      disabled={loading}
      className="btn-primary w-full py-3 text-sm font-bold text-center disabled:opacity-60"
    >
      {loading ? 'Redirecting...' : `💳 Buy Now — ${currency} ${Math.round(priceLocal).toLocaleString()}`}
    </button>
  )
}
