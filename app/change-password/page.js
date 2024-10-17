"use client";

import React, { useState } from 'react';
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
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar";
import Image from 'next/image';

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      await pb.collection('users').update(pb.authStore.model.id, {
        oldPassword: oldPassword,
        password: newPassword,
        passwordConfirm: confirmPassword
      });
      setSuccess('Password changed successfully');
      // Clear the form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

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
                      label: pb.authStore.model ? pb.authStore.model.username : "Guest",
                      href: "/user-profile",
                      icon: (
                        <Image
                          src={pb.authStore.model?.avatar || "/bee-icon.ico"}
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
            <main className="flex-1 pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
                <aside className="lg:col-span-1">
                  <Information />
                </aside>
                <div className="lg:col-span-2">
                  <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
                    <div className="rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                      <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                        change password 🔐
                      </h1>
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
          </div>
        </div>
      </SidebarProvider>
      <Footer />
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
