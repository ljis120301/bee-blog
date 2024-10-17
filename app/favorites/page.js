"use client";
import React, { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { IconSignature } from "@tabler/icons-react";
import { BeeSwarm } from "@/components/ui/bee-skeleton";

export default function Favorites() {
  const router = useRouter();
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchFavorites = async () => {
      if (!pb.authStore.isValid) {
        router.push('/auth');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userId = pb.authStore.model.id;
        console.log('Current user:', pb.authStore.model);
        console.log('Fetching favorites for user:', userId);

        const favorites = await pb.collection('favorites').getList(1, 50, {
          expand: 'posts',
          filter: `user="${userId}"`,
        }, { signal: controller.signal });

        console.log('Fetched favorites:', JSON.stringify(favorites, null, 2));

        if (isMounted) {
          const posts = await Promise.all(favorites.items.map(async (fav) => {
            console.log('Processing favorite:', JSON.stringify(fav, null, 2));
            let postData = fav.expand?.posts;
            if (!postData) {
              try {
                postData = await pb.collection('posts').getOne(fav.posts);
              } catch (error) {
                console.error('Error fetching post data:', error);
                return null;
              }
            }
            console.log('Post data:', JSON.stringify(postData, null, 2));
            return {
              title: postData?.title || 'Unknown Title',
              description: postData?.description || 'No description available',
              id: `blogposts/${fav.posts}`,
              icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
              header: <BeeSwarm />,
            };
          }));

          const validPosts = posts.filter(post => post !== null);
          console.log('Processed posts:', JSON.stringify(validPosts, null, 2));
          setFavoritePosts(validPosts);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Error fetching favorites:', error);
          setError(`Failed to fetch favorites: ${error.message}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFavorites();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pb.authStore.isValid, router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-base">
      <Header />
      <main className="flex-1 pt-16 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Favorite Posts</h1>
        {isLoading ? (
          <div>Loading favorites...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : favoritePosts.length === 0 ? (
          <p className="text-center">You haven't favorited any posts yet.</p>
        ) : (
          <BentoGrid className="max-w-4xl mx-auto">
            {favoritePosts.map((post, i) => (
              <BentoGridItem
                key={i}
                title={post.title}
                description={post.description}
                header={post.header}
                icon={post.icon}
                href={post.id}
              />
            ))}
          </BentoGrid>
        )}
      </main>
      <Footer />
    </div>
  );
}
