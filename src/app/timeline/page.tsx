'use client';

import { motion } from 'framer-motion';
import { Clock } from '@phosphor-icons/react';

export default function TimelinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
          <Clock size={40} weight="regular" className="text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Coming Soon</h1>
        <p className="max-w-sm text-sm text-slate-500">
          タイムライン機能は準備中です。お楽しみに。
        </p>
      </motion.div>
    </div>
  );
}
