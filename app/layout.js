import { ThemeProvider } from 'next-themes';
import './styles/globals.css';
import { FavoritesProvider } from '@/app/contexts/FavoritesContext';
import { Metadata } from 'next';

export const metadata = {
  metadataBase: new URL('https://bee.whoisjason.me'),
  title: {
    default: 'BeeBlog - Buzzing with Code and Tech',
    template: '%s | BeeBlog'
  },
  description: 'BeeBlog: Your hive for coding insights, tech trends, and sweet development tips. Join our community of busy bees!',
  keywords: ['coding', 'technology', 'web development', 'programming', 'tech blog'],
  authors: [{ name: 'Jason', url: 'https://bee.whoisjason.me/about' }],
  creator: 'Jason',
  publisher: 'BeeBlog',
  openGraph: {
    title: 'BeeBlog - Buzzing with Code and Tech',
    description: 'Your hive for coding insights, tech trends, and sweet development tips.',
    url: 'https://bee.whoisjason.me',
    siteName: 'BeeBlog',
    images: [
      {
        url: 'https://bee.whoisjason.me/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BeeBlog - Coding and Tech',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeeBlog - Buzzing with Code and Tech',
    description: 'Your hive for coding insights, tech trends, and sweet development tips.',
    creator: '@your_twitter_handle',
    images: ['https://bee.whoisjason.me/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/bee-icon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://bee.whoisjason.me',
    languages: {
      'en-US': 'https://bee.whoisjason.me',
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <FavoritesProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#E9D4BA" />
          {/* Update these lines for Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
        </head>
        <body className='bg-[#E9D4BA] dark:bg-cat-frappe-surface1 font-sans'>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </FavoritesProvider>
  );
}
