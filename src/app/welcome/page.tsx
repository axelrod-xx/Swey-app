'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Fire } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomePage() {
  const router = useRouter();
  const { userId, loading } = useAuth();
  useEffect(() => {
    if (!loading && userId) router.replace('/');
  }, [loading, userId, router]);
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* オーロラグラデーション背景 */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)] bg-white" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(236,72,153,0.08),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_50%_30%_at_20%_80%,rgba(99,102,241,0.06),transparent)]" />

      {/* ヘッダー */}
      <header className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link
          href="/welcome"
          className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-xl font-bold tracking-wider text-transparent"
        >
          SWEY
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ログイン
        </Link>
      </header>

      {/* ヒーロー */}
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            直感で選ぶ、
            <br />
            新しい評価。
          </h1>
          <p className="mb-10 text-slate-600 md:text-lg">
            スワイプで写真を気軽に評価。シンプルで楽しい体験をお届けします。
          </p>
        </motion.div>

        {/* モックアップ（プレースホルダー） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12 flex aspect-[3/4] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl md:max-w-[320px]"
        >
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <Fire size={64} weight="fill" className="text-indigo-300" />
            <span className="text-sm font-medium">スワイプで気軽に評価</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link
            href="/login?mode=signup"
            className="block w-full rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 py-4 text-center text-lg font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:opacity-95"
          >
            新規登録してはじめる（無料）
          </Link>
          <p className="mt-4 text-center text-xs text-slate-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="font-medium text-indigo-600 underline hover:text-indigo-700">
              ログイン
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
