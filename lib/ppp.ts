// SkillBridge PPP Pricing Engine

export type CountryInfo = {
  flag: string
  currency: string
  multiplier: number   // fraction of USD base price
  exchangeRate: number // local units per 1 USD
}

// Categories must match the DB CHECK constraint exactly
export const CATEGORY_META: Record<string, { icon: string; grad: string }> = {
  'Video Editing':         { icon: '🎬', grad: 'from-pink-500 to-rose-500' },
  'Graphic Design':        { icon: '🎨', grad: 'from-violet-500 to-purple-600' },
  'Writing & Translation': { icon: '✍️',  grad: 'from-blue-500 to-cyan-500' },
  'Programming & Tech':    { icon: '💻', grad: 'from-emerald-500 to-teal-500' },
  'Vibe Coding':           { icon: '🚀', grad: 'from-amber-500 to-orange-500' },
}

// USD base prices per category
export const CATEGORY_BASE_PRICES: Record<string, number> = {
  'Video Editing':         120,
  'Graphic Design':        80,
  'Writing & Translation': 60,
  'Programming & Tech':    150,
  'Vibe Coding':           200,
}

export const COUNTRIES: Record<string, CountryInfo> = {
  'USA':          { flag: '🇺🇸', currency: 'USD', multiplier: 1.00,  exchangeRate: 1 },
  'UK':           { flag: '🇬🇧', currency: 'GBP', multiplier: 0.68,  exchangeRate: 0.79 },
  'Germany':      { flag: '🇩🇪', currency: 'EUR', multiplier: 0.65,  exchangeRate: 0.92 },
  'France':       { flag: '🇫🇷', currency: 'EUR', multiplier: 0.63,  exchangeRate: 0.92 },
  'Australia':    { flag: '🇦🇺', currency: 'AUD', multiplier: 0.72,  exchangeRate: 1.52 },
  'Canada':       { flag: '🇨🇦', currency: 'CAD', multiplier: 0.73,  exchangeRate: 1.36 },
  'Japan':        { flag: '🇯🇵', currency: 'JPY', multiplier: 0.42,  exchangeRate: 149 },
  'UAE':          { flag: '🇦🇪', currency: 'AED', multiplier: 0.50,  exchangeRate: 3.67 },
  'China':        { flag: '🇨🇳', currency: 'CNY', multiplier: 0.16,  exchangeRate: 7.24 },
  'India':        { flag: '🇮🇳', currency: 'INR', multiplier: 0.10,  exchangeRate: 83 },
  'Brazil':       { flag: '🇧🇷', currency: 'BRL', multiplier: 0.22,  exchangeRate: 4.97 },
  'Mexico':       { flag: '🇲🇽', currency: 'MXN', multiplier: 0.20,  exchangeRate: 17.2 },
  'South Africa': { flag: '🇿🇦', currency: 'ZAR', multiplier: 0.14,  exchangeRate: 18.9 },
  'Nigeria':      { flag: '🇳🇬', currency: 'NGN', multiplier: 0.06,  exchangeRate: 1580 },
  'Philippines':  { flag: '🇵🇭', currency: 'PHP', multiplier: 0.12,  exchangeRate: 56 },
  'Indonesia':    { flag: '🇮🇩', currency: 'IDR', multiplier: 0.11,  exchangeRate: 15600 },
  'Singapore':    { flag: '🇸🇬', currency: 'SGD', multiplier: 0.75,  exchangeRate: 1.34 },
}

export type PriceResult = {
  usd: number
  local: number
  currency: string
  formatted: string
}

export function getMaxPrice(category: string, country: string): PriceResult {
  const baseUsd = CATEGORY_BASE_PRICES[category] ?? 100
  const info = COUNTRIES[country] ?? COUNTRIES['USA']
  const usd = baseUsd
  const local = Math.round(usd * info.multiplier * info.exchangeRate)
  const formatted = `${info.currency} ${local.toLocaleString()}`
  return { usd, local, currency: info.currency, formatted }
}

export async function detectCountryFromIP(): Promise<string> {
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    const data = await res.json()
    const name = data.country_name as string
    // Map API country name → our COUNTRIES keys
    const MAP: Record<string, string> = {
      'United States': 'USA',
      'United Kingdom': 'UK',
      'India': 'India',
      'Brazil': 'Brazil',
      'Mexico': 'Mexico',
      'Australia': 'Australia',
      'Canada': 'Canada',
      'Japan': 'Japan',
      'China': 'China',
      'Germany': 'Germany',
      'France': 'France',
      'Nigeria': 'Nigeria',
      'Philippines': 'Philippines',
      'Indonesia': 'Indonesia',
      'South Africa': 'South Africa',
      'Singapore': 'Singapore',
      'United Arab Emirates': 'UAE',
    }
    return MAP[name] ?? (COUNTRIES[name] ? name : 'India')
  } catch {
    return 'India'
  }
}
