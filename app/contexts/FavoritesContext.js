"use client";

/**
 * Favorites Context - Prisma Version
 * ===================================
 * Manages user's favorite posts using the new API routes
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();

      if (data.success) {
        setFavorites(data.favorites || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites, user]);

  const isFavorite = useCallback((postId) => {
    return favorites.some(fav => fav.postId === postId);
  }, [favorites]);

  const addFavorite = useCallback(async (postId) => {
    if (!isAuthenticated) {
      console.warn('Must be logged in to favorite');
      return false;
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();

      if (data.success) {
        await fetchFavorites();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return false;
    }
  }, [isAuthenticated, fetchFavorites]);

  const removeFavorite = useCallback(async (postId) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();

      if (data.success) {
        await fetchFavorites();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing favorite:", error);
      return false;
    }
  }, [isAuthenticated, fetchFavorites]);

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
