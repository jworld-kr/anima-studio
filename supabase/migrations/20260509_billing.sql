-- ============================================================
-- Anima Studio — Billing schema
-- Tables: billing_keys, subscriptions, payments
-- Includes RLS so each user can only see their own rows.
-- ============================================================

-- 1. billing_keys
--    One per user. Holds the Toss billingKey returned after the user
--    registers a card. Used by the cron worker to charge recurring
--    payments without showing the payment widget again.
create table if not exists public.billing_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  customer_key text not null,                 -- our internal key sent to Toss
  billing_key  text not null,                 -- the token Toss issued
  card_company text,
  card_number  text,                          -- masked, e.g. "433012******1234"
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id)
);

create index if not exists billing_keys_user_id_idx
  on public.billing_keys (user_id);

alter table public.billing_keys enable row level security;

create policy "billing_keys: users see own"
  on public.billing_keys for select
  using (auth.uid() = user_id);

-- Insert / update / delete are done from the server using the service
-- role key (which bypasses RLS), so we don't expose write policies.

-- ============================================================

-- 2. subscriptions
--    The user's plan state. One row per user (no history of past plans).
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  plan                  text not null check (plan in ('free', 'pro', 'studio')),
  status                text not null check (
    status in ('active', 'cancelled', 'past_due', 'expired')
  ),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  cancelled_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id)
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_status_period_end_idx
  on public.subscriptions (status, current_period_end);

alter table public.subscriptions enable row level security;

create policy "subscriptions: users see own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================

-- 3. payments
--    Append-only log of every payment attempt and outcome.
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  subscription_id     uuid references public.subscriptions(id) on delete set null,
  toss_payment_key    text,                   -- key returned by Toss
  toss_order_id       text not null,          -- our orderId we passed to Toss
  amount              integer not null,       -- KRW, integer (no decimals)
  status              text not null check (
    status in ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')
  ),
  failure_reason      text,
  raw_response        jsonb,                  -- full Toss response for audit
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists payments_user_id_idx
  on public.payments (user_id);

create index if not exists payments_toss_order_id_idx
  on public.payments (toss_order_id);

create unique index if not exists payments_toss_order_id_uniq
  on public.payments (toss_order_id);

alter table public.payments enable row level security;

create policy "payments: users see own"
  on public.payments for select
  using (auth.uid() = user_id);

-- ============================================================

-- 4. updated_at trigger helper
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists billing_keys_touch_updated_at on public.billing_keys;
create trigger billing_keys_touch_updated_at
  before update on public.billing_keys
  for each row execute function public.touch_updated_at();

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();
