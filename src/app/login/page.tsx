'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.error(error.message === 'Invalid login credentials' ? 'メールかパスワードが違うよ' : error.message);
      return;
    }
    toast.success('ログインしたよ！💕');
    router.push('/');
    router.refresh();
  }

  async function handleSocialLogin(provider: 'google' | 'github') {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast.error(error.message);
      return;
    }
  }

  return (
    <div className="min-h-screen bg-candy-cream px-4 py-12">
      <div className="mx-auto max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-[3px] border-candy-peach bg-[#FFF0F3] text-4xl shadow-candy-jelly">
            🐻
          </div>
          <h1 className="text-2xl font-bold text-candy-text">Swey へようこそ</h1>
          <p className="mt-1 text-sm text-candy-text/70">ログインして応援を始めよう</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onSubmit={handleEmailLogin}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-candy-text">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="candy-input w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-candy-text">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="candy-input w-full"
            />
          </label>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="candy-btn jelly-pink w-full py-4 text-lg font-bold disabled:opacity-60"
          >
            {loading ? 'ログイン中...' : 'ログインする'}
          </motion.button>
        </motion.form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-candy-lavender/40" />
          <span className="text-xs text-candy-text/50">または</span>
          <div className="h-px flex-1 bg-candy-lavender/40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-3"
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSocialLogin('google')}
            className="candy-btn jelly-outline flex w-full items-center justify-center gap-2 py-3.5 font-medium"
          >
            <span className="text-lg">🔐</span>
            Google でログイン
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSocialLogin('github')}
            className="candy-btn jelly-outline flex w-full items-center justify-center gap-2 py-3.5 font-medium"
          >
            <span className="text-lg">🐙</span>
            GitHub でログイン
          </motion.button>
        </motion.div>

        <p className="mt-8 text-center text-sm text-candy-text/60">
          <Link href="/" className="font-medium text-candy-peach underline decoration-2 underline-offset-2">
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
