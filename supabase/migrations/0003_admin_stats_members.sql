CREATE OR REPLACE FUNCTION public.makhie_admin_stats(code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare out jsonb;
begin
  if not makhie_admin_ok(code) then return jsonb_build_object('error','denied'); end if;
  select jsonb_build_object(
    'users_total', (select count(*) from makhie_members),
    'users_7d', (select count(*) from makhie_members where joined_at > now() - interval '7 days'),
    'live_sessions', (select count(distinct sid) from makhie_events where at > now() - interval '5 minutes'),
    'sessions_today', (select count(distinct sid) from makhie_events where at > date_trunc('day', now())),
    'avg_minutes', (
      select coalesce(round(avg(extract(epoch from span) / 60)::numeric, 1), 0)
      from (select max(at) - min(at) as span from makhie_events
            where at > now() - interval '7 days' group by sid having count(*) > 1) s
    ),
    'pages_top', (
      select coalesce(jsonb_agg(jsonb_build_object('page', page, 'n', n) order by n desc), '[]'::jsonb)
      from (select page, count(*) n from makhie_events
            where at > now() - interval '30 days' and page not like 'hb:%'
            group by page order by n desc limit 12) t
    ),
    'docs_by_kind', (
      select coalesce(jsonb_object_agg(kind, n), '{}'::jsonb)
      from (select kind, count(*) n from makhie_documents group by kind) d
    ),
    'docs_per_user', (
      select case when (select count(*) from makhie_members) = 0 then 0
        else round((select count(*) from makhie_documents)::numeric / (select count(*) from makhie_members), 1) end
    ),
    'receipts_value_cents', (
      select coalesce(sum(amount_cents), 0) from makhie_documents where kind in ('receipt','invoice')
    ),
    'bookings_total', (select count(*) from makhie_bookings),
    'pitches_total', (select count(*) from makhie_pitches),
    'signups_recent', (
      select coalesce(jsonb_agg(jsonb_build_object('email', email, 'at', created_at) order by created_at desc), '[]'::jsonb)
      from (select email, joined_at as created_at from makhie_members order by joined_at desc limit 12) u
    ),
    'banned', (
      select coalesce(jsonb_agg(jsonb_build_object('email', email, 'reason', reason, 'kind', kind, 'at', at) order by at desc), '[]'::jsonb)
      from makhie_banned
    )
  ) into out;
  return out;
end $function$
;
