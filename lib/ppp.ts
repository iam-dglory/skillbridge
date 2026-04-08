// SkillBridge PPP Pricing Engine — V3

export type CountryInfo = {
  flag: string; currency: string; multiplier: number; exchangeRate: number
}

export const CATEGORY_META: Record<string, { icon: string; grad: string; base: number }> = {
  'Video Editing':         { icon: '🎬', grad: 'from-pink-500 to-rose-500',      base: 120 },
  'Graphic Design':        { icon: '🎨', grad: 'from-violet-500 to-purple-600',   base: 80  },
  'Writing & Translation': { icon: '✍️',  grad: 'from-blue-500 to-cyan-500',       base: 60  },
  'Programming & Tech':    { icon: '💻', grad: 'from-emerald-500 to-teal-500',    base: 150 },
  'Vibe Coding':           { icon: '🚀', grad: 'from-amber-500 to-orange-500',    base: 200 },
  'Teaching & Tutoring':   { icon: '📚', grad: 'from-sky-500 to-indigo-500',      base: 70  },
  'Music & Audio':         { icon: '🎵', grad: 'from-fuchsia-500 to-pink-500',    base: 90  },
  'Dance & Fitness':       { icon: '💃', grad: 'from-rose-500 to-orange-400',     base: 65  },
  'Social Media':          { icon: '📱', grad: 'from-cyan-500 to-blue-500',       base: 75  },
  'Business & Finance':    { icon: '💼', grad: 'from-slate-500 to-zinc-600',      base: 130 },
  'Language Coaching':     { icon: '🗣️', grad: 'from-teal-500 to-emerald-400',    base: 55  },
  'Photography':           { icon: '📸', grad: 'from-yellow-500 to-amber-400',    base: 100 },
  'UI/UX Design':          { icon: '🎭', grad: 'from-purple-500 to-violet-400',   base: 110 },
  'Data & Analytics':      { icon: '📊', grad: 'from-green-500 to-teal-400',      base: 140 },
  'Legal & Consulting':    { icon: '⚖️', grad: 'from-stone-500 to-slate-400',     base: 160 },
}

export const COUNTRIES: Record<string, CountryInfo> = {
  'USA':          { flag: '🇺🇸', currency: 'USD', multiplier: 1.00,  exchangeRate: 1      },
  'UK':           { flag: '🇬🇧', currency: 'GBP', multiplier: 0.68,  exchangeRate: 0.79   },
  'Germany':      { flag: '🇩🇪', currency: 'EUR', multiplier: 0.65,  exchangeRate: 0.92   },
  'France':       { flag: '🇫🇷', currency: 'EUR', multiplier: 0.63,  exchangeRate: 0.92   },
  'Australia':    { flag: '🇦🇺', currency: 'AUD', multiplier: 0.72,  exchangeRate: 1.52   },
  'Canada':       { flag: '🇨🇦', currency: 'CAD', multiplier: 0.73,  exchangeRate: 1.36   },
  'Japan':        { flag: '🇯🇵', currency: 'JPY', multiplier: 0.42,  exchangeRate: 149    },
  'UAE':          { flag: '🇦🇪', currency: 'AED', multiplier: 0.50,  exchangeRate: 3.67   },
  'China':        { flag: '🇨🇳', currency: 'CNY', multiplier: 0.16,  exchangeRate: 7.24   },
  'India':        { flag: '🇮🇳', currency: 'INR', multiplier: 0.10,  exchangeRate: 83     },
  'Brazil':       { flag: '🇧🇷', currency: 'BRL', multiplier: 0.22,  exchangeRate: 4.97   },
  'Mexico':       { flag: '🇲🇽', currency: 'MXN', multiplier: 0.20,  exchangeRate: 17.2   },
  'South Africa': { flag: '🇿🇦', currency: 'ZAR', multiplier: 0.14,  exchangeRate: 18.9   },
  'Nigeria':      { flag: '🇳🇬', currency: 'NGN', multiplier: 0.06,  exchangeRate: 1580   },
  'Philippines':  { flag: '🇵🇭', currency: 'PHP', multiplier: 0.12,  exchangeRate: 56     },
  'Indonesia':    { flag: '🇮🇩', currency: 'IDR', multiplier: 0.11,  exchangeRate: 15600  },
  'Singapore':    { flag: '🇸🇬', currency: 'SGD', multiplier: 0.75,  exchangeRate: 1.34   },
  'Pakistan':     { flag: '🇵🇰', currency: 'PKR', multiplier: 0.05,  exchangeRate: 280    },
  'Bangladesh':   { flag: '🇧🇩', currency: 'BDT', multiplier: 0.05,  exchangeRate: 110    },
  'Kenya':        { flag: '🇰🇪', currency: 'KES', multiplier: 0.07,  exchangeRate: 130    },
  'Ghana':        { flag: '🇬🇭', currency: 'GHS', multiplier: 0.07,  exchangeRate: 13     },
  'Egypt':        { flag: '🇪🇬', currency: 'EGP', multiplier: 0.08,  exchangeRate: 50     },
  'Turkey':       { flag: '🇹🇷', currency: 'TRY', multiplier: 0.12,  exchangeRate: 32     },
  'Argentina':    { flag: '🇦🇷', currency: 'ARS', multiplier: 0.10,  exchangeRate: 1000   },
  'Colombia':     { flag: '🇨🇴', currency: 'COP', multiplier: 0.13,  exchangeRate: 4000   },
}

export type PriceResult = { usd: number; local: number; currency: string; formatted: string }

export function getMaxPrice(category: string, country: string): PriceResult {
  const meta   = CATEGORY_META[category]
  const baseUsd = meta?.base ?? 100
  const info   = COUNTRIES[country] ?? COUNTRIES['USA']
  const local  = Math.round(baseUsd * info.multiplier * info.exchangeRate)
  return { usd: baseUsd, local, currency: info.currency, formatted: `${info.currency} ${local.toLocaleString()}` }
}

export async function detectCountryFromIP(): Promise<string> {
  try {
    const res  = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    const data = await res.json()
    const MAP: Record<string, string> = {
      'United States': 'USA', 'United Kingdom': 'UK', 'India': 'India',
      'Brazil': 'Brazil', 'Mexico': 'Mexico', 'Australia': 'Australia',
      'Canada': 'Canada', 'Japan': 'Japan', 'China': 'China',
      'Germany': 'Germany', 'France': 'France', 'Nigeria': 'Nigeria',
      'Philippines': 'Philippines', 'Indonesia': 'Indonesia',
      'South Africa': 'South Africa', 'Singapore': 'Singapore',
      'United Arab Emirates': 'UAE', 'Pakistan': 'Pakistan',
      'Bangladesh': 'Bangladesh', 'Kenya': 'Kenya', 'Ghana': 'Ghana',
      'Egypt': 'Egypt', 'Turkey': 'Turkey', 'Argentina': 'Argentina',
      'Colombia': 'Colombia',
    }
    return MAP[data.country_name] ?? 'India'
  } catch { return 'India' }
}
