'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy } from '@phosphor-icons/react';
import { getTopRanking } from '@/lib/queries';
import type { Photo } from '@/lib/types';

const TAG_CATEGORIES = [
  { value: '', label: 'すべて' },
  { value: 'part', label: '部位' },
  { value: 'title', label: '作品名' },
  { value: 'character', label: 'キャラ名' },
];

export default function RankingPage() {
  const [list, setList] = useState<Photo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagCategory, setTagCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    getTopRanking(tagCategory || undefined).then((data) => {
      setList(data || []);
      setLoading(false);
    });
  }, [tagCategory]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900"
      >
        <Trophy size={28} weight="regular" className="text-slate-400" />
        総合ランキング Top 10
      </motion.h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TAG_CATEGORIES.map(({ value, label }) => (
          <motion.button
            key={value || 'all'}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setTagCategory(value)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              tagCategory === value
                ? 'border-indigo-300 bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-md'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-slate-500"
        >
          読み込み中...
        </motion.p>
      ) : !list?.length ? (
        <p className="text-slate-500">まだデータがありません。</p>
      ) : (
        <ul className="space-y-3">
          {list.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="modern-card flex items-center gap-4 p-4"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                  i === 0
                    ? 'bg-gradient-to-br from-indigo-500 to-pink-500 text-white'
                    : i === 1
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {i + 1}
              </span>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100">
                <Image src={photo.image_url} alt={`#${i + 1}`} fill className="object-cover" sizes="64px" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-sm font-semibold text-indigo-600">Elo {photo.elo_rating}</span>
                {photo.tags && (photo.tags.part || photo.tags.title || photo.tags.character) && (
                  <p className="truncate text-xs text-slate-500">
                    {[photo.tags.part, photo.tags.title, photo.tags.character].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
              <Link
                href={`/profile/${photo.owner_id}`}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                投稿者
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
