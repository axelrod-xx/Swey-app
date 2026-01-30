import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Nav } from './Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Swey',
  description: 'Swey - 写真バトル',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen bg-black text-zinc-100">
        <Nav />
        <main className="pb-16 sm:pb-0">{children}</main>
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
