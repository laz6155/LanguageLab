-- Staged only: DO NOT apply until Academy contact/privacy notice is reviewed.
-- Enforces private first-party inquiry storage. Public form submits via an
-- Edge Function using server-side credentials; browsers get no table grants.
create table if not exists public.academy_inquiries (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check(request_type in ('student','educator')),
  full_name text not null check(char_length(full_name) between 2 and 90),
  email text not null check(char_length(email) between 5 and 200),
  level_group text check(level_group in ('Not sure','A1-A2','B1-B2','C1-C2')),
  programme text check(programme in ('speaking','online','career','advanced','personal','studio')),
  specialty text check(char_length(specialty)<=120),
  message text not null default '' check(char_length(message)<=1500),
  contact_consent boolean not null check (contact_consent = true),
  consent_text_version text not null default 'draft-v1',
  status text not null default 'new' check(status in ('new','contacted','closed')),
  source text not null default 'homepage' check(source='homepage'),
  ip_hash text check(ip_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (request_type='educator' or (level_group is not null and programme is not null)),
  check (request_type='student' or (specialty is not null and char_length(specialty)>0))
);
create index if not exists academy_inquiries_created_idx on public.academy_inquiries(created_at desc);
create index if not exists academy_inquiries_ip_idx on public.academy_inquiries(ip_hash,created_at);
create index if not exists academy_inquiries_email_idx on public.academy_inquiries(lower(email),created_at);
alter table public.academy_inquiries enable row level security;
revoke all on public.academy_inquiries from anon, authenticated;
grant select,update,delete on public.academy_inquiries to authenticated;
-- No grants or INSERT policy for browsers; only server-side service role can insert.
create policy academy_inquiries_manager_read on public.academy_inquiries
  for select to authenticated
  using(exists(select 1 from public.academy_staff s
    where s.user_id=(select auth.uid()) and s.role in ('owner','manager')));
create policy academy_inquiries_manager_update on public.academy_inquiries
  for update to authenticated
  using(exists(select 1 from public.academy_staff s
    where s.user_id=(select auth.uid()) and s.role in ('owner','manager')))
  with check(exists(select 1 from public.academy_staff s
    where s.user_id=(select auth.uid()) and s.role in ('owner','manager')));
create policy academy_inquiries_manager_delete on public.academy_inquiries
  for delete to authenticated
  using(exists(select 1 from public.academy_staff s
    where s.user_id=(select auth.uid()) and s.role in ('owner','manager')));
