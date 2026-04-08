'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ConnectStripePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login?redirect=/connect-stripe'); return }
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      setUser(data)
      setChecking(false)
    })
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/connect-stripe', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { alert(data.error || 'Something went wrong'); setLoading(false) }
    } catch { alert('Connection failed. Please try again.'); setLoading(false) }
  }

  if (checking) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">💳</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Connect your bank account</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Link Stripe to receive payments from buyers worldwide.<br />
          SkillBridge keeps 15% — you keep 85% of every sale.
        </p>

        {user?.stripe_account_id ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
            <div className="text-green-600 font-black text-lg">✓ Stripe Connected</div>
            <p className="text-green-500 text-sm mt-1">You're ready to receive payments!</p>
            <Link href="/sell" className="mt-4 inline-block text-sm text-indigo-500 hover:underline font-semibold">
              Create a listing →
            </Link>
          </div>
        ) : (
          <>
            <button onClick={handleConnect} disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-lg transition disabled:opacity-50 shadow-md mb-4">
              {loading ? 'Redirecting to Stripe...' : 'Connect Stripe →'}
            </button>
            <p className="text-xs text-gray-400">
              You'll be redirected to Stripe to securely enter your bank details.
            </p>
          </>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
          {[['🔒', 'Bank-level security'], ['⚡', 'Fast payouts'], ['🌍', 'Global currencies']].map(([icon, label]) => (
            <div key={label as string}>
              <div className="text-2xl mb-1">{icon}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-indigo-500">← Back to dashboard</Link>
      </div>
    </div>
  )
}
