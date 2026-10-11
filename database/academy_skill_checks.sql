-- LanguageLab Akademi: private learner self-checks (not proficiency certificates).
-- Safe additive migration; does not touch legacy club tables.
create table if not exists public.academy_skill_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill text not null check (skill in ('speaking','listening','reading','writing')),
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  confidence smallint not null check (confidence between 1 and 5),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists academy_skill_checks_user_date_idx
  on public.academy_skill_checks(user_id, created_at desc);
alter table public.academy_skill_checks enable row level security;
revoke all on table public.academy_skill_checks from anon;
revoke all on table public.academy_skill_checks from authenticated;
grant select, insert, delete on public.academy_skill_checks to authenticated;

create policy academy_skill_checks_own_read on public.academy_skill_checks
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy academy_skill_checks_own_insert on public.academy_skill_checks
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy academy_skill_checks_own_delete on public.academy_skill_checks
  for delete to authenticated
  using (user_id = (select auth.uid()));
