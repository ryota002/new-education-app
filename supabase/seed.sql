-- Optional sample content for local/demo environments.
-- Run after migrations. Auth users should still be created from Supabase Auth.

insert into public.courses (title, description, youtube_url, skill_id, required_level, "order")
select *
from (values
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
  )
) as sample(title, description, youtube_url, skill_id, required_level, "order")
where not exists (
  select 1 from public.courses c where c.title = sample.title
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
where c.title = 'コーチングの基本姿勢'
  and not exists (
    select 1 from public.quizzes q
    where q.course_id = c.id
      and q.question = '受講生が進捗を報告してくれた時、最初に意識したい対応はどれですか？'
  );

insert into public.quizzes (course_id, question, options, correct_answer_index, xp_reward, "order")
select
  c.id,
  'ヒアリングで避けたい質問はどれですか？',
  '["何に困っていますか？", "どこで詰まりましたか？", "なぜできないんですか？", "今の状況を教えてください"]'::jsonb,
  2,
  20,
  1
from public.courses c
where c.title = '課題を引き出すヒアリング'
  and not exists (
    select 1 from public.quizzes q
    where q.course_id = c.id
      and q.question = 'ヒアリングで避けたい質問はどれですか？'
  );

insert into public.quizzes (course_id, question, options, correct_answer_index, xp_reward, "order")
select
  c.id,
  '停滞している受講生に提案する時の基本姿勢はどれですか？',
  '["本人の状況を受け止め、小さく始められる行動を一緒に決める", "期限だけを強く伝える", "他の受講生と比較する", "本人のやる気に任せて連絡を控える"]'::jsonb,
  0,
  25,
  1
from public.courses c
where c.title = '学習継続の提案'
  and not exists (
    select 1 from public.quizzes q
    where q.course_id = c.id
      and q.question = '停滞している受講生に提案する時の基本姿勢はどれですか？'
  );
