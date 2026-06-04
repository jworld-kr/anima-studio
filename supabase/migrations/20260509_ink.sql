-- ============================================================
-- Anima Studio — Ink (credit) schema
--
-- Ink is the unit consumed by AI actions (topic gen, content gen).
-- Each user has two buckets of ink that are tracked separately:
--
--   * subscription_balance — granted monthly with the subscription.
--     Resets on every renewal. Spent FIRST.
--   * topup_balance — bought via one-time charges. Never expires.
--     Spent only after subscription_balance is exhausted.
--
-- All ink movements are written to ink_transactions for an audit
-- trail. Balances on ink_balances are kept in sync by API routes
-- (we never trust client-side balance math).
-- ============================================================

-- 1. ink_balances — one row per user
create table if not exists public.ink_balances (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  subscription_balance   integer not null default 0 check (subscription_balance >= 0),
  topup_balance          integer not null default 0 check (topup_balance >= 0),
  last_subscription_grant_at timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.ink_balances enable row level security;

create policy "ink_balances: users see own"
  on public.ink_balances for select
  using (auth.uid() = user_id);

-- ============================================================

-- 2. ink_transactions — append-only audit log
create table if not exists public.ink_transactions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,

  -- The kind of movement.
  --   subscription_grant : monthly credit on plan renewal
  --   topup              : user bought a charge package
  --   spend              : an AI action consumed ink
  --   refund             : we refunded ink (e.g. failed generation)
  --   adjustment         : manual / admin
  kind                  text not null check (kind in (
    'subscription_grant', 'topup', 'spend', 'refund', 'adjustment'
  )),

  -- Positive on credit, negative on spend
  amount                integer not null,

  -- Which bucket the change applied to. For spend operations we may
  -- record two rows when the spend is split across buckets.
  bucket                text not null check (bucket in ('subscription', 'topup')),

  -- Free-form context (action='topic_generation' | 'content_generation' |
  -- 'content_regeneration' | …)
  action                text,
  reference_id          text,         -- e.g. payments.id, content.id
  metadata              jsonb,
  balance_after         integer,      -- snapshot of total balance after this tx

  created_at            timestamptz not null default now()
);

create index if not exists ink_transactions_user_id_idx
  on public.ink_transactions (user_id, created_at desc);

create index if not exists ink_transactions_kind_idx
  on public.ink_transactions (kind, created_at desc);

alter table public.ink_transactions enable row level security;

create policy "ink_transactions: users see own"
  on public.ink_transactions for select
  using (auth.uid() = user_id);

-- ============================================================

-- 3. ink_topup_orders — one-time topup payments
--    Mirrors the existing `payments` table but specifically for
--    one-shot ink purchases (not subscription renewals).
create table if not exists public.ink_topup_orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  package_id          text not null,           -- 'ink_small' | 'ink_regular' | 'ink_large'
  toss_order_id       text not null,
  toss_payment_key    text,
  amount              integer not null,        -- KRW
  ink_amount          integer not null,        -- ink credited (incl. bonus)
  status              text not null check (
    status in ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')
  ),
  failure_reason      text,
  raw_response        jsonb,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

create unique index if not exists ink_topup_orders_toss_order_id_uniq
  on public.ink_topup_orders (toss_order_id);

create index if not exists ink_topup_orders_user_id_idx
  on public.ink_topup_orders (user_id, created_at desc);

alter table public.ink_topup_orders enable row level security;

create policy "ink_topup_orders: users see own"
  on public.ink_topup_orders for select
  using (auth.uid() = user_id);

-- ============================================================

-- 4. updated_at trigger reuse
drop trigger if exists ink_balances_touch_updated_at on public.ink_balances;
create trigger ink_balances_touch_updated_at
  before update on public.ink_balances
  for each row execute function public.touch_updated_at();
