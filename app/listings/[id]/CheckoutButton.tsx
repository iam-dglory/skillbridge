'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  listingId: string
  listingTitle: string
  sellerId: string
  sellerStripeAccountId: string | null
  priceUSD: number
  priceLocal: number
  localCurrency: string
  buyerCountry: string
}

export default function CheckoutButton({
  listingId, listingTitle, sellerId,
  sellerStripeAccountId, priceUSD, priceLocal, localCurrency, buyerCountry
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleHire = async () => {
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?redirect=/listings/' + listingId)
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          listingTitle,
          sellerId,
          sellerStripeAccountId,
          priceUSD,
          priceLocal,
          localCurrency,
          buyerCountry,
          buyerId: session.user.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleHire}
        disabled={loading || !sellerStripeAccountId}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold rounded-xl transition text-base shadow-md"
      >
        {loading ? 'Preparing checkout...' : !sellerStripeAccountId ? 'Seller setup incomplete' : 'Hire Now'}
      </button>
      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
    </div>
  )
}
