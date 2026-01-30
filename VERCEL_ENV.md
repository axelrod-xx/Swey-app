# Vercel 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| **NEXT_PUBLIC_SUPABASE_URL** | Supabase プロジェクト URL（例: `https://xxxxx.supabase.co`） | ✅ |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | Supabase の anon 公開鍵 | ✅ |
| **SWEY_ANONYMOUS_OWNER_ID** | 投稿・匿名ユーザー用の `profiles.id`（UUID）。投稿・フォロー・DM・サブスクで未ログイン時に使用 | 投稿を使う場合 |
| **NEXT_PUBLIC_ANONYMOUS_OWNER_ID** | クライアントで「現在のユーザー」として使う `profiles.id`。DM・プロフィール・フォロー表示で使用 | DM/プロフィールを正しく動かす場合 |

- **SWEY_ANONYMOUS_OWNER_ID**: サーバー側のみ（投稿の owner_id、サーバーアクションで使用）
- **NEXT_PUBLIC_ANONYMOUS_OWNER_ID**: クライアントに露出（DM の自分、プロフィールの「自分」判定、フォロー対象の判定に使用）

本番で認証を入れる場合は、上記の代わりにセッションの `user.id` を渡す形に差し替えてください。
