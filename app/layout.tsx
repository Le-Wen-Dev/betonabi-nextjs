import type { Metadata } from 'next';
import { Merriweather, Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const merriweather = Merriweather({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Betonabi', template: '%s | Betonabi' },
  description: 'Trang tin tức uy tín hàng đầu',
  icons: {
    icon: '/Betonabi-Logo-Final/PNG/Betonabi-logo-favicon.png',
    shortcut: '/Betonabi-Logo-Final/PNG/Betonabi-logo-favicon.png',
    apple: '/Betonabi-Logo-Final/PNG/Betonabi-logo-favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${merriweather.variable} ${playfair.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
