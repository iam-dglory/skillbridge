import { createServerClient } from '@/lib/supabase/server'
import { getMaxPrice, CATEGORY_META, COUNTRIES } from '@/lib/ppp'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CheckoutButton from './CheckoutButton'
import type { ListingWithSeller } from '@/types/database'

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { country?: string }
}) {
  const supabase = createServerClient()
  const userCountry = searchParams.country ?? 'India'

  const { data: listing } = await supabase
    .from('listings')
    .select('*, users(name, country, avatar_url, bio), reviews(rating, comment, created_at), portfolio_items(*)')
    .eq('id', params.id)
    .single() as { data: any }

  if (!listing) notFound()

  const pricing = getMaxPrice(listing.category, userCountry)
  const cat = CATEGORY_META[listing.category]
  const sellerCountry = COUNTRIES[listing.users?.country ?? '']
  const avgRating = listing.reviews?.length
    ? (listing.reviews.reduce((s: number, r: any) => s + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/browse" className="text-sm text-gray-500 hover:text-indigo-600 transition mb-6 flex items-center gap-1 font-medium">
        ← Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-7">
          <div className={`h-2 rounded-full bg-gradient-to-r ${cat.grad}`} />

          <div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cat.bg} ${cat.text} mb-3 inline-block`}>
              {cat.icon} {listing.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">{listing.title}</h1>

            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
              <span className="text-3xl">{listing.users?.avatar_url || '👤'}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{listing.users?.name}</div>
                <div className="text-sm text-gray-500">{sellerCountry?.flag} From {listing.users?.country}</div>
              </div>
              {avgRating && (
                <div className="text-right">
                  <div className="text-yellow-500 font-bold">★ {avgRating}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{listing.reviews.length} reviews</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">About this service</h3>
            <p className="text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          {listing.portfolio_items?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Portfolio</h3>
              <div className="grid grid-cols-3 gap-3">
                {listing.portfolio_items.map((item: any) => (
                  <div key={item.id}
                    className={`rounded-xl p-4 bg-gradient-to-br ${cat.grad} text-white text-sm font-semibold text-center flex items-center justify-center min-h-[80px]`}>
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3">Available in</h3>
            <div className="flex flex-wrap gap-2">
              {listing.available_countries.map((c: string) => (
                <span key={c}
                  className={`text-sm px-3 py-1 rounded-full font-medium ${c === userCountry ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300' : 'bg-gray-100 text-gray-600'}`}>
                  {COUNTRIES[c]?.flag} {c}
                </span>
              ))}
            </div>
          </div>

          {listing.reviews?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Reviews</h3>
              <div className="space-y-3">
                {listing.reviews.slice(0, 5).map((review: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                      <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Order card */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-md">
            <div className="text-center mb-5 pb-5 border-b border-gray-100">
              <div className="text-4xl font-black text-indigo-600">{pricing.formatted}</div>
              <div className="text-sm text-gray-400 mt-1">{pricing.currency} max · PPP for {userCountry}</div>
              <div className="text-xs text-gray-300 mt-0.5">≈ ${pricing.usd.toFixed(2)} USD equivalent</div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              {[
                ['📦', 'Category', listing.category],
                ['⏱', 'Delivery', `${listing.delivery_days} days`],
                ['🌍', 'Your country', `${COUNTRIES[userCountry]?.flag} ${userCountry}`],
              ].map(([icon, label, val]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-gray-500">{icon} {label}</span>
                  <span className="font-semibold text-gray-800">{val}</span>
                </div>
              ))}
            </div>

            <CheckoutButton
              listingId={listing.id}
              listingTitle={listing.title}
              sellerId={listing.seller_id}
              sellerStripeAccountId={listing.users?.stripe_account_id}
              priceUSD={pricing.usd}
              priceLocal={pricing.local}
              localCurrency={pricing.currency}
              buyerCountry={userCountry}
            />

            <div className="mt-3 bg-green-50 text-green-700 text-xs rounded-xl p-2.5 text-center">
              ✓ Price capped by PPP — fair for {userCountry}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
