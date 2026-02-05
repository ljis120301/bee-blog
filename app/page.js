"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/app/layout/Header";
import PrefaceSection from "@/components/app/blog/PrefaceSection";
import Footer from "@/components/app/layout/Footer";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconArrowLeft,
  IconSettings,
  IconUserBolt,
  IconTrash,
  IconEdit,
  IconHeart,
  IconEye,
  IconRss,
} from "@tabler/icons-react";
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from '@/app/contexts/AuthContext';
import InformationComponent from "@/components/app/cards/WelcomeSection";
import MoreInformationComponent from "@/components/app/cards/MoreInformation";
import MostLikedCard from "@/components/app/cards/MostLikedCard";
import { BeeSwarm } from "@/components/ui/bee-skeleton";
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/components/app/shared/ConfirmationDialog';
import ReactPaginate from "react-paginate";
import { useToast } from '@/components/ui/bee-toast';
import FavoriteButton from '@/components/app/shared/FavoriteButton';
import { useFavorites } from '@/app/contexts/FavoritesContext';
import LoadingSpinner from '@/components/app/shared/LoadingSpinner';
import RssButton from '@/components/app/shared/RssButton';
import { useDebounce } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const router = useRouter();
  const { user, isAuthor, isAdmin, logout, loading: authLoading } = useAuth();
  const toast = useToast();
  const [blogPosts, setBlogPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 200);
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const slotsPerPage = 9; // 3 columns × 3 rows = 9 grid slots
  const { fetchFavorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [sortKey, setSortKey] = useState('newest');

  const handleLogout = async () => {
    await logout();
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setIsDeleteDialogOpen(true);
  };

  const handleEditPost = (postId) => {
    router.push(`/blogposts/edit/${postId}`);
  };

  const confirmDeletePost = async () => {
    if (postToDelete) {
      try {
        const res = await fetch(`/api/posts/${postToDelete}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          await fetchFavorites();
          setBlogPosts(blogPosts.filter(post => post.id !== `blogposts/${postToDelete}`));
          toast.success('Post deleted successfully');
        } else {
          console.error('Error deleting post:', data.error);
          toast.error('Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('An error occurred while deleting the post');
      }
    }
    setIsDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch posts from Prisma API with cache disabled to ensure fresh data
      const res = await fetch(`/api/posts?page=${currentPage + 1}&slots=${slotsPerPage}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success) {
        const posts = data.posts.map(post => ({
          title: post.title,
          description: post.description,
          id: `blogposts/${post.id}`,
          icon: <div className="flex items-center gap-1 text-neutral-500">
            <IconEye className="h-4 w-4" />
            <span className="text-sm">{post.views || 0}</span>
          </div>,
          header: <BeeSwarm />,
          className: post.isSpanTwo ? 'col-span-2' : '',
          views: post.views || 0,
          reading_time_minutes: post.readingTimeMinutes || 0,
          created: post.createdAt,
          tags: (post.tags || []).map(t => ({
            id: t.id,
            name: t.name,
            color_bg: t.colorBg,
            color_text: t.colorText,
          }))
        }));
        setBlogPosts(posts);
        setTotalPages(data.pagination?.pages || 0);
      }

      // Fetch tags
      try {
        const tagsRes = await fetch('/api/tags');
        const tagsData = await tagsRes.json();
        if (tagsData.success) {
          setAllTags(tagsData.tags.map(t => ({
            id: t.id,
            name: t.name,
            color_bg: t.colorBg,
            color_text: t.colorText
          })));
        }
      } catch (e) {
        console.warn('Unable to load tags:', e?.message || e);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, slotsPerPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQuery, selectedTagIds]);

  // Update links when user changes
  useEffect(() => {
    const baseLinks = [
      ...(user ? [{
        label: "Favorites",
        href: "/favorites",
        icon: <IconHeart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      }] : []),
      {
        label: "RSS Feed",
        href: "https://bee.whoisjason.me/feed.xml",
        icon: <IconRss className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      },
      {
        label: "Profile",
        href: "/user-profile",
        icon: <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      },
      {
        label: "Settings",
        href: "#",
        icon: <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      },
    ];

    const authLink = user
      ? {
        label: "Logout",
        href: "#",
        icon: <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        onClick: (e) => {
          e.preventDefault();
          handleLogout();
        },
      }
      : {
        label: "Sign Up",
        href: "/auth",
        icon: <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      };

    setLinks([...baseLinks, authLink]);
  }, [user]);

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const visiblePosts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let filtered = blogPosts.filter((p) =>
      (q ? `${p.title ?? ''} ${p.description ?? ''}`.toLowerCase().includes(q) : true)
    );
    if (selectedTagIds.size > 0) {
      filtered = filtered.filter(p => {
        const ids = new Set((p.tags || []).map(t => t.id));
        for (const id of selectedTagIds) {
          if (!ids.has(id)) return false;
        }
        return true;
      });
    }
    // Always sort to ensure correct ordering
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'newest') return new Date(b.created) - new Date(a.created);
      if (sortKey === 'oldest') return new Date(a.created) - new Date(b.created);
      if (sortKey === 'views') return (b.views || 0) - (a.views || 0);
      if (sortKey === 'reading_time') return (b.reading_time_minutes || 0) - (a.reading_time_minutes || 0);
      return 0;
    });
    return sorted;
  }, [blogPosts, debouncedQuery, selectedTagIds, sortKey]);

  // Calculate effective page count - hide pagination when client-side filtering is active
  const effectivePageCount = useMemo(() => {
    const hasClientFilter = debouncedQuery.trim() || selectedTagIds.size > 0;
    if (hasClientFilter) {
      return 1;
    }
    return totalPages;
  }, [totalPages, debouncedQuery, selectedTagIds]);

  const toggleTag = (id) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <>
      <SidebarProvider>
        <div className="flex flex-col min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-base">
          <Header />
          <div className="flex flex-1 relative">
            <Sidebar>
              <SidebarBody>
                <div className="flex flex-col space-y-2">
                  {links.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <SidebarLink
                    link={{
                      label: user ? user.username || user.name : "Guest",
                      href: user ? "/user-profile" : "/auth",
                      icon: (
                        <Image
                          src="/bee-icon.ico"
                          className="rounded-full"
                          width={28}
                          height={28}
                          alt="Avatar"
                        />
                      ),
                    }}
                  />
                </div>
              </SidebarBody>
            </Sidebar>
            <div className="flex flex-col flex-1 transition-all duration-150 ease-in-out" style={{ marginLeft: open ? "16rem" : "5rem" }}>
              <main className="flex-1 overflow-y-auto">
                <div className="max-w-[2000px] mx-auto px-4 py-8 md:py-16">
                  <div className="flex justify-center items-center p-8 mt-8 md:mt-12">
                    <div className="relative group">
                      <h2 className="text-5xl sm:text-6xl font-bold text-cat-frappe-peach relative z-10 transition-colors duration-300">
                        posts 📝
                      </h2>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-cat-frappe-yellow dark:bg-[#e5c890] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                      <div className="absolute -top-3 -left-3 w-4 h-4 border-2 border-cat-frappe-yellow dark:border-[#e5c890] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                      <div className="absolute -bottom-3 -right-3 w-4 h-4 border-2 border-cat-frappe-yellow dark:border-[#e5c890] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                    </div>
                  </div>

                  <section className="my-10">
                    <div className="flex flex-col xl:flex-row gap-8">
                      <div className="xl:w-1/5">
                        <div className="space-y-4">
                          <InformationComponent />
                          <div className="bg-yellow-1 dark:bg-gradient-to-br dark:from-cat-frappe-base dark:to-cat-frappe-crust p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-bold mb-3 text-cat-frappe-base dark:text-cat-frappe-yellow">Subscribe to RSS</h2>
                            <p className="mb-4 text-sm text-cat-frappe-surface1 dark:text-cat-frappe-text">Get updates delivered to your favorite RSS reader</p>
                            <RssButton size="md" variant="default" className="w-full" />
                          </div>
                        </div>
                      </div>
                      <div className="xl:w-3/5">
                        {isLoading ? (
                          <LoadingSpinner />
                        ) : (
                          <>
                            <div className="mb-4">
                              <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search posts..."
                                className="w-full rounded-md border border-[#ccd0da] dark:border-cat-frappe-surface2 bg-white/70 dark:bg-cat-frappe-mantle px-3 py-2 text-base outline-none focus:ring-2 focus:ring-cat-frappe-peach"
                              />
                              {query && (
                                <p className="mt-2 text-xs text-[#6c6f85] dark:text-cat-frappe-subtext1">
                                  Showing {visiblePosts.length} of {blogPosts.length}
                                </p>
                              )}
                              {/* Tag filter chips */}
                              <div className="mt-3 flex items-start justify-between gap-2">
                                <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                                  {allTags.map(t => (
                                    <button
                                      key={t.id}
                                      onClick={() => toggleTag(t.id)}
                                      className={`inline-flex items-center h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border transition-transform ${selectedTagIds.has(t.id) ? 'scale-[1.02]' : ''}`}
                                      style={{ backgroundColor: t.color_bg || '#ef9f76', color: t.color_text || '#303446', borderColor: `${(t.color_text || '#303446')}22` }}
                                    >
                                      #{t.name}
                                    </button>
                                  ))}
                                  {allTags.length > 0 && (
                                    <button
                                      onClick={() => setSelectedTagIds(new Set())}
                                      className="inline-flex items-center h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border border-[#ccd0da] dark:border-cat-frappe-surface2 bg-white/60 dark:bg-cat-frappe-surface0 text-[#4c4f69] dark:text-cat-frappe-subtext0"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                                <div className="shrink-0">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex items-center h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border border-[#ccd0da] dark:border-cat-frappe-surface2 bg-[#F6EEE5] dark:bg-cat-frappe-base text-[#4c4f69] dark:text-cat-frappe-subtext0"
                                      >
                                        Sort: {sortKey === 'newest' ? 'Newest' : sortKey === 'oldest' ? 'Oldest' : sortKey === 'views' ? 'Most viewed' : 'Reading time'}
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-44">
                                      <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setSortKey('newest')}>Newest</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setSortKey('oldest')}>Oldest</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setSortKey('views')}>Most viewed</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setSortKey('reading_time')}>Reading time</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                            <BentoGrid className="xl:auto-rows-[20rem] gap-4">
                              {visiblePosts.map((post, i) => (
                                <BentoGridItem
                                  key={i}
                                  title={
                                    <div className="flex justify-between items-center">
                                      <span>{post.title}</span>
                                      <div>
                                        {(isAuthor || isAdmin) && (
                                          <>
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleEditPost(post.id.split('/')[1]);
                                              }}
                                              className="text-blue-500 hover:text-blue-600 transition-colors z-20 mr-2"
                                            >
                                              <IconEdit size={20} />
                                            </button>
                                            {isAdmin && (
                                              <button
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  handleDeletePost(post.id.split('/')[1]);
                                                }}
                                                className="text-red-500 hover:text-red-600 transition-colors z-20 mr-2"
                                              >
                                                <IconTrash size={20} />
                                              </button>
                                            )}
                                          </>
                                        )}
                                        <FavoriteButton postId={post.id.split('/')[1]} />
                                      </div>
                                    </div>
                                  }
                                  description={post.description}
                                  header={post.header}
                                  className={post.className}
                                  icon={post.icon}
                                  tags={post.tags}
                                  href={post.id}
                                />
                              ))}
                            </BentoGrid>
                            <ReactPaginate
                              forcePage={currentPage}
                              previousLabel={<span className="transform transition-transform hover:scale-105 hover:-rotate-1 inline-block">← Previous</span>}
                              nextLabel={<span className="transform transition-transform hover:scale-105 hover:-rotate-1 inline-block">Next →</span>}
                              pageCount={effectivePageCount}
                              onPageChange={handlePageChange}
                              containerClassName={"flex justify-center items-center space-x-2 mt-8"}
                              pageLinkClassName={"relative px-4 py-2 text-cat-frappe-base bg-cat-frappe-yellow dark:text-cat-frappe-yellow dark:bg-transparent rounded-full font-bold transition-all duration-300 border-2 border-cat-frappe-yellow hover:bg-cat-frappe-yellow/80 hover:text-cat-frappe-base"}
                              previousLinkClassName={"px-4 py-2 text-cat-frappe-base bg-cat-frappe-yellow dark:text-cat-frappe-yellow dark:bg-transparent rounded-full font-bold transition-all duration-300 border-2 border-cat-frappe-yellow hover:bg-cat-frappe-yellow/80 hover:text-cat-frappe-base"}
                              nextLinkClassName={"px-4 py-2 text-cat-frappe-base bg-cat-frappe-yellow dark:text-cat-frappe-yellow dark:bg-transparent rounded-full font-bold transition-all duration-300 border-2 border-cat-frappe-yellow hover:bg-cat-frappe-yellow/80 hover:text-cat-frappe-base"}
                              disabledClassName={"opacity-50 cursor-not-allowed"}
                              activeClassName={"!border-cat-frappe-peach !text-cat-frappe-peach font-extrabold"}
                              renderOnZeroPageCount={null}
                            />
                          </>
                        )}
                      </div>
                      <div className="xl:w-1/5">
                        <div className="space-y-4">
                          <MoreInformationComponent />
                          <MostLikedCard limit={5} />
                        </div>
                      </div>
                    </div>
                  </section>
                  <PrefaceSection />
                </div>
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </SidebarProvider>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeletePost}
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </>
  );
}

const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Bee Blog
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
