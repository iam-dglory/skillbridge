import Link from 'next/link'
import CurrencyTicker from '@/components/CurrencyTicker'
import { CATEGORY_META } from '@/lib/ppp'

const STATS = [
  { n: '150+', label: 'Countries' },
  { n: '10K+', label: 'Skills Listed' },
  { n: '98%', label: 'Satisfaction' },
  { n: 'PPP', label: 'Fair Pricing' },
]

const HOW = [
  { icon: '🌍', title: 'Set your country', desc: 'We detect your location and automatically show prices in your local purchasing power.' },
  { icon: '🔍', title: 'Browse skills', desc: 'Filter by category, engagement type (Freelance / Part-time / Long-term), and delivery time.' },
  { icon: '💬', title: 'Book a call or buy', desc: 'Hire instantly or book a free intro call with the seller before committing.' },
  { icon: '💸', title: 'Pay your way', desc: 'UPI for India, cards worldwide. Secure, instant, always the fair local price.' },
]

export default function HomePage() {
  const cats = Object.entries(CATEGORY_META)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-semibold text-violet-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Fair pricing for every country · Live exchange rates below
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="gradient-text">Skills that cross</span>
            <br />
            <span className="text-white">every border</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Buy and sell freelance, part-time, and long-term skills — at prices adjusted for your country.
            No currency confusion. No unfair rates. Just work, done right.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/browse" className="btn-primary px-8 py-3 text-base">Browse Skills →</Link>
            <Link href="/sell" className="btn-secondary px-8 py-3 text-base">Sell a Skill</Link>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="glass p-4 text-center">
                <div className="text-2xl font-black gradient-text">{s.n}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live currency ticker */}
      <CurrencyTicker />

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="section-title text-center mb-2">Browse by Category</h2>
        <p className="text-slate-400 text-center mb-10">Every skill, every engagement type, priced for your market.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cats.map(([key, meta]) => (
            <Link key={key} href={`/browse?category=${encodeURIComponent(key)}`}
              className="glass-card p-5 text-center group cursor-pointer">
              <div className="text-4xl mb-3">{meta.icon}</div>
              <div className="font-bold text-sm text-white">{key}</div>
              <div className="text-xs text-slate-400 mt-1">PPP-priced</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-12 pb-20">
        <h2 className="section-title text-center mb-2">How SkillBridge works</h2>
        <p className="text-slate-400 text-center mb-10">Simple. Fair. Built for the global south and beyond.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW.map((h, i) => (
            <div key={i} className="glass p-6">
              <div className="text-3xl mb-3">{h.icon}</div>
              <div className="font-bold text-white mb-2">{h.title}</div>
              <div className="text-sm text-slate-400 leading-relaxed">{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-900/30 py-8 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-6 mb-4">
          <Link href="/browse" className="hover:text-violet-300 transition">Browse</Link>
          <Link href="/sell" className="hover:text-violet-300 transition">Sell</Link>
          <Link href="/help" className="hover:text-violet-300 transition">Help Center</Link>
          <Link href="/dashboard" className="hover:text-violet-300 transition">Dashboard</Link>
        </div>
        <div>© 2025 SkillBridge · Fair pricing for every human on earth 🌍</div>
      </footer>
    </div>
  )
}
