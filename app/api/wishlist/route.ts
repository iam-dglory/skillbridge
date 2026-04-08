import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies } as any)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId, action } = await request.json()
  if (action === 'add') {
    await supabase.from('wishlists').insert({ user_id: session.user.id, listing_id: listingId })
  } else {
    await supabase.from('wishlists').delete()
      .eq('user_id', session.user.id).eq('listing_id', listingId)
  }
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies } as any)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ ids: [] })
  const { data } = await supabase.from('wishlists').select('listing_id').eq('user_id', session.user.id)
  return NextResponse.json({ ids: data?.map((w: any) => w.listing_id) ?? [] })
}
