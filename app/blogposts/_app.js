import { FavoritesProvider } from '@/app/contexts/FavoritesContext';

function MyApp({ Component, pageProps }) {
  return (
    <FavoritesProvider>
      <Component {...pageProps} />
    </FavoritesProvider>
  );
}

export default MyApp;