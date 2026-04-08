'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('users').select('name,avatar_url,stripe_account_id').eq('id', session.user.id).single()
          .then(({ data }) => setUser(data))
      }
    })
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const navLinks = [
    { href: '/browse', label: 'Browse Skills' },
    { href: '/sell', label: 'Sell a Skill' },
    { href: '/help', label: 'Help' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f0a1e]/90 backdrop-blur-xl border-b border-violet-900/30 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm">S</div>
          <span className="font-black text-lg gradient-text">SkillBridge</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-semibold transition-colors ${pathname === l.href ? 'text-violet-400' : 'text-slate-300 hover:text-violet-300'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!user.stripe_account_id && (
                <Link href="/connect-stripe" className="hidden md:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-500/30 transition">
                  💳 Get paid
                </Link>
              )}
              <Link href="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-violet-300 transition">
                <span className="text-xl">{user.avatar_url || '👤'}</span>
              </Link>
              <button onClick={handleSignOut} className="btn-secondary text-xs px-4 py-1.5">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-xs px-4 py-1.5">Log in</Link>
              <Link href="/login" className="btn-primary text-xs px-4 py-1.5">Get started</Link>
            </>
          )}
          {/* Mobile menu */}
          <button className="md:hidden text-slate-300 hover:text-white ml-1" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0f0a1e]/95 backdrop-blur-xl border-t border-violet-900/30 px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 hover:text-violet-300 py-2">
              {l.label}
            </Link>
          ))}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn-secondary text-xs flex-1 text-center py-2">Log in</Link>
              <Link href="/login" className="btn-primary text-xs flex-1 text-center py-2">Sign up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
