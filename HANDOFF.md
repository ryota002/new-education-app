# 受け渡しメモ

このフォルダをそのまま GitHub に上げて、Vercel と Supabase をつなぐのが一番簡単です。

## 渡す相手に必要なもの

- Node.js 20.9 以上（推奨: 22）
- Supabase アカウント
- Vercel アカウント（公開して共有する場合）

## 最短手順

1. Supabase で新規プロジェクトを作る
2. Supabase SQL Editor で `supabase/setup.sql` を丸ごと実行する
3. Supabase の Project Settings > API から以下を控える
   - Project URL
   - anon public key
4. このリポジトリを GitHub に push する
5. Vercel で GitHub リポジトリを選んでデプロイする
6. Vercel の Environment Variables に以下を設定する

```bash
NEXT_PUBLIC_SUPABASE_URL=SupabaseのProject URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabaseのanon public key
```

7. Supabase Auth の URL Configuration で以下を設定する
   - Site URL: Vercel の公開 URL
   - Redirect URLs: Vercel の公開 URL

## 管理者ユーザーの作り方

1. Supabase Auth でユーザーを作る
2. Table Editor の `public.users` を開く
3. 管理者にしたいユーザーの `role` を `manager` に変更する

通常ユーザーは `role` が `trainee` のままで使えます。

## ローカルで確認する場合

```bash
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` には Supabase の URL と anon key を入れてください。

## 動作確認

```bash
npm run check
```

ログイン不要で見られる画面:

```text
/reply-quiz
```
