'use client';

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
import { IconBrandGithub, IconBrandGoogle, IconBrandOnlyfans } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const authData = await pb.collection('users').authWithPassword(email, password);
        
        if (!authData.record.verified) {
          setError('Please verify your email address before logging in.');
          // Optionally resend verification email
          await pb.collection('users').requestVerification(email);
          setVerificationSent(true);
          return;
        }
        
        router.push('/');
      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        
        const data = {
          username: username,
          email: email,
          emailVisibility: true,
          password: password,
          passwordConfirm: confirmPassword,
          name: firstName,
          last_name: lastName,
          role: "user",
        };
        
        await pb.collection('users').create(data);
        // Store password temporarily for auto-login after verification
        localStorage.setItem('tempPassword', password);
        // Send verification email
        await pb.collection('users').requestVerification(email);
        setVerificationSent(true);
        setError('');
      }
    } catch (err) {
      setError(err.message);
    }
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
                  {isLogin ? 'welcome back to bee blog ✨' : 'make an account for bee blog ✨'}
                </h1>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl">
                  {isLogin ? 'please sign in to your account to leave comments and so much more 🌈' : 'please make an account to be able to leave comments and so much more 🌈'}
                </p>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {verificationSent && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4">
                    <p>
                      A verification email has been sent to your email address. 
                      Please check your inbox and click the verification link to complete your registration.
                    </p>
                  </div>
                )}
                <form className="mt-8" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <>
                      <LabelInputContainer className="mb-4">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          placeholder="unique_username" 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </LabelInputContainer>
                      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                        <LabelInputContainer>
                          <Label htmlFor="firstname">First name</Label>
                          <Input 
                            id="firstname" 
                            placeholder="Joshua" 
                            type="text" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </LabelInputContainer>
                        <LabelInputContainer>
                          <Label htmlFor="lastname">Last name</Label>
                          <Input 
                            id="lastname" 
                            placeholder="Block" 
                            type="text" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </LabelInputContainer>
                      </div>
                    </>
                  )}
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      placeholder="example@example.com" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </LabelInputContainer>
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      placeholder="••••••••" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </LabelInputContainer>
                  {!isLogin && (
                    <LabelInputContainer className="mb-6">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        placeholder="••••••••" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </LabelInputContainer>
                  )}
                  <button
                    className="bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust block w-full rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#A09AFF_inset,0px_-1px_0px_0px_#FEC9A7_inset]"
                    type="submit">
                    {isLogin ? 'Sign in' : 'Sign up'} &rarr;
                    <BottomGradient />
                  </button>
                </form>
                <p className="mt-4 text-center">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-500 hover:underline"
                  >
                    {isLogin ? 'Create one now' : 'Sign in'}
                  </button>
                </p>
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

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

export default AuthPage;
