import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from '@/components/AppShell';
import { LoginModal } from '@/components/LoginModal';
import './globals.css';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
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
  description: 'SWEY - 写真スワイプ・発見プラットフォーム',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="min-h-screen bg-white font-sans">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <LoginModal />
          <Toaster theme="light" position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
