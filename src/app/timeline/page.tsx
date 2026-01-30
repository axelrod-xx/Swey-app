'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TimelineRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/?tab=timeline');
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-candy-cream">
      <p className="text-candy-text">移動中...</p>
    </div>
  );
}
