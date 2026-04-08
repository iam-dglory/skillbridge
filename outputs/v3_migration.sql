-- SkillBridge V3 Migration
-- Run in Supabase → SQL Editor

-- 1. Drop old category CHECK so we can add more categories
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_check;

-- 2. Add new columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username   text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio        text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS calendly_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile     text;

-- 3. Add new columns to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count      int  DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS engagement_types text[] DEFAULT ARRAY['Freelance'];

-- 4. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id  uuid REFERENCES listings(id)   ON DELETE SET NULL,
  content     text NOT NULL CHECK (char_length(content) <= 1000),
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their messages"   ON messages FOR SELECT  USING  (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send messages"        ON messages FOR INSERT  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver marks read"        ON messages FOR UPDATE  USING  (auth.uid() = receiver_id);

-- 5. Listing views tracking
CREATE TABLE IF NOT EXISTS listing_views (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  viewer_id  uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON listing_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Sellers see their listing views" ON listing_views FOR SELECT
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_id AND l.seller_id = auth.uid()));

-- 6. Wishlists (if not already done)
CREATE TABLE IF NOT EXISTS wishlists (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id)   ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- 7. Call bookings (if not already done)
CREATE TABLE IF NOT EXISTS call_bookings (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id     uuid REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  message        text,
  status         text DEFAULT 'pending',
  created_at     timestamptz DEFAULT now()
);
ALTER TABLE call_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties see own bookings" ON call_bookings FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyer books call"         ON call_bookings FOR INSERT WITH CHECK (auth.uid() = buyer_id);

SELECT 'V3 migration complete ✓' AS result;
