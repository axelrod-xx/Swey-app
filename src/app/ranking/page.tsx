'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTopRanking } from '@/lib/queries';
import type { Photo } from '@/lib/types';

const TAG_CATEGORIES = [
  { value: '', label: 'すべて', color: 'bg-candy-peach border-candy-peach' },
  { value: 'part', label: '部位', color: 'bg-candy-mint border-candy-mint' },
  { value: 'title', label: '作品名', color: 'bg-candy-lavender border-candy-lavender' },
  { value: 'character', label: 'キャラ名', color: 'bg-candy-peach/80 border-candy-peach/80' },
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
    <div className="mx-auto max-w-lg bg-candy-cream px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="mb-6 text-2xl font-bold text-candy-text"
      >
        総合ランキング Top 10 🏆
      </motion.h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TAG_CATEGORIES.map(({ value, label, color }) => (
          <motion.button
            key={value || 'all'}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setTagCategory(value)}
            className={`rounded-2xl border-[3px] px-4 py-2 text-sm font-medium shadow-candy-card transition ${
              tagCategory === value ? `${color} text-white` : 'border-candy-lavender/50 bg-white text-candy-text hover:bg-candy-lavender/15'
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <motion.p
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-candy-text font-medium"
        >
          読み込み中...
        </motion.p>
      ) : !list?.length ? (
        <p className="text-candy-text/70">まだデータがないよ。</p>
      ) : (
        <ul className="space-y-4">
          {list.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="candy-card flex items-center gap-4 p-4"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] text-lg font-bold text-white ${
                  i === 0 ? 'border-candy-peach/80 bg-candy-peach' : i === 1 ? 'border-candy-mint/80 bg-candy-mint' : 'border-candy-lavender/50 bg-candy-lavender/40 text-candy-text'
                }`}
              >
                {i + 1}
              </span>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-candy-lavender/40">
                <Image src={photo.image_url} alt={`#${i + 1}`} fill className="object-cover" sizes="64px" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono font-bold text-candy-peach">Elo {photo.elo_rating}</span>
                {photo.tags && (photo.tags.part || photo.tags.title || photo.tags.character) && (
                  <p className="truncate text-xs text-candy-text/70">
                    {[photo.tags.part, photo.tags.title, photo.tags.character].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
              <Link
                href={`/profile/${photo.owner_id}`}
                className="rounded-xl border-2 border-candy-mint/60 px-3 py-1.5 text-xs font-medium text-candy-mint"
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
