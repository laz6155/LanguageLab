-- LanguageLab Academy: isolated tables in the existing authenticated Supabase project.
-- Additive only: no existing club tables, policies, functions or users are modified.
-- Apply as one reviewed migration using the connected Supabase migration tool.
-- All publicly accessible tables explicitly enable Row Level Security.

create table if not exists public.academy_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','educator')),
  created_at timestamptz not null default now()
);

create table if not exists public.academy_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  learning_goal text not null default '' check (char_length(learning_goal) <= 500),
  target_level text not null default 'Not sure' check (target_level in ('Not sure','A1-A2','B1-B2','C1-C2')),
  language text not null default 'tr' check (language in ('tr','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_tr text not null check (char_length(title_tr) between 3 and 120),
  title_en text not null check (char_length(title_en) between 3 and 120),
  description_tr text not null default '' check (char_length(description_tr) <= 1400),
  description_en text not null default '' check (char_length(description_en) <= 1400),
  level_group text not null default 'ALL' check (level_group in ('ALL','A1-A2','B1-B2','C1-C2')),
  category text not null default 'general' check (category in ('general','speaking','private','professional','educator')),
  delivery_format text not null default 'online' check (delivery_format in ('online','in_person','hybrid','self_paced')),
  access_mode text not null default 'approval' check (access_mode in ('approval','self_enroll')),
  status text not null default 'draft' check (status in ('draft','waitlist','open','archived')),
  constraint academy_waitlist_requires_approval check (status <> 'waitlist' or access_mode = 'approval'),
  position integer not null default 100 check (position between 0 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academy_courses_catalog_idx on public.academy_courses (status,position);

create table if not exists public.academy_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','completed','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id,user_id)
);
create index if not exists academy_enrollments_user_idx on public.academy_enrollments(user_id,status);
create index if not exists academy_enrollments_course_idx on public.academy_enrollments(course_id,status);

create table if not exists public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  title_tr text not null check (char_length(title_tr) between 3 and 160),
  title_en text not null check (char_length(title_en) between 3 and 160),
  summary_tr text not null default '',
  summary_en text not null default '',
  position integer not null default 100 check (position between 0 and 100000),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists academy_modules_course_idx on public.academy_modules(course_id,position);

create table if not exists public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  title_tr text not null check (char_length(title_tr) between 3 and 160),
  title_en text not null check (char_length(title_en) between 3 and 160),
  content_tr text not null default '' check (char_length(content_tr) <= 20000),
  content_en text not null default '' check (char_length(content_en) <= 20000),
  estimated_minutes integer not null default 10 check (estimated_minutes between 1 and 240),
  position integer not null default 100 check (position between 0 and 100000),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists academy_lessons_module_idx on public.academy_lessons(module_id,position);

create table if not exists public.academy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key(user_id,lesson_id)
);

create table if not exists public.academy_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 180),
  due_date date,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists academy_tasks_user_idx on public.academy_tasks (user_id, is_done, created_at desc);

create table if not exists public.academy_announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.academy_courses(id) on delete cascade,
  title_tr text not null check (char_length(title_tr) between 2 and 160),
  title_en text not null check (char_length(title_en) between 2 and 160),
  body_tr text not null default '' check (char_length(body_tr) <= 2000),
  body_en text not null default '' check (char_length(body_en) <= 2000),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.academy_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  title_tr text not null check (char_length(title_tr) between 2 and 160),
  title_en text not null check (char_length(title_en) between 2 and 160),
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 10 and 300),
  location_text text not null default '' check (char_length(location_text) <= 240),
  meeting_url text not null default '' check (char_length(meeting_url) <= 500 and (meeting_url = '' or meeting_url ~ '^https://')), 
  status text not null default 'scheduled' check (status in ('scheduled','cancelled','completed')),
  created_at timestamptz not null default now()
);
create index if not exists academy_sessions_date_idx on public.academy_sessions (starts_at,course_id);

alter table public.academy_staff enable row level security;
alter table public.academy_profiles enable row level security;
alter table public.academy_courses enable row level security;
alter table public.academy_enrollments enable row level security;
alter table public.academy_modules enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_progress enable row level security;
alter table public.academy_tasks enable row level security;
alter table public.academy_announcements enable row level security;
alter table public.academy_sessions enable row level security;

-- Manager role cannot be granted or changed from a public browser. Only a trusted
-- server-side SQL operation can add members to academy_staff.
create policy academy_staff_self_read on public.academy_staff for select to authenticated
  using (user_id = (select auth.uid()));

create policy academy_profiles_self_read on public.academy_profiles for select to authenticated
  using (user_id=(select auth.uid()) or exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')));
create policy academy_profiles_self_insert on public.academy_profiles for insert to authenticated
  with check (user_id=(select auth.uid()));
create policy academy_profiles_self_update on public.academy_profiles for update to authenticated
  using (user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create policy academy_catalog_public on public.academy_courses for select to anon,authenticated
  using (status in ('open','waitlist'));
create policy academy_courses_manager on public.academy_courses for all to authenticated
  using (exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')))
  with check(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')));

create policy academy_enrollment_own_read on public.academy_enrollments for select to authenticated
  using (user_id=(select auth.uid()));
create policy academy_enrollment_own_join on public.academy_enrollments for insert to authenticated
  with check (
    user_id=(select auth.uid()) and
    exists(select 1 from public.academy_courses c where c.id=course_id
      and (c.status='open' or c.status='waitlist')
      and ((c.status='open' and c.access_mode='self_enroll' and status='active')
        or (c.access_mode='approval' and status='pending')))
  );
create policy academy_enrollment_manager on public.academy_enrollments for all to authenticated
  using (exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')))
  with check (exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')));

create policy academy_modules_enrolled_read on public.academy_modules for select to authenticated
  using (is_published and exists (
    select 1 from public.academy_enrollments e where e.course_id=academy_modules.course_id
    and e.user_id=(select auth.uid()) and e.status='active'
  ));
create policy academy_modules_manager on public.academy_modules for all to authenticated
  using(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')))
  with check(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')));

create policy academy_lessons_enrolled_read on public.academy_lessons for select to authenticated
  using (is_published and exists (
    select 1 from public.academy_modules m join public.academy_enrollments e on e.course_id=m.course_id
    where m.id=academy_lessons.module_id and m.is_published
      and e.user_id=(select auth.uid()) and e.status='active'
  ));
create policy academy_lessons_manager on public.academy_lessons for all to authenticated
  using(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')))
  with check(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')));

create policy academy_progress_self_read on public.academy_progress for select to authenticated
  using(user_id=(select auth.uid()));
create policy academy_progress_self_insert on public.academy_progress for insert to authenticated
  with check(user_id=(select auth.uid()) and exists(
    select 1 from public.academy_lessons l
      join public.academy_modules m on m.id=l.module_id
      join public.academy_enrollments e on e.course_id=m.course_id
    where l.id=lesson_id and l.is_published and m.is_published
      and e.user_id=(select auth.uid()) and e.status='active'
  ));
create policy academy_progress_self_delete on public.academy_progress for delete to authenticated
  using(user_id=(select auth.uid()));

create policy academy_tasks_self on public.academy_tasks for all to authenticated
  using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create policy academy_announcements_student_read on public.academy_announcements for select to authenticated
  using(is_published and (course_id is null or exists(
    select 1 from public.academy_enrollments e where e.course_id=academy_announcements.course_id
      and e.user_id=(select auth.uid()) and e.status='active'
  )));
create policy academy_announcements_manager on public.academy_announcements for all to authenticated
  using(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')))
  with check(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')));

create policy academy_sessions_enrolled_read on public.academy_sessions for select to authenticated
  using(exists(select 1 from public.academy_enrollments e where e.course_id=academy_sessions.course_id
    and e.user_id=(select auth.uid()) and e.status='active'));
create policy academy_sessions_manager on public.academy_sessions for all to authenticated
  using(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')))
  with check(exists(select 1 from public.academy_staff a where a.user_id=(select auth.uid()) and a.role in ('owner','manager')));

-- Explicit Data API grants. These are necessary but NOT sufficient; RLS still applies.
grant select on public.academy_courses to anon;
grant select,insert,update,delete on public.academy_courses to authenticated;
grant select on public.academy_staff to authenticated;
grant select,insert,update on public.academy_profiles to authenticated;
grant select,insert,update,delete on public.academy_enrollments to authenticated;
grant select,insert,update,delete on public.academy_modules to authenticated;
grant select,insert,update,delete on public.academy_lessons to authenticated;
grant select,insert,delete on public.academy_progress to authenticated;
grant select,insert,update,delete on public.academy_tasks to authenticated;
grant select,insert,update,delete on public.academy_announcements to authenticated;
grant select,insert,update,delete on public.academy_sessions to authenticated;

-- Existing trusted club administrators can bootstrap the Academy admin workspace.
insert into public.academy_staff(user_id,role)
  select user_id,'owner' from public.esc_admins
  on conflict(user_id) do nothing;

insert into public.academy_courses(slug,title_tr,title_en,description_tr,description_en,level_group,category,delivery_format,access_mode,status,position)
values
 ('speaking-starter','İngilizce Konuşmaya Başla','Start Speaking English','Kısa, kendi hızında ilerlediğin ücretsiz konuşma alıştırmaları. Hesabınla katılıp ilerlemeni kaydet.','A free self-paced introduction to speaking with bite-sized lessons and progress tracking.','A1-A2','speaking','self_paced','self_enroll','open',10),
 ('eryaman-speaking-club','Eryaman Speaking Club','Eryaman Speaking Club','Akademinin yüz yüze ve çevrim içi konuşma topluluğu; katılım için yer ve tarih bilgileri ayrıca paylaşılır.','The academy speaking community with online and in-person meetups; dates and venues are communicated separately.','ALL','speaking','hybrid','approval','open',20),
 ('birebir-ingilizce','Birebir İngilizce','One-to-one English','Eğitmenle hedefe yönelik özel ders ve kişiselleştirilmiş takip. Başvurular uygunluk durumuna göre değerlendirilir.','Individual lessons tailored to your goals with educator support, subject to availability.','ALL','private','online','approval','open',30),
 ('online-speaking','Online Konuşma Programı','Online Speaking Program','Seviyene göre canlı çevrim içi konuşma grupları. Yeni grup kayıtları için ön talep toplanıyor.','Level-based live online speaking groups. We are collecting interest for upcoming cohorts.','B1-B2','speaking','online','approval','waitlist',40),
 ('english-at-work','İş Hayatında İngilizce','English at Work','Mülakat, toplantı, sunum ve iş yazışmaları için uygulamalı İngilizce.','Practical English for interviews, meetings, presentations and workplace communication.','B1-B2','professional','online','approval','waitlist',50),
 ('advanced-discussion','İleri Seviye Tartışma','Advanced Discussion','C1–C2 düzeyinde argüman kurma ve ileri seviye konuşma pratiği.','Advanced discussion and nuanced argumentation for C1–C2 speakers.','C1-C2','speaking','online','approval','waitlist',60),
 ('educator-development','Eğitmen Gelişim Programı','Educator Development','Ders tasarımı, oyunlaştırma ve sınıf yönetimi üzerine profesyonel içerik.','Professional development in lesson planning, gamification and classroom management.','ALL','educator','online','approval','waitlist',70)
on conflict(slug) do nothing;

insert into public.academy_modules(course_id,title_tr,title_en,summary_tr,summary_en,position,is_published)
select id,'Konuşma Temelleri','Conversation Foundations','Kısa cümlelerle konuşmaya başla.','Begin speaking using practical short sentences.',10,true
from public.academy_courses where slug='speaking-starter'
and not exists (select 1 from public.academy_modules m where m.course_id=academy_courses.id and m.title_en='Conversation Foundations');

insert into public.academy_lessons(module_id,title_tr,title_en,content_tr,content_en,position,estimated_minutes,is_published)
select m.id, v.title_tr,v.title_en,v.content_tr,v.content_en,v.position,v.estimated_minutes,true
from public.academy_modules m
join public.academy_courses c on c.id=m.course_id
cross join (values
 ('Tanışma ve selamlaşma','Introductions and greetings',
  E'Hedef: Kendini 3 kısa cümleyle tanıt.\n\n1. Hello, my name is ____.\n2. I am from ____.\n3. I enjoy ____.\n\nPratik: Kendini sesli olarak üç kez tanıt. İkinci denemende kağıda bakma.\n\nMini görev: Karşındakine "What do you enjoy?" diye sor.',
  E'Goal: Introduce yourself in three short sentences.\n\n1. Hello, my name is ____.\n2. I am from ____.\n3. I enjoy ____.\n\nPractice: Say your introduction aloud three times. On the second attempt, look away from the notes.\n\nMini task: Ask someone "What do you enjoy?".',10,8),
 ('Sohbeti devam ettir','Keep a conversation going',
  E'Hedef: Tek kelimelik cevaptan sonra bir takip sorusu sor.\n\nA: What do you do on weekends?\nB: I usually meet friends. How about you?\n\nKullan: Really? / Why? / What about you? / Can you tell me more?\n\nPratik: Bir arkadaşınla üç takip sorusu sorarak konuş.',
  E'Goal: Ask a follow-up question instead of stopping after a one-word answer.\n\nA: What do you do on weekends?\nB: I usually meet friends. How about you?\n\nUse: Really? / Why? / What about you? / Can you tell me more?\n\nPractice: Keep a conversation going with three follow-up questions.',20,10),
 ('Günlük rutinini anlat','Talk about your routine',
  E'Hedef: Günlük bir alışkanlığını zaman ifadeleriyle açıkla.\n\nI usually wake up at 7.\nI sometimes study English in the evening.\nI never skip breakfast.\n\nPratik: 30 saniyelik bir sesli anlatım yap. always / usually / sometimes / never kelimelerini kullan.',
  E'Goal: Describe a daily habit using time expressions.\n\nI usually wake up at 7.\nI sometimes study English in the evening.\nI never skip breakfast.\n\nPractice: Give a 30-second spoken description using always / usually / sometimes / never.',30,10),
 ('Bir sonraki adımın','Your next step',
  E'Hedef: Dört haftalık ulaşılabilir konuşma hedefi belirle.\n\n1. Bu hafta 2 konuşma denemesi yapacağım.\n2. Her gün 5 yeni ifade çalışacağım.\n3. Birine "Tell me more" diye takip sorusu soracağım.\n\nPratik: Hedefini öğrenci panelindeki görevler bölümüne ekle.',
  E'Goal: Set a realistic four-week speaking goal.\n\n1. I will attempt two conversations this week.\n2. I will practise five expressions each day.\n3. I will ask someone "Tell me more" as a follow-up.\n\nPractice: Add your goal as a task in your student dashboard.',40,7)
) as v(title_tr,title_en,content_tr,content_en,position,estimated_minutes)
where c.slug='speaking-starter' and m.title_en='Conversation Foundations'
and not exists (select 1 from public.academy_lessons l where l.module_id=m.id and l.title_en=v.title_en);