"use client";
import React, { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { IconSignature } from "@tabler/icons-react";
import { BeeSwarm } from "@/components/ui/bee-skeleton";
import { useFavorites } from '@/app/contexts/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';

export default function Favorites() {
  const router = useRouter();
  const { favorites, loading, fetchFavorites, removeFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!pb.authStore.isValid) {
        router.push('/auth');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await fetchFavorites();
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError(`Failed to fetch favorites: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchFavorites, router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-base">
      <Header />
      <main className="flex-1 pt-16 container mx-auto px-4 py-8 mt-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Favorite Posts</h1>
        {isLoading ? (
          <div>Loading favorites...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : favorites.length === 0 ? (
          <p className="text-center">You haven't favorited any posts yet.</p>
        ) : (
          <BentoGrid className="max-w-4xl mx-auto">
            {favorites.map((fav, i) => {
              const postId = fav.posts.id || fav.posts; // Adjust based on your data structure
              return (
                <BentoGridItem
                  key={i}
                  title={
                    <div className="flex justify-between items-center">
                      <span>{fav.expand?.posts?.title || 'Unknown Title'}</span>
                      <div>
                        <FavoriteButton postId={postId} />
                      </div>
                    </div>
                  }
                  description={fav.expand?.posts?.description || 'No description available'}
                  header={<BeeSwarm />}
                  icon={<IconSignature className="h-4 w-4 text-neutral-500" />}
                  href={`blogposts/${postId}`}
                />
              );
            })}
          </BentoGrid>
        )}
      </main>
      <Footer />
    </div>
  );
}
