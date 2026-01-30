'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTopRanking } from '@/lib/queries';
import type { Photo } from '@/lib/types';

const TAG_CATEGORIES = [
  { value: '', label: 'すべて', color: 'bg-[#FF6B9D]' },
  { value: 'part', label: '部位', color: 'bg-[#6BCB77]' },
  { value: 'title', label: '作品名', color: 'bg-[#A855F7]' },
  { value: 'character', label: 'キャラ名', color: 'bg-[#FF9F43]' },
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
    <div className="mx-auto max-w-lg bg-pop-cream px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="mb-6 text-2xl font-bold text-pop-text"
      >
        総合ランキング Top 10
      </motion.h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TAG_CATEGORIES.map(({ value, label, color }) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => setTagCategory(value)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition shadow-popCard active:scale-95 ${
              tagCategory === value
                ? `${color} text-white`
                : 'bg-white text-pop-text hover:bg-pop-lavender/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <motion.p
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-pop-text font-medium"
        >
          読み込み中...
        </motion.p>
      ) : !list?.length ? (
        <p className="text-pop-text/70">まだデータがありません。</p>
      ) : (
        <ul className="space-y-4">
          {list.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-popCard"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white ${
                  i === 0 ? 'bg-gradient-to-br from-[#FFB347] to-[#FF6B9D]' : i === 1 ? 'bg-gradient-to-br from-[#A855F7] to-[#6BCB77]' : 'bg-pop-text/20'
                }`}
              >
                {i + 1}
              </span>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={photo.image_url}
                  alt={`#${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono font-bold text-[#FF6B9D]">Elo {photo.elo_rating}</span>
                {photo.tags && (photo.tags.part || photo.tags.title || photo.tags.character) && (
                  <p className="truncate text-xs text-pop-text/70">
                    {[photo.tags.part, photo.tags.title, photo.tags.character].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
              <Link
                href={`/profile/${photo.owner_id}`}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-[#6BCB77] hover:bg-[#6BCB77]/15"
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
