import type { Metadata } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Nav } from './Nav';
import { LoginModal } from '@/components/LoginModal';
import './globals.css';

const mplus = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-mplus-rounded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Swey',
  description: 'Swey - 写真バトル・応援プラットフォーム',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={mplus.variable}>
      <body className="min-h-screen bg-candy-cream text-candy-text font-rounded">
        <AuthProvider>
          <Nav />
          <main className="pb-20 sm:pb-6">{children}</main>
          <LoginModal />
          <Toaster theme="light" position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
