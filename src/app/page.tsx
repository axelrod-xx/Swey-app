'use client';

import { Suspense } from 'react';
import { SwipeView } from '@/components/SwipeView';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center bg-white">
          <p className="text-slate-500">読み込み中...</p>
        </div>
      }
    >
      <SwipeView />
    </Suspense>
  );
}
