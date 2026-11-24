-- Who has an account on Makhie. auth.users is shared with other apps on this project,
-- so membership is recorded when a signed-in user actually opens Makhie.
create table if not exists public.makhie_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  provider text,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.makhie_members enable row level security;
revoke all on public.makhie_members from anon, authenticated;

create or replace function public.makhie_member_seen()
returns void language sql security definer set search_path = public as $$
  insert into makhie_members (user_id, email, provider)
  select u.id, u.email, u.raw_app_meta_data->>'provider' from auth.users u where u.id = auth.uid() and u.email is not null
  on conflict (user_id) do update set email = excluded.email, last_seen_at = now();
$$;
revoke all on function public.makhie_member_seen() from public, anon;
grant execute on function public.makhie_member_seen() to authenticated;

-- The nerdimee.io control room reads the list (role nm_app, server side only).
grant usage on schema public to nm_app;
grant select on public.makhie_members to nm_app;

-- Makhie's own test account predates the table.
insert into public.makhie_members (user_id, email, provider, joined_at, last_seen_at)
select id, email, raw_app_meta_data->>'provider', created_at, coalesce(last_sign_in_at, created_at)
from auth.users where email = 'remoluhle+makhietest@gmail.com'
on conflict do nothing;

-- RLS is on with no public policies; only the control-room role may read.
drop policy if exists makhie_members_control_read on public.makhie_members;
create policy makhie_members_control_read on public.makhie_members for select to nm_app using (true);
