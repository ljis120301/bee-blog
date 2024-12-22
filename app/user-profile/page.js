"use client";

import React, { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Information from '../components/Information';
import MoreInformation from '../components/MoreInformation';
import ScrollProgressBar from '../components/ScrollProgressBar';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar";
import Image from 'next/image';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      if (pb.authStore.isValid) {
        const userData = pb.authStore.model;
        setUser(userData);
        setUsername(userData.username);
        setFirstName(userData.name);
        setLastName(userData.last_name);
        setEmail(userData.email);
      } else {
        router.push('/auth');
      }
    };
    loadUserData();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        username: username,
        email: email,
        name: firstName,
        last_name: lastName,
      };
      await pb.collection('users').update(user.id, data);
      setIsEditing(false);
      // Refresh user data
      const updatedUser = await pb.collection('users').getOne(user.id);
      setUser(updatedUser);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
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
                      label: user ? user.username : "Guest",
                      href: "/user-profile",
                      icon: (
                        <Image
                          src={user?.avatar || "/bee-icon.ico"}
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
                                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                      <LabelInputContainer className="flex-1">
                                        <Label htmlFor="firstname">First name</Label>
                                        <Input 
                                          id="firstname" 
                                          value={firstName}
                                          onChange={(e) => setFirstName(e.target.value)}
                                          required
                                        />
                                      </LabelInputContainer>
                                      <LabelInputContainer className="flex-1">
                                        <Label htmlFor="lastname">Last name</Label>
                                        <Input 
                                          id="lastname" 
                                          value={lastName}
                                          onChange={(e) => setLastName(e.target.value)}
                                          required
                                        />
                                      </LabelInputContainer>
                                    </div>
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
                                      <td className="py-4 text-cat-frappe-text">{user.name} {user.last_name}</td>
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
                            <p><strong>Account Created:</strong> {new Date(user.created).toLocaleDateString()}</p>
                            <p><strong>Last Updated:</strong> {new Date(user.updated).toLocaleDateString()}</p>
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
