// Auto-generated types matching your Supabase schema
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          country: string
          avatar_url: string | null
          bio: string | null
          stripe_account_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          category: string
          description: string
          delivery_days: number
          available_countries: string[]
          tags: string[]
          is_active: boolean
          featured: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
      portfolio_items: {
        Row: {
          id: string
          listing_id: string
          title: string
          description: string | null
          file_url: string | null
          type: 'image' | 'video' | 'pdf' | 'link'
        }
        Insert: Omit<Database['public']['Tables']['portfolio_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['portfolio_items']['Insert']>
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          listing_id: string
          buyer_country: string
          price_usd: number
          price_local: number
          local_currency: string
          stripe_payment_intent_id: string | null
          status: 'pending' | 'paid' | 'delivered' | 'disputed' | 'refunded'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          listing_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      ppp_config: {
        Row: {
          country_code: string
          country_name: string
          multiplier: number
          currency_code: string
          currency_symbol: string
          usd_exchange_rate: number
          flag_emoji: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ppp_config']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['ppp_config']['Insert']>
      }
    }
  }
}

// Convenience types
export type UserRow      = Database['public']['Tables']['users']['Row']
export type ListingRow   = Database['public']['Tables']['listings']['Row']
export type OrderRow     = Database['public']['Tables']['orders']['Row']
export type ReviewRow    = Database['public']['Tables']['reviews']['Row']
export type PPPConfigRow = Database['public']['Tables']['ppp_config']['Row']

// Listing with seller info joined
export type ListingWithSeller = ListingRow & {
  users: Pick<UserRow, 'name' | 'country' | 'avatar_url'>
  reviews?: { rating: number }[]
}
