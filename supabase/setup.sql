-- Fresh Supabase project setup for the 新人教育システム app.
-- Paste this whole file into Supabase SQL Editor and run it once.

create extension if not exists "uuid-ossp";

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        text not null check (role in ('trainee', 'manager')) default 'trainee',
  level       int not null default 1 check (level between 1 and 10),
  xp          int not null default 0 check (xp >= 0),
  created_at  timestamptz not null default now()
);

create table public.skills (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique
);

create table public.courses (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  youtube_url     text not null,
  skill_id        uuid references public.skills(id),
  required_level  int not null default 1 check (required_level between 1 and 10),
  "order"         int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.quizzes (
  id                    uuid primary key default uuid_generate_v4(),
  course_id             uuid not null references public.courses(id) on delete cascade,
  question              text not null,
  options               jsonb not null,
  correct_answer_index  int not null,
  xp_reward             int not null default 10 check (xp_reward > 0),
  "order"               int not null default 0,
  created_at            timestamptz not null default now()
);

create table public.quiz_attempts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  score         int not null,
  answers       jsonb not null,
  completed_at  timestamptz not null default now(),
  unique (user_id, quiz_id)
);

create table public.user_skills (
  user_id   uuid not null references public.users(id) on delete cascade,
  skill_id  uuid not null references public.skills(id) on delete cascade,
  score     int not null default 0 check (score between 0 and 100),
  primary key (user_id, skill_id)
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_updated_at
  before update on public.courses
  for each row execute function update_updated_at();

create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'trainee'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

insert into public.skills (name) values
  ('ヒアリング力'),
  ('提案力'),
  ('クロージング力'),
  ('コミュニケーション力'),
  ('課題発見力');

alter table public.users         enable row level security;
alter table public.courses       enable row level security;
alter table public.quizzes       enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.skills        enable row level security;
alter table public.user_skills   enable row level security;

create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from public.users where id = auth.uid();
$$;

create policy "users_select" on public.users for select
  using (id = auth.uid() or get_my_role() = 'manager');

create policy "users_update_manager" on public.users for update
  using (get_my_role() = 'manager');

create policy "users_insert_trigger" on public.users for insert
  with check (true);

create policy "courses_select_all" on public.courses for select
  using (auth.role() = 'authenticated');

create policy "courses_insert_manager" on public.courses for insert
  with check (get_my_role() = 'manager');

create policy "courses_update_manager" on public.courses for update
  using (get_my_role() = 'manager');

create policy "courses_delete_manager" on public.courses for delete
  using (get_my_role() = 'manager');

create policy "quizzes_select_all" on public.quizzes for select
  using (auth.role() = 'authenticated');

create policy "quizzes_insert_manager" on public.quizzes for insert
  with check (get_my_role() = 'manager');

create policy "quizzes_update_manager" on public.quizzes for update
  using (get_my_role() = 'manager');

create policy "quizzes_delete_manager" on public.quizzes for delete
  using (get_my_role() = 'manager');

create policy "attempts_select" on public.quiz_attempts for select
  using (user_id = auth.uid() or get_my_role() = 'manager');

create policy "attempts_insert_self" on public.quiz_attempts for insert
  with check (user_id = auth.uid());

create policy "attempts_update_self" on public.quiz_attempts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "skills_select_all" on public.skills for select
  using (auth.role() = 'authenticated');

create policy "user_skills_select" on public.user_skills for select
  using (user_id = auth.uid() or get_my_role() = 'manager');

create policy "user_skills_insert_self" on public.user_skills for insert
  with check (user_id = auth.uid());

create policy "user_skills_update_self" on public.user_skills for update
  using (user_id = auth.uid());

insert into public.courses (title, description, youtube_url, skill_id, required_level, "order")
values
  (
    'コーチングの基本姿勢',
    '新人コーチが最初に押さえるべき、承認・傾聴・問いかけの基本を学びます。',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    (select id from public.skills where name = 'コミュニケーション力'),
    1,
    1
  ),
  (
    '課題を引き出すヒアリング',
    '受講生の状況を整理し、次の一歩につながる課題を見つける聞き方を学びます。',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    (select id from public.skills where name = 'ヒアリング力'),
    1,
    2
  ),
  (
    '学習継続の提案',
    '停滞している受講生に対して、責めずに行動を促す提案の作り方を学びます。',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    (select id from public.skills where name = '提案力'),
    2,
    3
  );

insert into public.quizzes (course_id, question, options, correct_answer_index, xp_reward, "order")
select
  c.id,
  '受講生が進捗を報告してくれた時、最初に意識したい対応はどれですか？',
  '["具体的に承認してから次の学びを確認する", "すぐ次の課題だけ伝える", "進捗が遅い点を先に指摘する", "スタンプだけ返す"]'::jsonb,
  0,
  20,
  1
from public.courses c
where c.title = 'コーチングの基本姿勢';

insert into public.quizzes (course_id, question, options, correct_answer_index, xp_reward, "order")
select
  c.id,
  'ヒアリングで避けたい質問はどれですか？',
  '["何に困っていますか？", "どこで詰まりましたか？", "なぜできないんですか？", "今の状況を教えてください"]'::jsonb,
  2,
  20,
  1
from public.courses c
where c.title = '課題を引き出すヒアリング';

insert into public.quizzes (course_id, question, options, correct_answer_index, xp_reward, "order")
select
  c.id,
  '停滞している受講生に提案する時の基本姿勢はどれですか？',
  '["本人の状況を受け止め、小さく始められる行動を一緒に決める", "期限だけを強く伝える", "他の受講生と比較する", "本人のやる気に任せて連絡を控える"]'::jsonb,
  0,
  25,
  1
from public.courses c
where c.title = '学習継続の提案';
