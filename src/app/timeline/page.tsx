'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TimelineRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-white">
      <p className="text-slate-500">移動中...</p>
    </div>
  );
}
