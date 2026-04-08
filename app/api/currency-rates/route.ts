import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 3600 // cache 1 hour

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 }
    })
    const data = await res.json()
    return NextResponse.json({ rates: data.rates, updated: data.time_last_update_utc })
  } catch {
    // Fallback rates
    return NextResponse.json({
      rates: {
        INR: 83.5, NGN: 1580, PHP: 57.2, BRL: 4.97, MXN: 17.1,
        IDR: 15850, ZAR: 18.7, GBP: 0.79, EUR: 0.92, AUD: 1.53,
        CAD: 1.36, SGD: 1.34
      },
      updated: 'fallback'
    })
  }
}
