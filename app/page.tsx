import { createServerClient } from '@/lib/supabase/server'
import { COUNTRIES, CATEGORY_META, CATEGORY_BASE_PRICES, getMaxPrice, formatLocal } from '@/lib/ppp'
import SkillCard from '@/components/SkillCard'
import Link from 'next/link'
import type { ListingWithSeller } from '@/types/database'

// Revalidate every 60 seconds
export const revalidate = 60

const TABLE_COUNTRIES = ['USA', 'UK', 'Germany', 'India', 'Brazil', 'Japan', 'Nigeria', 'Philippines']

export default async function HomePage({
  searchParams,
}: {
  searchParams: { country?: string }
}) {
  const userCountry = searchParams.country ?? 'India'
  const supabase = createServerClient()

  const { data: featured } = await supabase
    .from('listings')
    .select('*, users(name, country, avatar_url), reviews(rating)')
    .eq('is_active', true)
    .eq('featured', true)
    .contains('available_countries', [userCountry])
    .limit(6) as { data: ListingWithSeller[] | null }

  return (
    <div>
      {/* HERO */}
      <div className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            🌍 PPP-powered pricing · Fair for everyone
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight tracking-tight">
            World-class skills at<br />
            <span className="text-yellow-300">your local price</span>
          </h1>
          <p className="text-white/75 text-lg mb-8 max-w-lg mx-auto">
            Every skill is capped at what&apos;s affordable in your country — powered by Purchasing Power Parity. Fair for buyers everywhere, fair for sellers from anywhere.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/browse" className="px-8 py-3.5 bg-white text-indigo-700 font-extrabold rounded-2xl hover:bg-yellow-50 transition shadow-lg text-base">
              Browse Skills →
            </Link>
            <Link href="/sell" className="px-8 py-3.5 bg-white/20 backdrop-blur border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition text-base">
              Start Selling
            </Link>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {[
            { icon: '💡', title: 'PPP Pricing', desc: 'Max prices are set per country using purchasing power parity — not one flat global rate.' },
            { icon: '🤝', title: 'Fair for everyone', desc: "Sellers earn a fair rate. Buyers pay what's reasonable locally. The market works for both sides." },
            { icon: '🚀', title: 'Sell anywhere', desc: 'Choose which countries to sell in. Your listing shows the correct local price cap automatically.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="text-3xl">{icon}</div>
              <div>
                <div className="font-bold text-gray-900 mb-1">{title}</div>
                <div className="text-sm text-gray-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PPP PRICE TABLE */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-1">Max prices by country</h2>
          <p className="text-gray-500 text-sm mb-6">Auto-calculated using purchasing power parity</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Country</th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-500 text-xs">PPP ×</th>
                  {Object.keys(CATEGORY_BASE_PRICES).map(cat => (
                    <th key={cat} className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                      {CATEGORY_META[cat].icon} {cat.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_COUNTRIES.map((country, i) => {
                  const d = COUNTRIES[country]
                  const isMe = country === userCountry
                  return (
                    <tr key={country} className={`border-b border-gray-50 last:border-0 ${isMe ? 'bg-indigo-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                      <td className="px-5 py-3 font-semibold text-gray-800 whitespace-nowrap">
                        {d.flag} {country} {isMe && <span className="text-xs font-medium text-indigo-500 ml-1">← you</span>}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-gray-400 font-medium">{d.multiplier.toFixed(2)}×</td>
                      {Object.entries(CATEGORY_BASE_PRICES).map(([cat]) => {
                        const p = getMaxPrice(cat, country)
                        return (
                          <td key={cat} className={`px-4 py-3 text-center font-bold ${isMe ? 'text-indigo-600' : 'text-gray-700'}`}>
                            {p.formatted}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FEATURED LISTINGS */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Featured in {COUNTRIES[userCountry]?.flag} {userCountry}</h2>
            <p className="text-sm text-gray-500 mt-1">Top-rated skills available in your country</p>
          </div>
          <Link href="/browse" className="text-sm text-indigo-600 font-semibold hover:underline">View all →</Link>
        </div>

        {!featured || featured.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium">No featured listings yet</div>
            <Link href="/browse" className="mt-3 inline-block text-sm text-indigo-500 hover:underline">Browse all skills</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(l => (
              <SkillCard key={l.id} listing={l} userCountry={userCountry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
