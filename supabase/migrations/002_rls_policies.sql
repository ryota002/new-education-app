-- Enable RLS on all tables
alter table public.users         enable row level security;
alter table public.courses       enable row level security;
alter table public.quizzes       enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.skills        enable row level security;
alter table public.user_skills   enable row level security;

-- Helper: get calling user's role
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from public.users where id = auth.uid();
$$;

-- USERS
create policy "users_select" on public.users for select
  using (id = auth.uid() or get_my_role() = 'manager');

create policy "users_update_manager" on public.users for update
  using (get_my_role() = 'manager');

create policy "users_insert_trigger" on public.users for insert
  with check (true);

-- COURSES (anyone authenticated can read; only managers mutate)
create policy "courses_select_all" on public.courses for select
  using (auth.role() = 'authenticated');

create policy "courses_insert_manager" on public.courses for insert
  with check (get_my_role() = 'manager');

create policy "courses_update_manager" on public.courses for update
  using (get_my_role() = 'manager');

create policy "courses_delete_manager" on public.courses for delete
  using (get_my_role() = 'manager');

-- QUIZZES (read all; managers mutate)
create policy "quizzes_select_all" on public.quizzes for select
  using (auth.role() = 'authenticated');

create policy "quizzes_insert_manager" on public.quizzes for insert
  with check (get_my_role() = 'manager');

create policy "quizzes_update_manager" on public.quizzes for update
  using (get_my_role() = 'manager');

create policy "quizzes_delete_manager" on public.quizzes for delete
  using (get_my_role() = 'manager');

-- QUIZ_ATTEMPTS (trainees see own; managers see all)
create policy "attempts_select" on public.quiz_attempts for select
  using (user_id = auth.uid() or get_my_role() = 'manager');

create policy "attempts_insert_self" on public.quiz_attempts for insert
  with check (user_id = auth.uid());

create policy "attempts_update_self" on public.quiz_attempts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- SKILLS (read-only for all authenticated)
create policy "skills_select_all" on public.skills for select
  using (auth.role() = 'authenticated');

-- USER_SKILLS (trainees see own; managers see all)
create policy "user_skills_select" on public.user_skills for select
  using (user_id = auth.uid() or get_my_role() = 'manager');

create policy "user_skills_insert_self" on public.user_skills for insert
  with check (user_id = auth.uid());

create policy "user_skills_update_self" on public.user_skills for update
  using (user_id = auth.uid());
