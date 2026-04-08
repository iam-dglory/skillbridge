'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [unread, setUnread] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const path = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('users').select('name,avatar_url,username').eq('id', session.user.id).single()
      setUser({ ...data, id: session.user.id })
      // Unread messages count
      const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true })
        .eq('receiver_id', session.user.id).eq('read', false)
      setUnread(count ?? 0)
    })
    const h = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); router.push('/')
  }

  const links = [
    { href: '/browse', label: 'Browse' },
    { href: '/sell',   label: 'Sell a Skill' },
    { href: '/help',   label: 'Help' },
  ]

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f0a1e]/90 backdrop-blur-xl border-b border-violet-900/20' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#lg)"/>
            <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="font-black text-sm gradient-text tracking-tight">SkillBridge</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-5 flex-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-medium transition ${path === l.href ? 'text-violet-400' : 'text-slate-400 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              {/* Messages */}
              <Link href="/messages" className="relative p-2 rounded-lg hover:bg-white/5 transition">
                <span className="text-lg">💬</span>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <Link href="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-violet-300 transition px-2">
                {user.avatar_url || '👤'} {user.username ? `@${user.username}` : user.name?.split(' ')[0]}
              </Link>
              <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-300 transition">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition font-medium">Log in</Link>
              <Link href="/login" className="btn-primary text-xs px-4 py-1.5">Get started</Link>
            </>
          )}
          <button className="md:hidden p-1.5 text-slate-400" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>

      {/* Mobile */}
      {open && (
        <div className="md:hidden bg-[#0f0a1e]/95 backdrop-blur-xl border-t border-violet-900/20 px-4 py-4 space-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-sm font-medium text-slate-300 hover:text-violet-300 py-2">{l.label}</Link>
          ))}
          {user && <Link href="/messages" onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-300 py-2">💬 Messages {unread > 0 && `(${unread})`}</Link>}
        </div>
      )}
    </nav>
  )
}
