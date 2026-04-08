'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${redirect}` }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4">S</div>
          <h1 className="text-3xl font-black gradient-text">SkillBridge</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in or create your account</p>
        </div>

        <div className="glass p-7">
          {sent ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-xl font-black text-white mb-2">Check your inbox!</h2>
              <p className="text-slate-400 text-sm">We sent a magic link to <strong className="text-violet-300">{email}</strong>. Click it to sign in.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition">Use a different email</button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-black text-white mb-1">Welcome back 👋</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email — we'll send a magic sign-in link. No password needed.</p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="label-dark">Email address</label>
                  <input
                    type="email"
                    className="input-dark"
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-60">
                  {loading ? 'Sending...' : '✉️ Send Magic Link'}
                </button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-5">
                By signing in, you agree to our Terms of Service. No spam, ever.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-violet-300 animate-pulse">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
