"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Header from "./components/Header";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconTrash,
} from "@tabler/icons-react";
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { pb } from '@/lib/pocketbase';
import InformationComponent from "@/app/components/Information";
import MoreInformationComponent from "@/app/components/MoreInformation";
import { BeeSwarm } from "@/components/ui/bee-skeleton";
import { useRouter } from 'next/navigation';
import ConfirmationDialog from './components/ConfirmationDialog';

export default function Home() {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const handleLogout = async () => {
    pb.authStore.clear();
    setUser(null);
    setUserAvatar(null);
    setIsAuthor(false);
    router.push('/auth');
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      try {
        await pb.collection('posts').delete(postToDelete);
        setBlogPosts(blogPosts.filter(post => post.id !== `blogposts/${postToDelete}`));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
    setIsDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const records = await pb.collection('posts').getList(1, 50, {
          sort: '-created',
        });
        const posts = records.items.map(post => ({
          title: post.title,
          description: post.description,
          id: `blogposts/${post.id}`,
          icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
          header: <BeeSwarm />,
          className: post.isSpanTwo ? 'col-span-2' : '',
        }));
        setBlogPosts(posts);

        const userData = pb.authStore.model;
        setUser(userData);

        if (userData) {
          const avatarUrl = pb.getFileUrl(userData, userData.avatar);
          setUserAvatar(avatarUrl);
          const authorStatus = userData.role === "admin" || userData.role === "author";
          setIsAuthor(authorStatus);
          console.log("User role:", userData.role);
          console.log("Is author:", authorStatus);
        }

        // Update links based on user authentication status
        const baseLinks = [
          {
            label: "Dashboard",
            href: "#",
            icon: <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
          },
          {
            label: "Profile",
            href: "#",
            icon: <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
          },
          {
            label: "Settings",
            href: "#",
            icon: <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
          },
        ];

        const authLink = userData
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Add this console log
  console.log("Current isAuthor state:", isAuthor);

  return (
    <>
      <Head>
        <title>Bee Blog</title>
        <meta name="description" content="A cute bee-themed blog built with Next.js and TailwindCSS" />
        <link rel="icon" href="/bee-icon.ico" />
      </Head>
      <SidebarProvider>
        <div className="flex flex-col min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-base">
          <Header />
          {/* Add this line to display the author status */}
          <div className="text-center py-2 bg-yellow-200">
            Author Status: {isAuthor ? "Author" : "Not Author"}
          </div>
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
                      label: user ? user.username : "Guest",
                      href: "/profile",
                      icon: (
                        <Image
                          src={userAvatar || "/bee-icon.ico"}
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
                        <InformationComponent />
                      </div>
                      <div className="xl:w-3/5">
                        <BentoGrid className="xl:auto-rows-[20rem] gap-4">
                          {blogPosts.map((post, i) => (
                            <BentoGridItem
                              key={i}
                              title={
                                <div className="flex justify-between items-center">
                                  <span>{post.title}</span>
                                  {isAuthor && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeletePost(post.id.split('/')[1]);
                                      }}
                                      className="text-red-500 hover:text-red-600 transition-colors z-20"
                                    >
                                      <IconTrash size={20} />
                                    </button>
                                  )}
                                </div>
                              }
                              description={post.description}
                              header={post.header}
                              className={`${post.className} ${i === 0 ? 'md:col-span-2' : ''}`}
                              icon={post.icon}
                              href={post.id}
                            />
                          ))}
                        </BentoGrid>
                      </div>
                      <div className="xl:w-1/5">
                        <MoreInformationComponent />
                      </div>
                    </div>
                  </section>
                  <AboutSection />
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
        onConfirm={confirmDelete}
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