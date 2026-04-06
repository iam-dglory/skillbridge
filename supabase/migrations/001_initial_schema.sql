-- =====================================================
-- SkillBridge — Initial Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =====================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────
create table public.users (
  id                uuid primary key references auth.users(id) on delete cascade,
  name              text not null,
  email             text not null unique,
  country           text not null default 'USA',
  avatar_url        text,
  bio               text,
  stripe_account_id text,  -- Stripe Connect Express account ID (sellers only)
  created_at        timestamptz not null default now()
);

-- Row Level Security: users can only read/update their own row
alter table public.users enable row level security;

create policy "Users can view any profile"
  on public.users for select using (true);

create policy "Users can update their own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────
-- LISTINGS
-- ─────────────────────────────────────────────────────
create table public.listings (
  id                  uuid primary key default uuid_generate_v4(),
  seller_id           uuid not null references public.users(id) on delete cascade,
  title               text not null,
  category            text not null check (category in (
                        'Video Editing', 'Graphic Design',
                        'Writing & Translation', 'Programming & Tech', 'Vibe Coding'
                      )),
  description         text not null,
  delivery_days       int not null default 3,
  available_countries text[] not null default '{}',
  tags                text[] not null default '{}',
  is_active           boolean not null default true,
  featured            boolean not null default false,
  created_at          timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Anyone can view active listings"
  on public.listings for select using (is_active = true);

create policy "Sellers can insert their own listings"
  on public.listings for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own listings"
  on public.listings for update using (auth.uid() = seller_id);

create policy "Sellers can delete their own listings"
  on public.listings for delete using (auth.uid() = seller_id);

-- ─────────────────────────────────────────────────────
-- PORTFOLIO ITEMS
-- ─────────────────────────────────────────────────────
create table public.portfolio_items (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  title       text not null,
  description text,
  file_url    text,
  type        text not null default 'image' check (type in ('image', 'video', 'pdf', 'link'))
);

alter table public.portfolio_items enable row level security;

create policy "Anyone can view portfolio items"
  on public.portfolio_items for select using (true);

create policy "Sellers manage their portfolio items"
  on public.portfolio_items for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  ));

-- ─────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────
create table public.orders (
  id                        uuid primary key default uuid_generate_v4(),
  buyer_id                  uuid not null references public.users(id),
  listing_id                uuid not null references public.listings(id),
  buyer_country             text not null,
  price_usd                 numeric(10,2) not null,
  price_local               numeric(14,2) not null,
  local_currency            text not null,
  stripe_payment_intent_id  text,
  status                    text not null default 'pending'
                              check (status in ('pending','paid','delivered','disputed','refunded')),
  created_at                timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Buyers can view their orders"
  on public.orders for select using (auth.uid() = buyer_id);

create policy "Sellers can view orders for their listings"
  on public.orders for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  ));

create policy "Buyers can create orders"
  on public.orders for insert with check (auth.uid() = buyer_id);

-- ─────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────
create table public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id),
  reviewer_id  uuid not null references public.users(id),
  listing_id   uuid not null references public.listings(id),
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique (order_id)  -- one review per order
);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews"
  on public.reviews for select using (true);

create policy "Buyers can create reviews for their orders"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

-- ─────────────────────────────────────────────────────
-- PPP CONFIG
-- ─────────────────────────────────────────────────────
create table public.ppp_config (
  country_code      text primary key,   -- e.g. 'IN', 'US'
  country_name      text not null,
  multiplier        numeric(6,4) not null,
  currency_code     text not null,
  currency_symbol   text not null,
  usd_exchange_rate numeric(12,4) not null,
  flag_emoji        text not null,
  updated_at        timestamptz not null default now()
);

alter table public.ppp_config enable row level security;
create policy "Anyone can read PPP config" on public.ppp_config for select using (true);

-- ─────────────────────────────────────────────────────
-- SEED: PPP CONFIG DATA
-- ─────────────────────────────────────────────────────
insert into public.ppp_config values
  ('US', 'USA',          1.00, 'USD', '$',    1,      '🇺🇸', now()),
  ('GB', 'UK',           0.68, 'GBP', '£',    0.79,   '🇬🇧', now()),
  ('DE', 'Germany',      0.65, 'EUR', '€',    0.92,   '🇩🇪', now()),
  ('FR', 'France',       0.63, 'EUR', '€',    0.92,   '🇫🇷', now()),
  ('AU', 'Australia',    0.72, 'AUD', 'A$',   1.52,   '🇦🇺', now()),
  ('CA', 'Canada',       0.73, 'CAD', 'C$',   1.36,   '🇨🇦', now()),
  ('JP', 'Japan',        0.42, 'JPY', '¥',    149,    '🇯🇵', now()),
  ('AE', 'UAE',          0.50, 'AED', 'د.إ',  3.67,   '🇦🇪', now()),
  ('CN', 'China',        0.16, 'CNY', '¥',    7.24,   '🇨🇳', now()),
  ('IN', 'India',        0.10, 'INR', '₹',    83,     '🇮🇳', now()),
  ('BR', 'Brazil',       0.22, 'BRL', 'R$',   4.97,   '🇧🇷', now()),
  ('MX', 'Mexico',       0.20, 'MXN', 'MX$',  17.2,   '🇲🇽', now()),
  ('ZA', 'South Africa', 0.14, 'ZAR', 'R',    18.9,   '🇿🇦', now()),
  ('NG', 'Nigeria',      0.06, 'NGN', '₦',    1580,   '🇳🇬', now()),
  ('PH', 'Philippines',  0.12, 'PHP', '₱',    56,     '🇵🇭', now()),
  ('ID', 'Indonesia',    0.11, 'IDR', 'Rp',   15600,  '🇮🇩', now());

-- ─────────────────────────────────────────────────────
-- USEFUL INDEXES
-- ─────────────────────────────────────────────────────
create index listings_seller_id_idx    on public.listings(seller_id);
create index listings_category_idx     on public.listings(category);
create index listings_is_active_idx    on public.listings(is_active);
create index orders_buyer_id_idx       on public.orders(buyer_id);
create index orders_listing_id_idx     on public.orders(listing_id);
create index reviews_listing_id_idx    on public.reviews(listing_id);

-- Done! Your schema is ready.
