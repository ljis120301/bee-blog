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
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"; // Ensure correct import
import BackgroundBeamsWithCollisionDemo from '@/components/example/BackgroundBeamsWithCollisionDemo'; // Ensure correct import

export default function Favorites() {
  const router = useRouter();
  const { favorites, loading, fetchFavorites, removeFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

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

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePost = async () => {
    if (postToDelete) {
      try {
        await removeFavorite(postToDelete);
        console.log(`Post ${postToDelete} removed from favorites`);
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    }
    setIsDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-base">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <BackgroundBeamsWithCollisionDemo />
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center mt-8">Loading favorites...</div>
          ) : error ? (
            <div className="text-center mt-8 text-red-500">Error: {error}</div>
          ) : favorites.length === 0 ? (
            <p className="text-center mt-8">You haven't favorited any posts yet.</p>
          ) : (
            <BentoGrid className="max-w-4xl mx-auto mt-8">
              {favorites.map((fav, i) => {
                const postId = fav.posts.id || fav.posts; // Adjust based on your data structure
                return (
                  <BentoGridItem
                    key={i}
                    title={
                      <div className="flex justify-between items-center">
                        <span>{fav.expand?.posts?.title || 'Unknown Title'}</span>
                        <div>
                          <FavoriteButton 
                            postId={postId} 
                            onRemove={() => handleDeletePost(postId)} // Call handleDeletePost on heart click
                          />
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
        </div>
      </main>
      <Footer />
      
      {/* Confirmation Dialog for Deletion */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#fffbe6] dark:bg-[#2e3440] rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-yellow mb-4">Confirm Delete</h2>
            <p className="text-cat-frappe-surface1 dark:text-cat-frappe-text mb-6">
              Are you sure you want to remove this post from your favorites? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePost}
                className="px-4 py-2 rounded-md border border-black bg-cat-frappe-red text-cat-frappe-base text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
