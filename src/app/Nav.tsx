'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { House, Trophy, PlusCircle, ChatCircleDots, UserCircle } from '@phosphor-icons/react';

const links = [
  { href: '/', label: 'ホーム', Icon: House, weight: 'regular' as const },
  { href: '/ranking', label: 'ランキング', Icon: Trophy, weight: 'regular' as const },
  { href: '/upload', label: '投稿', Icon: PlusCircle, weight: 'fill' as const, center: true },
  { href: '/messages', label: 'メッセージ', Icon: ChatCircleDots, weight: 'regular' as const },
  { href: '/profile', label: 'マイページ', Icon: UserCircle, weight: 'regular' as const },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav className="fixed bottom-4 left-1/2 right-0 z-50 mx-auto w-full max-w-sm -translate-x-1/2 px-4 sm:bottom-6 sm:max-w-md">
      <div className="flex items-end justify-center gap-1 rounded-2xl border border-white/20 bg-white/90 px-2 py-2 shadow-lg backdrop-blur-xl sm:gap-2 sm:px-4 sm:py-3">
        {links.map(({ href, label, Icon, weight, center }) => (
          <Link key={href} href={href} className="flex flex-1 flex-col items-center sm:flex-initial" aria-label={label}>
            {center ? (
              <motion.span
                whileTap={{ scale: 0.92 }}
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl shadow-md sm:h-12 sm:w-12 ${
                  isActive(href)
                    ? 'bg-gradient-to-br from-indigo-500 to-pink-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon size={26} weight={weight} className="sm:h-6 sm:w-6" />
              </motion.span>
            ) : (
              <span className="flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 sm:flex-row sm:gap-2 sm:px-4">
                <span className="relative flex flex-col items-center">
                  <Icon
                    size={24}
                    weight={weight}
                    className={`h-6 w-6 sm:h-5 sm:w-5 ${isActive(href) ? 'text-indigo-600' : 'text-slate-400'}`}
                  />
                  {isActive(href) && (
                    <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
                  )}
                </span>
                <span className={`hidden text-xs font-medium sm:inline ${isActive(href) ? 'text-slate-900' : 'text-slate-500'}`}>
                  {label}
                </span>
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
