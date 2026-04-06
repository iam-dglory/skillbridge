import { NextResponse } from 'next/server'
import { stripe, calculatePlatformFee } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function POST(request: Request) {
  try {
    const {
      listingId, listingTitle, sellerId,
      sellerStripeAccountId, priceUSD, priceLocal,
      localCurrency, buyerCountry, buyerId,
    } = await request.json()

    if (!sellerStripeAccountId) {
      return NextResponse.json({ error: 'Seller has not connected their payment account yet.' }, { status: 400 })
    }

    // Convert USD amount to cents for Stripe
    const amountCents = Math.round(priceUSD * 100)
    const platformFeeCents = calculatePlatformFee(amountCents)

    // Create Stripe Checkout Session with Connect
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listingTitle,
            description: `SkillBridge order — ${listingTitle}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?order=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}`,
      metadata: {
        listingId, buyerId, sellerId,
        buyerCountry, priceUSD: priceUSD.toString(),
        priceLocal: priceLocal.toString(), localCurrency,
      },
    })

    // Create a pending order in Supabase
    const supabase = createRouteHandlerClient<Database>({ cookies })
    await supabase.from('orders').insert({
      buyer_id: buyerId,
      listing_id: listingId,
      buyer_country: buyerCountry,
      price_usd: priceUSD,
      price_local: priceLocal,
      local_currency: localCurrency,
      stripe_payment_intent_id: session.payment_intent as string,
      status: 'pending',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
