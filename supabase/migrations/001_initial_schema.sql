-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        text not null check (role in ('trainee', 'manager')) default 'trainee',
  level       int not null default 1 check (level between 1 and 10),
  xp          int not null default 0 check (xp >= 0),
  created_at  timestamptz not null default now()
);

-- Skills master
create table public.skills (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique
);

-- Courses
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

-- Quizzes
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

-- Quiz attempts (one per user per quiz)
create table public.quiz_attempts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  score         int not null,
  answers       jsonb not null,
  completed_at  timestamptz not null default now(),
  unique (user_id, quiz_id)
);

-- User skill scores
create table public.user_skills (
  user_id   uuid not null references public.users(id) on delete cascade,
  skill_id  uuid not null references public.skills(id) on delete cascade,
  score     int not null default 0 check (score between 0 and 100),
  primary key (user_id, skill_id)
);

-- Auto update updated_at
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

-- Auto-create public.users row when auth.users row is inserted
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

-- Seed default skills
insert into public.skills (name) values
  ('ヒアリング力'),
  ('提案力'),
  ('クロージング力'),
  ('コミュニケーション力'),
  ('課題発見力');
