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
    <>
      {/* Mobile: ボトムドック (Glassmorphism) */}
      <nav className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-lg backdrop-blur-xl">
          {links.map(({ href, label, Icon, weight, center }) => (
            <Link key={href} href={href} className="flex flex-1 flex-col items-center" aria-label={label}>
              {center ? (
                <motion.span
                  whileTap={{ scale: 0.92 }}
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-md ${
                    isActive(href)
                      ? 'bg-gradient-to-br from-indigo-500 to-pink-500 text-white'
                      : 'bg-slate-100/80 text-slate-400'
                  }`}
                >
                  <Icon size={24} weight={weight} />
                </motion.span>
              ) : (
                <span className="flex flex-col items-center gap-0.5 py-2">
                  <span className="relative">
                    <Icon
                      size={22}
                      weight={weight}
                      className={isActive(href) ? 'text-indigo-600' : 'text-slate-400'}
                    />
                    {isActive(href) && (
                      <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-500" />
                    )}
                  </span>
                  <span className={`text-[10px] font-medium ${isActive(href) ? 'text-slate-900' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop: サイドバー */}
      <aside className="fixed top-0 left-0 z-40 hidden h-full w-64 flex-col border-r border-slate-100 bg-white/95 backdrop-blur-md md:flex">
        <div className="flex h-16 items-center justify-center border-b border-slate-100 px-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-xl font-bold tracking-wider text-transparent"
          >
            SWEY
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {links
            .filter((l) => !l.center)
            .map(({ href, label, Icon, weight }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive(href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={22} weight={weight} />
                {label}
              </Link>
            ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <Link
            href="/upload"
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              isActive('/upload')
                ? 'bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PlusCircle size={22} weight="fill" />
            投稿する
          </Link>
          <Link
            href="/profile"
            className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium ${
              isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserCircle size={22} weight="regular" />
            プロフィール
          </Link>
        </div>
      </aside>
    </>
  );
}
