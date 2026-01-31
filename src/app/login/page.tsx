'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User } from '@phosphor-icons/react';
import { getSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Mode = 'login' | 'signup';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const { userId, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>(modeParam === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modeParam === 'signup') setMode('signup');
  }, [modeParam]);
  useEffect(() => {
    if (!authLoading && userId) router.replace('/');
  }, [authLoading, userId, router]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      toast.error('設定を確認してください');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'メールかパスワードが正しくありません' : error.message);
      return;
    }
    toast.success('ログインしました');
    router.push('/');
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      toast.error('設定を確認してください');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.user?.identities?.length === 0) {
      toast.error('このメールアドレスは既に登録されています');
      return;
    }
    toast.success('アカウントを作成しました。メールをご確認ください');
    router.push('/');
    router.refresh();
  }

  async function handleSocialLogin(provider: 'google') {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast.error(error.message);
      return;
    }
  }

  function handleForgotPassword() {
    toast.info('パスワードリセットは開発中です');
  }

  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
            <User size={32} weight="regular" className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignUp ? '新規アカウント作成' : 'SWEY へようこそ'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isSignUp ? 'アカウントを作成して始めましょう' : 'ログインして応援を始めましょう'}
          </p>
        </motion.div>

        {/* タブ切り替え */}
        <div className="mb-6 flex rounded-xl border border-slate-100 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            新規登録
          </button>
        </div>

        <motion.form
          key={mode}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={isSignUp ? handleSignUp : handleEmailLogin}
          className="space-y-4"
        >
          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">表示名</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isSignUp}
                placeholder="ニックネーム"
                className="modern-input w-full"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="modern-input w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="modern-input w-full"
            />
            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-1.5 block text-xs text-indigo-600 hover:underline"
              >
                パスワードをお忘れですか？
              </button>
            )}
          </label>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="btn-primary w-full py-4"
          >
            {loading
              ? isSignUp
                ? '登録中...'
                : 'ログイン中...'
              : isSignUp
              ? 'アカウントを作成'
              : 'ログインする'}
          </motion.button>
        </motion.form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">または</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialLogin('google')}
            className="btn-secondary flex w-full items-center justify-center gap-2 py-3.5"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google でログイン
          </motion.button>
        </motion.div>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/welcome" className="font-medium text-indigo-600 underline decoration-2 underline-offset-2 hover:text-indigo-700">
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
