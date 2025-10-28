import Header from "@/components/app/layout/Header";
import Footer from "@/components/app/layout/Footer";
import Information from "@/components/app/cards/WelcomeSection";
import TagAndEngagementCard from "@/components/app/cards/TagAndEngagementCard";
import MostLikedCard from "@/components/app/cards/MostLikedCard";
import UserFavoritesCard from "@/components/app/cards/UserFavoritesCard";
import ScrollProgressBar from "@/components/app/blog/ScrollProgressBar";
import RssButton from "@/components/app/shared/RssButton";
import { pb } from "@/lib/pocketbase";
import BlogPostsList from "@/components/app/blog/BlogPostsList";
import Link from "next/link";
import { IconFileText, IconHome } from "@tabler/icons-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = {
  title: 'Blog Posts',
  description: 'Explore our latest coding insights, tech trends, and programming tutorials. Discover expert tips, best practices, and in-depth guides for web development, software engineering, and emerging technologies.',
  keywords: 'blog posts, coding tutorials, programming guides, tech articles, web development, software engineering, javascript tutorials, react guides, coding tips, developer resources',
  openGraph: {
    title: 'Blog Posts | BeeBlog',
    description: 'Explore our latest coding insights, tech trends, and programming tutorials.',
    url: 'https://bee.whoisjason.me/blogposts',
  },
  alternates: {
    canonical: 'https://bee.whoisjason.me/blogposts',
  },
};

export default async function Blog() {
  // Fetch a reasonable number of recent posts on the server for initial render
  let posts = [];
  try {
    const result = await pb.collection("posts").getList(1, 50, { sort: "-created", expand: 'tags' });
    posts = result?.items ?? [];
  } catch (error) {
    console.error("Error fetching posts list:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollProgressBar />
      <Header />
      <main className="flex-grow pt-16 text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Breadcrumb className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#F6EEE5]/70 dark:bg-cat-frappe-base/60 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
            <BreadcrumbList className="text-[#4c4f69] dark:text-cat-frappe-subtext0 text-sm sm:text-base md:text-lg">
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center hover:text-cat-frappe-peach" asChild>
                  <Link href="/">
                    <IconHome size={16} className="mr-1" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-cat-frappe-base dark:text-cat-frappe-yellow">
                  <span className="inline-flex items-center"><IconFileText size={16} className="mr-1" /> Blog Posts</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <RssButton size="sm" variant="default" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-6">
          <aside className="lg:col-span-1">
            <div className="space-y-4">
              <TagAndEngagementCard postId={null} tagIds={[]} />
              <UserFavoritesCard limit={5} />
            </div>
          </aside>
          <div className="lg:col-span-2">
            <BlogPostsList initialPosts={posts} />
          </div>
          <aside className="lg:col-span-1">
            <MostLikedCard limit={5} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}