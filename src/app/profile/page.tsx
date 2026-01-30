'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ANON_ID = process.env.NEXT_PUBLIC_ANONYMOUS_OWNER_ID || '';

export default function ProfileRootPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (ANON_ID) {
    return (
      <div className="mx-auto max-w-lg bg-pop-cream px-4 py-8">
        <p className="text-pop-text/80">プロフィールを表示しています。</p>
        <Link
          href={`/profile/${ANON_ID}`}
          className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF9F43] px-6 py-3 font-bold text-white shadow-pop hover:opacity-90"
        >
          自分のプロフィールへ
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-lg bg-pop-cream px-4 py-12 text-center">
      <p className="text-pop-text/80">ログインするとプロフィールが表示されます。</p>
    </div>
  );
}
