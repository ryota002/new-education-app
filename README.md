# 新人教育システム

動画教材、理解度クイズ、XP/レベル、スキルレーダー、管理者向けのコース・クイズ管理を備えた新人教育アプリです。ログイン不要で試せる「受講生返信クイズ」も同梱しています。

## 主な画面

- `/auth/login`: ログイン
- `/dashboard`: 新人向けダッシュボード
- `/courses`: コース一覧
- `/profile`: プロフィールとスキル可視化
- `/admin`: 管理者ダッシュボード
- `/admin/courses`: コース・クイズ管理
- `/reply-quiz`: 受講生返信トレーニング

## セットアップ

Node.js 20.9 以上を使います。迷ったら Node.js 22 を使ってください。

1. 環境変数の見本をコピーします。

```bash
cp .env.example .env.local
```

`.env.local` に Supabase の接続情報を入れます。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. 依存関係をインストールします。

```bash
npm install
```

3. Supabase SQL Editor で `supabase/setup.sql` を丸ごと実行します。

既存プロジェクトに分けて適用したい場合は、以下を順番に実行してください。

```bash
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/seed.sql
```

4. Supabase Auth でユーザーを作成します。

管理者にしたいユーザーは、作成後に Supabase Table Editor で `public.users.role` を `manager` に更新してください。

5. 起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。ログイン後、ロールに応じて新人画面または管理画面へ遷移します。

## 検証

```bash
npm run lint
npm run build
```

またはまとめて確認します。

```bash
npm run check
```

## Vercel で渡す場合

一番簡単な共有方法は Vercel へのデプロイです。

1. このフォルダを GitHub リポジトリに push
2. Vercel で New Project からそのリポジトリを選択
3. Environment Variables に `.env.example` と同じ2項目を設定
4. Deploy

Supabase 側の URL 設定も忘れずに更新してください。

- Site URL: Vercel の公開 URL
- Redirect URLs: Vercel の公開 URL
