'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidates the blog posts listing page and related pages
 * This should be called after creating, updating, or deleting posts or tags
 */
export async function revalidatePostsPage() {
  try {
    // Revalidate the main blog posts listing page
    revalidatePath('/blogposts');
    
    // Revalidate the home page in case it displays recent posts
    revalidatePath('/');
    
    // Revalidate all blog post pages to update tag displays
    revalidatePath('/blogposts/[id]', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Error revalidating paths:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revalidates a specific blog post page
 * @param {string} postId - The ID of the post to revalidate
 */
export async function revalidatePostPage(postId) {
  try {
    revalidatePath(`/blogposts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error('Error revalidating post page:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revalidates all pages (use sparingly)
 */
export async function revalidateAllPages() {
  try {
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error revalidating all pages:', error);
    return { success: false, error: error.message };
  }
}

