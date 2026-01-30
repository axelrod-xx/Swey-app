'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutList, Upload, Trophy, MessageCircle, User } from 'lucide-react';

const links = [
  { href: '/', label: 'Home', Icon: Home, color: 'text-[#FF6B9D]', bg: 'bg-[#FF6B9D]/15', hover: 'hover:bg-[#FF6B9D]/25' },
  { href: '/timeline', label: 'Timeline', Icon: LayoutList, color: 'text-[#A855F7]', bg: 'bg-[#A855F7]/15', hover: 'hover:bg-[#A855F7]/25' },
  { href: '/upload', label: 'Upload', Icon: Upload, color: 'text-[#FF9F43]', bg: 'bg-[#FF9F43]/15', hover: 'hover:bg-[#FF9F43]/25' },
  { href: '/ranking', label: 'Ranking', Icon: Trophy, color: 'text-[#6BCB77]', bg: 'bg-[#6BCB77]/15', hover: 'hover:bg-[#6BCB77]/25' },
  { href: '/messages', label: 'DM', Icon: MessageCircle, color: 'text-[#FF85A2]', bg: 'bg-[#FF85A2]/15', hover: 'hover:bg-[#FF85A2]/25' },
  { href: '/profile', label: 'Profile', Icon: User, color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/15', hover: 'hover:bg-[#60A5FA]/25' },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around gap-1 rounded-t-3xl border-t-2 border-pop-lavender bg-white/95 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur sm:static sm:justify-start sm:gap-2 sm:rounded-none sm:border-b-2 sm:border-pop-lavender sm:bg-pop-cream sm:px-4 sm:py-3">
      {links.map(({ href, label, Icon, color, bg, hover }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2.5 text-xs transition sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
            isActive(href) ? `${bg} ${color} font-bold` : `text-pop-text/70 ${hover}`
          }`}
          aria-label={label}
        >
          <Icon className="h-6 w-6 sm:h-5 sm:w-5" strokeWidth={2.2} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
