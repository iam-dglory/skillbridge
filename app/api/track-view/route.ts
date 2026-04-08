import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ ok: false })
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  await supabase.from('listing_views').insert({
    listing_id: listingId,
    viewer_id: session?.user.id ?? null
  })
  return NextResponse.json({ ok: true })
}
