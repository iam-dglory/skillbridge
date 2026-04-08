import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

// Use service role key to bypass RLS for webhook inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const { listingId, buyerId, country, priceLocal, currency } = session.metadata ?? {}

    if (listingId && buyerId) {
      // Get listing for USD price
      const { data: listing } = await supabase.from('listings').select('category').eq('id', listingId).single()

      await supabase.from('orders').insert({
        buyer_id: buyerId,
        listing_id: listingId,
        buyer_country: country ?? 'USA',
        price_usd: (session.amount_total ?? 0) / 100,
        price_local: parseFloat(priceLocal ?? '0'),
        local_currency: currency ?? 'USD',
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'paid',
      })
    }
  }

  return NextResponse.json({ received: true })
}

export const config = { api: { bodyParser: false } }
