"use client";

/**
 * Change Password Page - Prisma Version
 * ======================================
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
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar";
import Image from 'next/image';

const ChangePasswordPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

  if (loading || !isAuthenticated) {
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
                      label: user?.username || "User",
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
                        <h1 className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-yellow mb-6">Change Password</h1>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
                        {success && <p className="text-green-500 mt-4">{success}</p>}
                        <form onSubmit={handleSubmit} className="mt-8">
                          <LabelInputContainer className="mb-4">
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <Input
                              id="oldPassword"
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              required
                            />
                          </LabelInputContainer>
                          <LabelInputContainer className="mb-4">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                          </LabelInputContainer>
                          <LabelInputContainer className="mb-6">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </LabelInputContainer>
                          <button
                            type="submit"
                            className="w-full bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust py-2 px-4 rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90"
                          >
                            Change Password
                          </button>
                        </form>
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

export default ChangePasswordPage;
