import Link from 'next/link'
import { CATEGORY_META } from '@/lib/ppp'
import WishlistButton from './WishlistButton'
import type { ListingRow } from '@/types/database'

type Props = {
  listing: ListingRow & { price_local?: number; local_currency?: string }
  country?: string
}

const ENGAGE_BADGES: Record<string, { cls: string; label: string }> = {
  'Freelance':  { cls: 'badge-freelance', label: '⚡ Freelance' },
  'Part-time':  { cls: 'badge-parttime',  label: '🕐 Part-time' },
  'Long-term':  { cls: 'badge-longterm',  label: '🔗 Long-term' },
}

export default function SkillCard({ listing, country }: Props) {
  const meta = CATEGORY_META[listing.category] ?? { icon: '🔧', grad: 'from-violet-500 to-cyan-500' }
  const engagements: string[] = (listing as any).engagement_types ?? []

  return (
    <Link href={`/listing/${listing.id}`} className="block group">
      <div className="glass-card h-full flex flex-col overflow-hidden">
        {/* Top gradient bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${meta.grad}`} />

        <div className="p-5 flex flex-col flex-1">
          {/* Category icon + wishlist */}
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.grad} flex items-center justify-center text-2xl shrink-0`}>
              {meta.icon}
            </div>
            <div onClick={e => e.preventDefault()}>
              <WishlistButton listingId={listing.id} />
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white leading-snug mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
            {listing.title}
          </h3>

          {/* Category + delivery */}
          <p className="text-xs text-slate-400 mb-3">
            {listing.category} · {listing.delivery_days}d delivery
          </p>

          {/* Engagement type badges */}
          {engagements.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {engagements.map(e => {
                const b = ENGAGE_BADGES[e]
                return b ? <span key={e} className={b.cls}>{b.label}</span> : null
              })}
            </div>
          )}

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {listing.tags.slice(0,4).map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-700/30">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto">
            {/* Price */}
            {listing.price_local && listing.local_currency ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="card-price">{listing.local_currency} {Math.round(listing.price_local).toLocaleString()}</span>
                  <div className="text-xs text-slate-500 mt-0.5">PPP-adjusted price</div>
                </div>
                <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {listing.available_countries.length} markets
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">Select country to see price</div>
                <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {listing.available_countries.length} markets
                </span>
              </div>
            )}

            {listing.featured && (
              <div className="mt-2 text-xs text-amber-300 font-semibold flex items-center gap-1">
                <span>⭐</span> Featured listing
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
