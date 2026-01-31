'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function LoginModal() {
  const { loginModalOpen, closeLoginModal } = useAuth();

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
            onClick={closeLoginModal}
            aria-hidden
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[85vh] overflow-hidden rounded-t-2xl border border-slate-100 bg-white shadow-xl"
          >
            <div className="flex flex-col items-center px-6 pb-10 pt-8">
              <div className="mb-4 h-1 w-12 rounded-full bg-slate-200" />
              <p className="mb-2 text-center text-xl font-bold text-slate-900">
                ログインして応援を始めましょう
              </p>
              <p className="mb-6 text-center text-sm text-slate-500">
                投票・投稿・DM・タイムラインはログイン後に利用できます
              </p>
              <Link
                href="/login"
                onClick={closeLoginModal}
                className="btn-primary mb-3 w-full max-w-xs py-4 text-center"
              >
                ログインする
              </Link>
              <button
                type="button"
                onClick={closeLoginModal}
                className="btn-secondary text-sm"
              >
                あとで
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
