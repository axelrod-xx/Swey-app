'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileRootPage() {
  const { userId, openLoginModal } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (userId) {
    return (
      <div className="mx-auto max-w-lg bg-candy-cream px-4 py-8">
        <p className="text-candy-text/80">プロフィールを表示してるよ 💕</p>
        <Link
          href={`/profile/${userId}`}
          className="mt-4 inline-block candy-btn jelly-pink px-6 py-3 font-bold"
        >
          自分のプロフィールへ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="candy-card max-w-sm p-8"
      >
        <p className="mb-2 text-xl font-bold text-candy-text">ログインするとプロフィールが表示されるよ 🐻</p>
        <p className="mb-6 text-sm text-candy-text/70">マイページはログイン後に利用できます</p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={openLoginModal}
          className="candy-btn jelly-pink w-full py-4 font-bold"
        >
          ログインする
        </motion.button>
        <Link href="/" className="mt-4 block text-sm font-medium text-candy-peach underline">
          トップへ戻る
        </Link>
      </motion.div>
    </div>
  );
}
