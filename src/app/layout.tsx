import type { Metadata } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import { Toaster } from 'sonner';
import { Nav } from './Nav';
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
      <body className="min-h-screen bg-pop-cream text-pop-text font-rounded">
        <Nav />
        <main className="pb-20 sm:pb-6">{children}</main>
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
