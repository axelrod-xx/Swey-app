# Vercel 環境変数

## 基本（Supabase）

| 変数名 | 説明 | 必須 |
|--------|------|------|
| **NEXT_PUBLIC_SUPABASE_URL** | Supabase プロジェクト URL（例: `https://xxxxx.supabase.co`） | ✅ |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | Supabase の anon 公開鍵 | ✅ |
| **SWEY_ANONYMOUS_OWNER_ID** | 投稿・匿名ユーザー用の `profiles.id`（UUID）。投稿・フォロー・DM・サブスクで未ログイン時に使用 | 投稿を使う場合 |
| **NEXT_PUBLIC_ANONYMOUS_OWNER_ID** | クライアントで「現在のユーザー」として使う `profiles.id`。DM・プロフィール・フォロー・**管理者**で使用 | DM/プロフィール/Admin を使う場合 |

- **SWEY_ANONYMOUS_OWNER_ID**: サーバー側のみ（投稿の owner_id、サーバーアクションで使用）
- **NEXT_PUBLIC_ANONYMOUS_OWNER_ID**: クライアントに露出（DM の自分、プロフィールの「自分」判定、フォロー対象、**管理者として /admin にアクセスするユーザー**）

## 収益化（Stripe）

| 変数名 | 説明 | 必須 |
|--------|------|------|
| **STRIPE_SECRET_KEY** | Stripe のシークレットキー（sk_...） | サブスク・アンロック決済を使う場合 |
| **STRIPE_WEBHOOK_SECRET** | Webhook 署名シークレット（whsec_...）。`/api/stripe/webhook` 用 | Webhook で DB 更新する場合 |
| **STRIPE_SUBSCRIPTION_PRICE_ID** | 月額サブスク用の Stripe Price ID（price_...） | サブスク決済を使う場合 |
| **STRIPE_UNLOCK_AMOUNT_JPY** | 単品アンロックの金額（円）。未設定時は 300 | 任意 |
| **NEXT_PUBLIC_APP_URL** | アプリの公開 URL（Stripe リダイレクト用）。例: `https://swey.vercel.app` | 決済成功/キャンセル URL に使用 |

## 管理者・Webhook 用

| 変数名 | 説明 | 必須 |
|--------|------|------|
| **SUPABASE_SERVICE_ROLE_KEY** | Supabase の service_role 鍵。**Webhook 内で subscriptions / purchases を更新する場合に必須**。RLS をバイパスするため厳重に管理すること | Stripe Webhook で DB 更新する場合 |

---

## 管理者の設定

`/admin` にアクセスできるようにするには、Supabase の **SQL Editor** で以下を実行し、該当ユーザーを管理者にしてください。

```sql
UPDATE profiles SET is_admin = true WHERE id = 'ここに NEXT_PUBLIC_ANONYMOUS_OWNER_ID の値を入れる';
```

本番で認証を入れる場合は、上記の代わりにセッションの `user.id` を渡す形に差し替えてください。

---

## Supabase Auth と profiles の自動作成

メール/パスワードやソーシャルログインでサインアップしたユーザーを `profiles` テーブルで扱うには、**Supabase の Database でトリガーを設定**し、`auth.users` に新規ユーザーが追加されたタイミングで `profiles` に1行挿入する必要があります。

**Supabase Dashboard → SQL Editor** で以下を実行してください。

```sql
-- auth.users に新規ユーザーが作成されたら profiles に1行挿入する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users の INSERT に紐づけるトリガー
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

これにより、ログイン・サインアップ後に `profiles` にレコードが自動作成され、アプリ内のプロフィール表示やフォロー・DM 等が正しく動作します。

---

## likes テーブル（スワイプ記録）

スワイプ（LIKE / PASS）機能を使うには、`supabase/migrations/20250126000000_create_likes.sql` を Supabase SQL Editor で実行するか、以下を手動で実行してください。

```sql
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('like', 'pass')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, photo_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
```
