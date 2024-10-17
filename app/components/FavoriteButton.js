import React, { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';

const FavoriteButton = ({ postId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    console.log('FavoriteButton: Checking favorite status for post:', postId);
    console.log('FavoriteButton: Auth status:', pb.authStore.isValid);

    let isMounted = true;
    const controller = new AbortController();

    const checkFavoriteStatus = async () => {
      if (!pb.authStore.isValid) {
        console.log('FavoriteButton: User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        const userId = pb.authStore.model.id;
        console.log('FavoriteButton: Checking favorite status for user:', userId);
        
        // Add a delay before making the API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const favorites = await pb.collection('favorites').getList(1, 1, {
          filter: `user="${userId}" && posts="${postId}"`,
        }, { signal: controller.signal });
        
        console.log('FavoriteButton: Favorite status result:', JSON.stringify(favorites, null, 2));

        if (isMounted) {
          setIsFavorite(favorites.totalItems > 0);
          if (favorites.totalItems > 0) {
            setFavoriteId(favorites.items[0].id);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('FavoriteButton: Error checking favorite status:', error);
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(checkFavoriteStatus, 100);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [postId, pb.authStore.isValid]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!pb.authStore.isValid) {
      // Handle unauthenticated user (e.g., redirect to login)
      return;
    }

    setIsLoading(true);
    const userId = pb.authStore.model.id;
    console.log('Toggling favorite for user:', userId);

    try {
      if (isFavorite) {
        if (favoriteId) {
          await pb.collection('favorites').delete(favoriteId);
        }
      } else {
        const record = await pb.collection('favorites').create({
          user: userId,
          posts: postId,
        });
        setFavoriteId(record.id);
      }
      setIsFavorite(!isFavorite);
      console.log('Favorite toggled:', !isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`transition-colors z-20 ${
        isFavorite ? 'text-red-500' : 'text-gray-500'
      } hover:text-red-600`}
      disabled={isLoading}
    >
      {isFavorite ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
    </button>
  );
};

export default FavoriteButton;
