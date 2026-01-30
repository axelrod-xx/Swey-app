'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const links = [
  { href: '/', label: 'ホーム', emoji: '🏠' },
  { href: '/ranking', label: 'ランキング', emoji: '🏆' },
  { href: '/upload', label: '投稿', emoji: '💖', center: true },
  { href: '/messages', label: 'メッセージ', emoji: '💌' },
  { href: '/profile', label: 'マイページ', emoji: '🐻' },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center gap-1 border-t-[3px] border-candy-lavender/50 bg-candy-cream/98 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(195,177,225,0.15)] backdrop-blur sm:static sm:flex-row sm:justify-center sm:gap-2 sm:rounded-none sm:border-b-[3px] sm:border-candy-lavender/50 sm:bg-candy-cream sm:px-4 sm:py-3">
      {links.map(({ href, label, emoji, center }) => (
        <Link key={href} href={href} className="flex flex-1 flex-col items-center sm:flex-initial" aria-label={label}>
          {center ? (
            <motion.span
              whileTap={{ scale: 0.9 }}
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-[3px] text-2xl shadow-candy-jelly sm:h-12 sm:w-12 sm:text-xl ${
                isActive(href)
                  ? 'border-candy-peach bg-candy-peach text-white'
                  : 'border-candy-peach/70 bg-white text-candy-peach'
              }`}
            >
              {emoji}
            </motion.span>
          ) : (
            <span
              className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-xs sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
                isActive(href) ? 'bg-candy-lavender/25 font-bold text-candy-text' : 'text-candy-text/70'
              }`}
            >
              <span className="text-lg sm:text-base">{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
