import Link from 'next/link'
import CurrencyTicker from '@/components/CurrencyTicker'
import { CATEGORY_META } from '@/lib/ppp'

const QUOTES = [
  { q: "Your skills are your passport to the world.", a: "SkillBridge" },
  { q: "The world doesn't pay for what you know — it pays for what you do with it.", a: "Naval Ravikant" },
  { q: "Don't find a job. Build a skill. Sell it globally.", a: "SkillBridge" },
  { q: "A side hustle today is a main hustle tomorrow.", a: "Community wisdom" },
]

const STATS = [
  { n: '25+', label: 'Countries' },
  { n: '15', label: 'Categories' },
  { n: 'PPP', label: 'Fair Pricing' },
  { n: '0%', label: 'Listing Fee' },
]

export default function HomePage() {
  const quote = QUOTES[1]
  const cats  = Object.entries(CATEGORY_META).slice(0, 10)

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative pt-28 pb-16 px-4">
        <div className="absolute top-16 left-1/3 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-56 h-56 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-700/30 px-3 py-1.5 rounded-full text-xs font-semibold text-violet-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live exchange rates · 25 countries · Zero listing fees
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
            Sell your skills.<br />
            <span className="gradient-text">Earn in any currency.</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto mb-3 leading-relaxed">
            The global marketplace for side hustlers. Set your price once — we handle
            the conversion for every country automatically.
          </p>

          {/* Quote */}
          <blockquote className="text-sm italic text-slate-500 mb-8">
            "{quote.q}" — <span className="text-violet-400 not-italic font-medium">{quote.a}</span>
          </blockquote>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sell"   className="btn-primary px-7 py-2.5 text-sm">Start Selling →</Link>
            <Link href="/browse" className="btn-secondary px-7 py-2.5 text-sm">Browse Skills</Link>
          </div>

          {/* Mini stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black gradient-text">{s.n}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live currency ticker ──────────────────── */}
      <CurrencyTicker />

      {/* ── Why side hustles matter ──────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="glass p-8 text-center">
          <p className="text-2xl font-black text-white mb-2">
            47% of the global workforce earns from side work.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            Teaching guitar in Lagos. Editing videos in Manila. Coding in Bangalore.
            Your skill has a buyer somewhere in the world — at a price that feels fair to them.
            That's SkillBridge.
          </p>
        </div>
      </section>

      {/* ── How it works (3 steps) ───────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <h2 className="text-xl font-black text-white text-center mb-8">How it works in 3 steps</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: '01', icon: '🧠', t: 'List your skill',    d: 'Choose a category, set your terms, and publish in under 5 minutes. Free forever.' },
            { n: '02', icon: '🌍', t: 'Reach 25 countries', d: 'Buyers see prices in their own currency, adjusted for their purchasing power.' },
            { n: '03', icon: '💸', t: 'Get paid',           d: 'Receive payments via Stripe worldwide or UPI in India. Withdraw to your bank.' },
          ].map(s => (
            <div key={s.n} className="glass p-6">
              <div className="text-xs font-black text-violet-500 mb-2">{s.n}</div>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-bold text-white mb-1 text-sm">{s.t}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-14">
        <h2 className="text-xl font-black text-white text-center mb-2">Every skill has a market</h2>
        <p className="text-slate-400 text-center text-sm mb-8">From teaching dance to building apps — if you have the skill, someone needs it.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {cats.map(([key, meta]) => (
            <Link key={key} href={`/browse?category=${encodeURIComponent(key)}`}
              className="glass-card p-4 text-center group">
              <div className="text-3xl mb-2">{meta.icon}</div>
              <div className="text-xs font-semibold text-slate-300 leading-snug group-hover:text-violet-300 transition">{key}</div>
            </Link>
          ))}
          <Link href="/browse" className="glass-card p-4 text-center group flex flex-col items-center justify-center">
            <div className="text-3xl mb-2">➕</div>
            <div className="text-xs font-semibold text-slate-400 group-hover:text-violet-300 transition">View all 15</div>
          </Link>
        </div>
      </section>

      {/* ── Inspirational quote ──────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <div className="text-4xl mb-4">🌍</div>
        <p className="text-lg font-black text-white mb-2">
          "It's high time we sell our skills across borders."
        </p>
        <p className="text-slate-400 text-sm mb-6">
          Geography shouldn't limit your income. On SkillBridge, a great skill from anywhere
          finds its buyer everywhere.
        </p>
        <Link href="/sell" className="btn-primary px-8 py-3 text-sm">List your skill free →</Link>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-violet-900/30 py-7 text-center text-xs text-slate-600">
        <div className="flex flex-wrap justify-center gap-5 mb-3">
          {['Browse', 'Sell', 'Help', 'Dashboard'].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} className="hover:text-violet-400 transition">{l}</Link>
          ))}
        </div>
        © 2025 SkillBridge · Zero listing fees · Fair prices for every country
      </footer>
    </div>
  )
}
