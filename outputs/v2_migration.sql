-- SkillBridge V2 Migration
-- Run in Supabase SQL Editor

-- 1. Add engagement_types column to listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS engagement_types text[] DEFAULT ARRAY['Freelance'];

-- 2. Add mobile column to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mobile text;

-- 3. Create call_bookings table
CREATE TABLE IF NOT EXISTS call_bookings (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id     uuid REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  message        text,
  status         text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE call_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer sees own call bookings"
  ON call_bookings FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyer can book calls"
  ON call_bookings FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Seller can update call status"
  ON call_bookings FOR UPDATE
  USING (auth.uid() = seller_id);

-- Done!
SELECT 'V2 migration complete ✓' AS result;
