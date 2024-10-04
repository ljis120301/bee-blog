import { ThemeProvider } from 'next-themes';
import './styles/globals.css';

export const metadata = {
  title: "bee blog",
  description: "bee blog",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className='bg-cat-frappe-subtext0 dark:bg-cat-frappe-surface1'>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
      <link rel="icon" href="/bee-icon.ico" />
    </html>
  );
}


