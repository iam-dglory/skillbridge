'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { UserRow } from '@/types/database'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<UserRow | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setUser(data)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) { setUser(null); return }
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      setUser(data)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-lg text-gray-900 hover:opacity-80 transition">
          <span className="text-2xl">🌍</span> SkillBridge
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/browse"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive('/browse') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            Browse
          </Link>
          <Link href="/sell"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive('/sell') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            Sell a Skill
          </Link>

          {user ? (
            <>
              <Link href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span>{user.avatar_url || '👤'}</span>
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
              {!user.stripe_account_id && (
                <a href="/connect-stripe"
                  className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition">
                  💳 Get paid
                </a>
              )}
              <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-red-500 px-2 transition">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login"
              className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
