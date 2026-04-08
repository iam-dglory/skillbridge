// Purchasing Power Parity engine
// Multipliers are relative to USA (1.0)
// These can also be stored in the ppp_config Supabase table and fetched at runtime

export const COUNTRIES: Record<string, {
  multiplier: number
  currency: string
  symbol: string
  rate: number      // approximate USD exchange rate
  flag: string
}> = {
  'USA':          { multiplier: 1.00, currency: 'USD', symbol: '$',    rate: 1,      flag: '🇺🇸' },
  'UK':           { multiplier: 0.68, currency: 'GBP', symbol: '£',    rate: 0.79,   flag: '🇬🇧' },
  'Germany':      { multiplier: 0.65, currency: 'EUR', symbol: '€',    rate: 0.92,   flag: '🇩🇪' },
  'France':       { multiplier: 0.63, currency: 'EUR', symbol: '€',    rate: 0.92,   flag: '🇫🇷' },
  'Australia':    { multiplier: 0.72, currency: 'AUD', symbol: 'A$',   rate: 1.52,   flag: '🇦🇺' },
  'Canada':       { multiplier: 0.73, currency: 'CAD', symbol: 'C$',   rate: 1.36,   flag: '🇨🇦' },
  'Japan':        { multiplier: 0.42, currency: 'JPY', symbol: '¥',    rate: 149,    flag: '🇯🇵' },
  'UAE':          { multiplier: 0.50, currency: 'AED', symbol: 'د.إ',  rate: 3.67,   flag: '🇦🇪' },
  'China':        { multiplier: 0.16, currency: 'CNY', symbol: '¥',    rate: 7.24,   flag: '🇨🇳' },
  'India':        { multiplier: 0.10, currency: 'INR', symbol: '₹',    rate: 83,     flag: '🇮🇳' },
  'Brazil':       { multiplier: 0.22, currency: 'BRL', symbol: 'R$',   rate: 4.97,   flag: '🇧🇷' },
  'Mexico':       { multiplier: 0.20, currency: 'MXN', symbol: 'MX$',  rate: 17.2,   flag: '🇲🇽' },
  'South Africa': { multiplier: 0.14, currency: 'ZAR', symbol: 'R',    rate: 18.9,   flag: '🇿🇦' },
  'Nigeria':      { multiplier: 0.06, currency: 'NGN', symbol: '₦',    rate: 1580,   flag: '🇳🇬' },
  'Philippines':  { multiplier: 0.12, currency: 'PHP', symbol: '₱',    rate: 56,     flag: '🇵🇭' },
  'Indonesia':    { multiplier: 0.11, currency: 'IDR', symbol: 'Rp',   rate: 15600,  flag: '🇮🇩' },
}

export const CATEGORY_BASE_PRICES: Record<string, number> = {
  'Video Editing':         50,
  'Graphic Design':        40,
  'Writing & Translation': 30,
  'Programming & Tech':    80,
  'Vibe Coding':           60,
}

export const CATEGORY_META: Record<string, { icon: string; grad: string; bg: string; text: string }> = {
  'Video Editing':         { icon: '🎬', grad: 'from-purple-500 to-pink-500',   bg: 'bg-purple-50',  text: 'text-purple-600'  },
  'Graphic Design':        { icon: '🎨', grad: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-50',    text: 'text-blue-600'    },
  'Writing & Translation': { icon: '✍️', grad: 'from-green-500 to-teal-500',    bg: 'bg-green-50',   text: 'text-green-600'   },
  'Programming & Tech':    { icon: '💻', grad: 'from-orange-500 to-red-500',    bg: 'bg-orange-50',  text: 'text-orange-600'  },
  'Vibe Coding':           { icon: '✨', grad: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50',  text: 'text-indigo-600'  },
}

export interface PricingResult {
  usd: number        // USD equivalent (what gets charged via Stripe)
  local: number      // local currency amount shown to user
  symbol: string
  currency: string
  formatted: string  // e.g. "₹415"
}

/**
 * Calculate the PPP-adjusted max price for a skill category in a given country.
 * @param category  - e.g. "Video Editing"
 * @param country   - e.g. "India"
 */
export function getMaxPrice(category: string, country: string): PricingResult {
  const countryData = COUNTRIES[country] ?? COUNTRIES['USA']
  const baseUSD = CATEGORY_BASE_PRICES[category] ?? 50
  const usd = baseUSD * countryData.multiplier
  const local = usd * countryData.rate

  return {
    usd,
    local,
    symbol: countryData.symbol,
    currency: countryData.currency,
    formatted: formatLocal(local, countryData.symbol),
  }
}

export function formatLocal(amount: number, symbol: string): string {
  if (amount >= 10000) return `${symbol}${Math.round(amount / 1000)}k`
  if (amount >= 1000)  return `${symbol}${Math.round(amount).toLocaleString()}`
  if (amount < 10)     return `${symbol}${amount.toFixed(1)}`
  return `${symbol}${Math.round(amount)}`
}

/** Detect country from browser locale / timezone — used as a default */
export function detectCountryFromLocale(): string {
  if (typeof window === 'undefined') return 'USA'
  const lang = navigator.language || 'en-US'
  const map: Record<string, string> = {
    'en-IN': 'India', 'hi': 'India',
    'en-GB': 'UK', 'en-AU': 'Australia', 'en-CA': 'Canada',
    'de': 'Germany', 'fr': 'France',
    'ja': 'Japan', 'zh': 'China',
    'pt-BR': 'Brazil', 'es-MX': 'Mexico',
    'ar-AE': 'UAE', 'fil': 'Philippines',
    'id': 'Indonesia', 'yo': 'Nigeria', 'af': 'South Africa',
  }
  for (const [key, country] of Object.entries(map)) {
    if (lang.startsWith(key)) return country
  }
  return 'USA'
}

/** Detect country from IP address — falls back to locale detection */
export async function detectCountryFromIP(): Promise<string> {
  if (typeof window === 'undefined') return 'India'
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) throw new Error('fail')
    const data = await res.json()
    const map: Record<string, string> = {
      'United States': 'USA', 'United Kingdom': 'UK',
      'Germany': 'Germany', 'France': 'France',
      'Australia': 'Australia', 'Canada': 'Canada',
      'Japan': 'Japan', 'United Arab Emirates': 'UAE',
      'China': 'China', 'India': 'India',
      'Brazil': 'Brazil', 'Mexico': 'Mexico',
      'South Africa': 'South Africa', 'Nigeria': 'Nigeria',
      'Philippines': 'Philippines', 'Indonesia': 'Indonesia',
    }
    return map[data.country_name] ?? detectCountryFromLocale()
  } catch {
    return detectCountryFromLocale()
  }
}
