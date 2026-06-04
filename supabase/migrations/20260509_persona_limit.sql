-- Enforce per-plan persona (channel) limit at the database level.
-- Free: 1, Pro: 3, Studio: 10. Unknown / no subscription = free.
--
-- channels.user_email is text, while subscriptions.user_id is uuid.
-- We resolve user_email -> auth.users.id to look up the plan.

create or replace function public.enforce_persona_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid;
  v_plan       text;
  v_status     text;
  v_limit      int;
  v_count      int;
begin
  -- Resolve user_id from email
  select id into v_user_id
    from auth.users
   where email = NEW.user_email
   limit 1;

  if v_user_id is null then
    raise exception 'PERSONA_LIMIT: unknown user'
      using errcode = 'P0001';
  end if;

  -- Look up active subscription. If none / not active, treat as free.
  select plan, status into v_plan, v_status
    from public.subscriptions
   where user_id = v_user_id
   limit 1;

  if v_plan is null or v_status <> 'active' then
    v_plan := 'free';
  end if;

  v_limit := case v_plan
    when 'free'   then 1
    when 'pro'    then 3
    when 'studio' then 10
    else 1
  end;

  -- Count existing personas for this user
  select count(*) into v_count
    from public.channels
   where user_email = NEW.user_email;

  if v_count >= v_limit then
    raise exception 'PERSONA_LIMIT: plan=% allows % personas (current=%)',
      v_plan, v_limit, v_count
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$;

drop trigger if exists channels_enforce_persona_limit on public.channels;
create trigger channels_enforce_persona_limit
  before insert on public.channels
  for each row
  execute function public.enforce_persona_limit();
