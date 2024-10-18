import { ThemeProvider } from 'next-themes';
import './styles/globals.css';
import { FavoritesProvider } from '@/app/contexts/FavoritesContext';

export const metadata = {
  title: "bee blog",
  description: "bee blog",
};

export default function RootLayout({ children }) {
  return (
    <FavoritesProvider>
      <html lang="en" suppressHydrationWarning>
        <body className='bg-[#E9D4BA] dark:bg-cat-frappe-surface1'>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
        <link rel="icon" href="/bee-icon.ico" />
      </html>
    </FavoritesProvider>
  );
}



