'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES } from '@/lib/ppp'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('India')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }

      if (data.user) {
        // Create user profile
        await supabase.from('users').insert({
          id: data.user.id,
          name,
          email,
          country,
          avatar_url: null,
        })
        setSuccess('Account created! Check your email to confirm, then sign in.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push(redirect)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌍</div>
          <h2 className="text-xl font-black text-gray-900">
            {mode === 'login' ? 'Welcome back' : 'Join SkillBridge'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Buy or sell skills globally — free to join'}
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm">{success}</div>
            <button onClick={() => { setMode('login'); setSuccess(null) }}
              className="mt-4 text-indigo-600 text-sm font-semibold hover:underline">
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your name</label>
                  <input
                    required value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Gopika" type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your country</label>
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {Object.entries(COUNTRIES).map(([name, d]) => (
                      <option key={name} value={name}>{d.flag} {name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input
                required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <input
                required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters" type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>

            <p className="text-center text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-indigo-600 font-semibold hover:underline">
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
