'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg bg-black px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-100">タイムライン</h1>

      {!viewerId && (
        <p className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          ログインするとフォロー中の投稿がここに表示されます。
        </p>
      )}

      {timeline && timeline.length > 0 ? (
        <ul className="mb-10 space-y-4">
          {timeline.map((photo) => (
            <li key={photo.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
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
                <span className="font-mono text-sm text-[#E63946]">Elo {photo.elo_rating}</span>
                <Link href={`/profile/${photo.owner_id}`} className="text-xs text-zinc-400 hover:text-zinc-200">
                  投稿者
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-10 text-zinc-500">フォロー中の投稿はまだありません。</p>
      )}

      <h2 className="mb-4 text-lg font-medium text-zinc-200">注目のバトル</h2>
      {featured.length === 0 ? (
        <p className="text-zinc-500">まだバトル記録がありません。</p>
      ) : (
        <ul className="space-y-3">
          {featured.map((b, i) => (
            <li
              key={`${b.winner_id}-${b.loser_id}-${i}`}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400"
            >
              対戦記録（勝者 / 敗者）
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
