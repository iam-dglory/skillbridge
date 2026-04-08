import Link from 'next/link'
import WishlistButton from './WishlistButton'
import { getMaxPrice, CATEGORY_META, COUNTRIES } from '@/lib/ppp'
import type { ListingWithSeller } from '@/types/database'

interface Props {
  listing: ListingWithSeller
  userCountry: string
}

export default function SkillCard({ listing, userCountry }: Props) {
  const pricing   = getMaxPrice(listing.category, userCountry)
  const cat       = CATEGORY_META[listing.category]
  const available = listing.available_countries.includes(userCountry)
  const avgRating = listing.reviews?.length
    ? (listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null

  return (
    <Link
      href={available ? `/listings/${listing.id}` : '#'}
      className={`block bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover relative ${!available ? 'opacity-40 pointer-events-none' : ''}`}
    >
      <WishlistButton listingId={listing.id} />
      <div className={`h-1.5 bg-gradient-to-r ${cat.grad}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
            {cat.icon} {listing.category}
          </span>
          {listing.featured && (
            <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-1 rounded-full">
              ⭐ Top Pick
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">{listing.title}</h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{listing.description}</p>

        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">{listing.users?.avatar_url || '👤'}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate">{listing.users?.name}</div>
            <div className="text-xs text-gray-400">
              {COUNTRIES[listing.users?.country ?? '']?.flag} {listing.users?.country}
            </div>
          </div>
          {avgRating && (
            <div className="text-right shrink-0">
              <div className="text-xs text-yellow-500 font-semibold">★ {avgRating}</div>
              <div className="text-xs text-gray-400">{listing.reviews?.length} reviews</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {available ? (
            <div>
              <div className="text-lg font-extrabold text-indigo-600">{pricing.formatted}</div>
              <div className="text-xs text-gray-400">{pricing.currency} max</div>
            </div>
          ) : (
            <div className="text-xs text-gray-400">Not in {userCountry}</div>
          )}
          <div className="text-xs text-gray-400 text-right">
            🕐 {listing.delivery_days}d<br />delivery
          </div>
        </div>
      </div>
    </Link>
  )
}
