'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    <div className="mx-auto max-w-lg bg-black px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-100">総合ランキング Top 10</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TAG_CATEGORIES.map(({ value, label }) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => setTagCategory(value)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              tagCategory === value
                ? 'bg-[#8B1538] text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-zinc-500">読み込み中...</p>
      ) : !list?.length ? (
        <p className="text-zinc-500">まだデータがありません。</p>
      ) : (
        <ul className="space-y-4">
          {list.map((photo, i) => (
            <li
              key={photo.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8B1538]/80 text-lg font-bold text-white">
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
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[#E63946]">Elo {photo.elo_rating}</span>
                {photo.tags && (photo.tags.part || photo.tags.title || photo.tags.character) && (
                  <p className="truncate text-xs text-zinc-500">
                    {[photo.tags.part, photo.tags.title, photo.tags.character].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
              <Link
                href={`/profile/${photo.owner_id}`}
                className="text-xs text-zinc-500 hover:text-[#E63946]"
              >
                投稿者
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
