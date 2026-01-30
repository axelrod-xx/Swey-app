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
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
            onClick={closeLoginModal}
            aria-hidden
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[85vh] overflow-hidden rounded-t-[2rem] border-[3px] border-candy-peach bg-candy-cream shadow-[0_-8px_32px_rgba(255,158,170,0.25)]"
          >
            <div className="flex flex-col items-center px-6 pb-10 pt-8">
              <div className="mb-2 h-1.5 w-14 rounded-full bg-candy-lavender/50" />
              <p className="mb-2 text-center text-2xl font-bold text-candy-text">
                ログインして応援を始めよう！💕
              </p>
              <p className="mb-6 text-center text-sm text-candy-text/70">
                投票・投稿・DM・タイムラインはログイン後に利用できます
              </p>
              <Link
                href="/login"
                onClick={closeLoginModal}
                className="candy-btn jelly-pink mb-3 w-full max-w-xs py-4 text-center text-lg font-bold"
              >
                ログインする
              </Link>
              <button
                type="button"
                onClick={closeLoginModal}
                className="candy-btn jelly-outline text-sm font-medium text-candy-text/80"
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
