import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { getMaxPrice } from '@/lib/ppp'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { listingId, country } = await req.json()
  const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single()
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const pricing = getMaxPrice(listing.category, country)
  const amountPaise = Math.round(pricing.local * 100) // Razorpay uses paise

  const keyId = process.env.RAZORPAY_KEY_ID!
  const keySecret = process.env.RAZORPAY_KEY_SECRET!

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      notes: { listingId, buyerId: session.user.id, country }
    })
  })

  const order = await orderRes.json()
  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId })
}
