import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import type { Database } from '@/types/database'
import { getMaxPrice } from '@/lib/ppp'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId, country } = await req.json()

  // Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex')

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single()
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const pricing = getMaxPrice(listing.category, country)

  await supabase.from('orders').insert({
    buyer_id: session.user.id,
    listing_id: listingId,
    country,
    price_usd: pricing.usd,
    price_local: pricing.local,
    local_currency: pricing.currency,
    stripe_session_id: razorpay_payment_id, // reuse field
    status: 'paid',
  })

  return NextResponse.json({ success: true })
}
