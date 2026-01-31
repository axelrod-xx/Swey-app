-- likes テーブル: スワイプ（LIKE/PASS）の記録
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('like', 'pass')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, photo_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_photo_id ON public.likes(photo_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS: 認証ユーザーは自分の like のみ操作可能
CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own likes"
  ON public.likes FOR SELECT USING (auth.uid() = user_id);
