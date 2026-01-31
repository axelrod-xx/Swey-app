'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserCircle } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileRootPage() {
  const { userId, openLoginModal } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (userId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <p className="text-slate-600">プロフィールを表示しています</p>
        <Link
          href={`/profile/${userId}`}
          className="btn-primary mt-4 inline-block px-6 py-3"
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
        className="modern-card max-w-sm p-8"
      >
        <p className="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-slate-900">
          <UserCircle size={26} weight="regular" className="text-slate-400" />
          ログインするとプロフィールが表示されます
        </p>
        <p className="mb-6 text-sm text-slate-500">マイページはログイン後に利用できます</p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={openLoginModal}
          className="btn-primary w-full py-4"
        >
          ログインする
        </motion.button>
        <Link href="/" className="mt-4 block text-sm font-medium text-indigo-600 hover:underline">
          トップへ戻る
        </Link>
      </motion.div>
    </div>
  );
}
