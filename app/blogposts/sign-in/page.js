"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";

import Header from "../../components/Header"
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";

export default function SignInPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  
  return (
    <>
      <ScrollProgressBar />
      <Header />
      <main className="pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
          <aside className="lg:col-span-1">
            <Information />
          </aside>
          <div className="lg:col-span-2">
            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
              <div className="rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                  welcome back to bee blog ✨
                </h1>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl">
                  please sign in to your account to leave comments and so much more 🌈
                </p>
                <form className="mt-8" onSubmit={handleSubmit}>
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" placeholder="example@example.com" type="email" />
                  </LabelInputContainer>
                  <LabelInputContainer className="mb-6">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" placeholder="••••••••" type="password" />
                  </LabelInputContainer>

                  <button
                    className="bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust block w-full rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#A09AFF_inset,0px_-1px_0px_0px_#FEC9A7_inset]"
                    type="submit">
                    Sign in &rarr;
                    <BottomGradient />
                  </button>

                  <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

                  <div className="flex flex-col space-y-4">
                    <SocialButton icon={<IconBrandGithub />} label="GitHub" />
                    <SocialButton icon={<IconBrandGoogle />} label="Google" />
                    <SocialButton icon={<IconBrandOnlyfans />} label="OnlyFans" />
                  </div>
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
    </>
  );
}

const SocialButton = ({ icon, label }) => (
  <button
    className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-cat-frappe-base dark:text-cat-frappe-text rounded-md h-10 font-medium shadow-input bg-[#eff1f5] dark:bg-cat-frappe-surface0"
    type="button">
    {React.cloneElement(icon, { className: "h-4 w-4" })}
    <span className="text-sm">{label}</span>
    <BottomGradient />
  </button>
);

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
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