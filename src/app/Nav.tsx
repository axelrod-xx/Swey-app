'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'バトル' },
  { href: '/upload', label: '投稿' },
  { href: '/ranking', label: 'ランキング' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-zinc-800 bg-zinc-900/95 py-2 backdrop-blur sm:static sm:justify-start sm:gap-6 sm:border-b sm:px-6 sm:py-3">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            pathname === href
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
