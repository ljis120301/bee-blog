"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFavorites = useCallback(async () => {
    if (!pb.authStore.isValid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const userId = pb.authStore.model.id;
      const resultList = await pb.collection('favorites').getList(1, 50, {
        filter: `user="${userId}"`,
        expand: 'posts',
      });
      setFavorites(resultList.items);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((postId) => {
    return favorites.some(fav => fav.posts === postId || fav.posts.id === postId);
  }, [favorites]);

  const addFavorite = useCallback(async (postId) => {
    try {
      const userId = pb.authStore.model.id;
      const data = { user: userId, posts: postId };
      await pb.collection('favorites').create(data);
      console.log(`Favorite added for post ${postId}`);
      await fetchFavorites();
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (postId) => {
    try {
      const favoriteToRemove = favorites.find(fav => fav.posts === postId || fav.posts.id === postId);
      if (favoriteToRemove) {
        await pb.collection('favorites').delete(favoriteToRemove.id);
        console.log(`Favorite removed for post ${postId}`);
        await fetchFavorites();
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }, [favorites, fetchFavorites]);

  const value = {
    favorites,
    loading,
    fetchFavorites,
    isFavorite,
    addFavorite,
    removeFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = React.useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
