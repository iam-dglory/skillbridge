'use client'

import { useEffect, useState } from 'react'

const BASE_PAIRS = [
  { from: 'USD', to: 'INR', label: '🇮🇳 INR' },
  { from: 'USD', to: 'NGN', label: '🇳🇬 NGN' },
  { from: 'USD', to: 'PHP', label: '🇵🇭 PHP' },
  { from: 'USD', to: 'BRL', label: '🇧🇷 BRL' },
  { from: 'USD', to: 'MXN', label: '🇲🇽 MXN' },
  { from: 'USD', to: 'IDR', label: '🇮🇩 IDR' },
  { from: 'USD', to: 'ZAR', label: '🇿🇦 ZAR' },
  { from: 'USD', to: 'GBP', label: '🇬🇧 GBP' },
  { from: 'USD', to: 'EUR', label: '🇪🇺 EUR' },
  { from: 'USD', to: 'AUD', label: '🇦🇺 AUD' },
  { from: 'USD', to: 'CAD', label: '🇨🇦 CAD' },
  { from: 'USD', to: 'SGD', label: '🇸🇬 SGD' },
]

type Rates = Record<string, number>

export default function CurrencyTicker() {
  const [rates, setRates] = useState<Rates>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/currency-rates')
      .then(r => r.json())
      .then(d => { if (d.rates) { setRates(d.rates); setLoading(false) } })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="ticker-wrap">
      <div className="flex gap-8 px-4 text-cyan-400/60 text-xs animate-pulse">
        {[...Array(8)].map((_, i) => <span key={i}>Loading rates...</span>)}
      </div>
    </div>
  )

  const items = BASE_PAIRS.map(p => ({
    ...p,
    rate: rates[p.to] ? (rates[p.to]).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'
  }))

  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className="ticker-wrap">
      <div className="ticker-inner gap-0">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-xs font-mono whitespace-nowrap">
            <span className="text-cyan-400/60">1 USD</span>
            <span className="text-cyan-300/40 mx-1">→</span>
            <span className="text-cyan-300 font-bold">{item.rate} {item.to}</span>
            <span className="text-cyan-400/40 ml-1">{item.label}</span>
            <span className="text-cyan-900 ml-4">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
