'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4 sm:max-w-none sm:px-6">
        <Link
          href="/"
          className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-xl font-bold tracking-wider text-transparent sm:text-2xl"
        >
          SWEY
        </Link>
      </div>
    </header>
  );
}
