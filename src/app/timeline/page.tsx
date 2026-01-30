'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTimelinePhotos, getFeaturedBattles } from '@/lib/queries';
import type { Photo } from '@/lib/types';

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<Photo[] | null>(null);
  const [featured, setFeatured] = useState<{ winner_id: string; loser_id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const viewerId = null;

  useEffect(() => {
    Promise.all([getTimelinePhotos(viewerId), getFeaturedBattles(5)]).then(([tl, fb]) => {
      setTimeline(tl || []);
      setFeatured(fb || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pop-cream to-pop-lavender">
        <motion.p
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-pop-text font-medium"
        >
          読み込み中...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg bg-pop-cream px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="mb-6 text-2xl font-bold text-pop-text"
      >
        タイムライン
      </motion.h1>

      {!viewerId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border-2 border-pop-lavender bg-white p-4 shadow-popCard"
        >
          <p className="text-sm text-pop-text">
            ログインするとフォロー中の投稿がここに表示されます。
          </p>
        </motion.div>
      )}

      {timeline && timeline.length > 0 ? (
        <ul className="mb-10 space-y-4">
          {timeline.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl bg-white shadow-popCard"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={photo.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 512px) 100vw, 512px"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="font-mono font-bold text-[#FF6B9D]">Elo {photo.elo_rating}</span>
                <Link
                  href={`/profile/${photo.owner_id}`}
                  className="rounded-xl px-3 py-1.5 text-xs font-medium text-[#A855F7] hover:bg-[#A855F7]/15"
                >
                  投稿者
                </Link>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="mb-10 text-pop-text/70">フォロー中の投稿はまだありません。</p>
      )}

      <h2 className="mb-4 text-lg font-bold text-pop-text">注目のバトル</h2>
      {featured.length === 0 ? (
        <p className="text-pop-text/70">まだバトル記録がありません。</p>
      ) : (
        <ul className="space-y-3">
          {featured.map((b, i) => (
            <motion.li
              key={`${b.winner_id}-${b.loser_id}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border-2 border-pop-lavender bg-white px-4 py-3 text-sm text-pop-text shadow-popCard"
            >
              対戦記録（勝者 / 敗者）
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
