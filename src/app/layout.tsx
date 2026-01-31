import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_JP } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from './Header';
import { Nav } from './Nav';
import { LoginModal } from '@/components/LoginModal';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SWEY',
  description: 'SWEY - 写真バトル・応援プラットフォーム',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${plusJakarta.variable} ${notoSansJP.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans">
        <AuthProvider>
          <Header />
          <main className="pb-24 sm:pb-28">{children}</main>
          <Nav />
          <LoginModal />
          <Toaster theme="light" position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
