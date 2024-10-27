import React, { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useFavorites } from '../contexts/FavoritesContext';

const FavoriteButton = ({ postId }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      if (isFavorite(postId)) {
        console.log(`Removing post ${postId} from favorites`);
        await removeFavorite(postId);
      } else {
        console.log(`Adding post ${postId} to favorites`);
        await addFavorite(postId);
      }
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
      onClick={handleToggleFavorite}
      className={`transition-colors z-20 ${isFavorite(postId) ? 'text-red-500' : 'text-gray-500'} hover:text-red-600`}
      disabled={isLoading}
    >
      {isFavorite(postId) ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
    </button>
  );
};

export default FavoriteButton;
