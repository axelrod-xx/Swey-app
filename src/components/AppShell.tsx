'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/app/Header';
import { Nav } from '@/app/Nav';

const PUBLIC_ROUTES = ['/welcome', '/login'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <Nav />
      <main className="pb-28 md:pl-64 md:pb-8">{children}</main>
    </>
  );
}
