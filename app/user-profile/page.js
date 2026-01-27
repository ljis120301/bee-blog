"use client";

/**
 * User Profile Page - Prisma Version
 * ===================================
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/app/layout/Header';
import Footer from '@/components/app/layout/Footer';
import Information from '@/components/app/cards/WelcomeSection';
import MoreInformation from '@/components/app/cards/MoreInformation';
import ScrollProgressBar from '@/components/app/blog/ScrollProgressBar';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar";
import Image from 'next/image';

const UserProfilePage = () => {
  const { user, isAuthenticated, loading, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (user) {
      setUsername(user.username || '');
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, isAuthenticated, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        await refreshAuth(); // Refresh user data in context
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading || !user) {
    return (
      <>
        <ScrollProgressBar />
        <Header />
        <main className="pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px] min-h-screen flex items-center justify-center">
          <div className="text-cat-frappe-subtext0">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ScrollProgressBar />
      <Header />
      <SidebarProvider>
        <div className="flex flex-col min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-base">
          <div className="flex flex-1 relative">
            <Sidebar>
              <SidebarBody>
                <div className="flex flex-col space-y-2">
                  {/* Add your sidebar links here */}
                </div>
                <div className="mt-auto pt-4">
                  <SidebarLink
                    link={{
                      label: user.username || "User",
                      href: "/user-profile",
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
            <div className="flex flex-col flex-1" style={{ marginLeft: "5rem" }}>
              <main className="pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
                  <aside className="lg:col-span-1">
                    <Information />
                  </aside>
                  <div className="lg:col-span-2">
                    <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
                      <div className="rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                        <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                          account overview 🐝
                        </h1>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
                        {success && <p className="text-green-500 mt-4">{success}</p>}
                        <div className="mt-8">
                          <h2 className="text-2xl font-semibold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">Profile Information</h2>
                          <div className="bg-white dark:bg-cat-frappe-surface0 rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                              {isEditing ? (
                                <form onSubmit={handleSubmit}>
                                  <div className="space-y-4">
                                    <LabelInputContainer>
                                      <Label htmlFor="username">Username</Label>
                                      <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                      />
                                    </LabelInputContainer>
                                    <LabelInputContainer>
                                      <Label htmlFor="name">Name</Label>
                                      <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                      />
                                    </LabelInputContainer>
                                    <LabelInputContainer>
                                      <Label htmlFor="email">Email Address</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                      />
                                    </LabelInputContainer>
                                  </div>
                                </form>
                              ) : (
                                <table className="w-full">
                                  <tbody>
                                    <tr className="border-b border-cat-frappe-surface1">
                                      <td className="py-4 pr-4 font-semibold text-cat-frappe-subtext0 w-1/3">Username</td>
                                      <td className="py-4 text-cat-frappe-text">{user.username}</td>
                                    </tr>
                                    <tr className="border-b border-cat-frappe-surface1">
                                      <td className="py-4 pr-4 font-semibold text-cat-frappe-subtext0 w-1/3">Name</td>
                                      <td className="py-4 text-cat-frappe-text">{user.name || '-'}</td>
                                    </tr>
                                    <tr>
                                      <td className="py-4 pr-4 font-semibold text-cat-frappe-subtext0 w-1/3">Email</td>
                                      <td className="py-4 text-cat-frappe-text">{user.email}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              )}
                            </div>
                            <div className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface2 px-6 py-4">
                              {isEditing ? (
                                <div className="flex justify-end space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust rounded-md hover:opacity-90 transition-opacity"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setIsEditing(true)}
                                  className="w-full px-4 py-2 bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust rounded-md hover:opacity-90 transition-opacity"
                                >
                                  Edit Profile
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">Account Activity</h2>
                            <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                            <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">Account Actions</h2>
                            <Link href="/change-password" className="text-blue-500 hover:underline">Change Password</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <aside className="lg:col-span-1">
                    <MoreInformation />
                  </aside>
                </div>
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default UserProfilePage;
