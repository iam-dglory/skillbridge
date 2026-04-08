import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import type { Database } from '@/types/database'
import { getMaxPrice } from '@/lib/ppp'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { listingId, country } = await req.json()
  const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single()
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const pricing = getMaxPrice(listing.category, country)
  const platformFee = Math.round(pricing.local * 100 * 0.10)

  // Get seller's Stripe account
  const { data: seller } = await supabase.from('users').select('stripe_account_id').eq('id', listing.seller_id).single()

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://skillbridge.vercel.app'

  const stripeSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: pricing.currency.toLowerCase(),
    line_items: [{
      price_data: {
        currency: pricing.currency.toLowerCase(),
        product_data: {
          name: listing.title,
          description: `Delivery in ${listing.delivery_days} days`,
        },
        unit_amount: Math.round(pricing.local * 100),
      },
      quantity: 1,
    }),
    ...(seller?.stripe_account_id ? {
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: { destination: seller.stripe_account_id },
      }
    } : {}),
    success_url: `${baseUrl}/dashboard?order=success`,
    cancel_url: `${baseUrl}/listing/${listingId}?country=${country}`,
    metadata: {
      listingId,
      buyerId: session.user.id,
      country,
      priceLocal: pricing.local,
      currency: pricing.currency,
    },
  })

  return NextResponse.json({ url: stripeSession.url })
}
