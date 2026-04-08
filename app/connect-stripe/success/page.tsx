'use client'

import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">You're all set!</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Stripe is connected. Buyers can now pay you directly when they hire you.
        </p>
        <div className="space-y-3">
          <Link href="/sell"
            className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition">
            Create your first listing →
          </Link>
          <Link href="/dashboard"
            className="block w-full py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function StripeSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
