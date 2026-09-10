-- Guards for the public-insert tables now that the site faces the internet.
-- Two layers: per-IP rate limits (counted in SQL via PostgREST's forwarded
-- headers) and size caps on free-text fields. Direct/postgres connections
-- (no forwarded IP) bypass the rate limit — that's the trusted path.

create table if not exists public.makhie_rate_limits (
  bucket text not null,
  ip text not null,
  window_start timestamptz not null,
  n int not null default 0,
  primary key (bucket, ip, window_start)
);
alter table public.makhie_rate_limits enable row level security;
-- no policies: only the security-definer function below touches it

create or replace function public.makhie_rate_ok(p_bucket text, max_n int, win interval)
returns boolean language plpgsql security definer set search_path = public as $$
declare req_ip text; ws timestamptz; cnt int;
begin
  begin
    req_ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  exception when others then req_ip := ''; end;
  if req_ip is null or req_ip = '' then return true; end if;  -- trusted path
  ws := to_timestamp(floor(extract(epoch from now()) / extract(epoch from win)) * extract(epoch from win));
  insert into makhie_rate_limits as r (bucket, ip, window_start, n)
    values (p_bucket, req_ip, ws, 1)
    on conflict (bucket, ip, window_start) do update set n = r.n + 1
    returning r.n into cnt;
  -- opportunistic sweep of stale windows
  if random() < 0.01 then
    delete from makhie_rate_limits where window_start < now() - interval '2 days';
  end if;
  return cnt <= max_n;
end $$;

create or replace function public.makhie_guard_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare max_n int := tg_argv[0]::int;
begin
  if not makhie_rate_ok(tg_table_name, max_n, interval '1 hour') then
    raise exception 'Too many requests from your network right now — please try again in a while.'
      using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists makhie_rl on public.makhie_pitches;
create trigger makhie_rl before insert on public.makhie_pitches
  for each row execute function makhie_guard_insert('3');
drop trigger if exists makhie_rl on public.makhie_pitch_responses;
create trigger makhie_rl before insert on public.makhie_pitch_responses
  for each row execute function makhie_guard_insert('10');
drop trigger if exists makhie_rl on public.makhie_sign_requests;
create trigger makhie_rl before insert on public.makhie_sign_requests
  for each row execute function makhie_guard_insert('10');
drop trigger if exists makhie_rl on public.makhie_bookings;
create trigger makhie_rl before insert on public.makhie_bookings
  for each row execute function makhie_guard_insert('6');
drop trigger if exists makhie_rl on public.makhie_events;
create trigger makhie_rl before insert on public.makhie_events
  for each row execute function makhie_guard_insert('150');

-- Size caps: a public form is not a file upload.
alter table public.makhie_pitches
  drop constraint if exists makhie_pitches_sizes,
  add constraint makhie_pitches_sizes check (
    char_length(name) <= 80 and char_length(headline) <= 140 and char_length(idea) <= 4000);
alter table public.makhie_pitch_responses
  drop constraint if exists makhie_pitch_responses_sizes,
  add constraint makhie_pitch_responses_sizes check (
    char_length(investor_name) <= 80 and char_length(message) <= 1000 and char_length(contact) <= 160);
alter table public.makhie_sign_requests
  drop constraint if exists makhie_sign_requests_sizes,
  add constraint makhie_sign_requests_sizes check (
    char_length(from_name) <= 80 and char_length(signer_name) <= 80 and
    char_length(doc_name) <= 140 and char_length(message) <= 500);
alter table public.makhie_bookings
  drop constraint if exists makhie_bookings_sizes,
  add constraint makhie_bookings_sizes check (
    char_length(client_name) <= 80 and char_length(client_phone) <= 30 and
    char_length(service) <= 80 and char_length(notes) <= 800);
alter table public.makhie_events
  drop constraint if exists makhie_events_sizes,
  add constraint makhie_events_sizes check (char_length(page) <= 80);
