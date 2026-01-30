'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutList, Upload, Trophy, MessageCircle, User } from 'lucide-react';

const links = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/timeline', label: 'Timeline', Icon: LayoutList },
  { href: '/upload', label: 'Upload', Icon: Upload },
  { href: '/ranking', label: 'Ranking', Icon: Trophy },
  { href: '/messages', label: 'DM', Icon: MessageCircle },
  { href: '/profile', label: 'Profile', Icon: User },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-zinc-900 bg-black/95 py-2 backdrop-blur sm:static sm:justify-start sm:gap-1 sm:border-b sm:border-zinc-900 sm:px-4 sm:py-3">
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs transition sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
            isActive(href)
              ? 'bg-[#8B1538]/30 text-[#E63946]'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
          aria-label={label}
        >
          <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
