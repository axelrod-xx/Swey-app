'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getTopRanking } from '@/lib/queries';
import type { Photo } from '@/lib/types';

export default function RankingPage() {
  const [list, setList] = useState<Photo[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopRanking().then((data) => {
      setList(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-zinc-100">総合ランキング Top 10</h1>
      {!list?.length ? (
        <p className="text-zinc-500">まだデータがありません。</p>
      ) : (
        <ul className="space-y-4">
          {list.map((photo, i) => (
            <li
              key={photo.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-lg font-bold text-amber-400">
                {i + 1}
              </span>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={photo.image_url}
                  alt={`#${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
              <span className="font-mono text-zinc-300">Elo {photo.elo_rating}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
