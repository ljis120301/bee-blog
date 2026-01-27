'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Header from '@/components/app/layout/Header';
import Footer from '@/components/app/layout/Footer';
import Information from '@/components/app/cards/WelcomeSection';
import MoreInformation from '@/components/app/cards/MoreInformation';
import ScrollProgressBar from '@/components/app/blog/ScrollProgressBar';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from '@tabler/icons-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register, loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Redirect happens automatically via Better Auth
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login using Better Auth via Context
        const result = await login(email, password);

        if (result.success) {
          router.push('/');
        } else {
          setError(result.error || 'Login failed');
          setLoading(false);
        }
      } else {
        // Registration using Better Auth via Context
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError("Password must be at least 8 characters");
          setLoading(false);
          return;
        }

        const fullName = `${firstName} ${lastName}`.trim();

        const result = await register({
          email,
          username,
          password,
          name: fullName,
        });

        if (result.success) {
          setSuccess(result.message || 'Account created! checking your email to verify.');
          setIsLogin(true);
          // Clear form
          setUsername('');
          setFirstName('');
          setLastName('');
          setConfirmPassword('');
        } else {
          setError(result.error || 'Registration failed');
        }
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
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
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4">
                    <p>{success}</p>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="relative group/btn flex space-x-2 items-center justify-center -start-0 px-4 w-full text-black rounded-md h-10 font-medium shadow-[0px_0px_1px_1px_var(--neutral-800)] bg-white dark:bg-cat-frappe-surface0 dark:text-cat-frappe-text"
                    type="button"
                    disabled={loading}
                  >
                    <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-cat-frappe-text" />
                    <span className="text-neutral-700 dark:text-cat-frappe-text text-sm">
                      {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </span>
                    <BottomGradient />
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-cat-frappe-surface2"></div>
                    <span className="flex-shrink-0 mx-4 text-cat-frappe-subtext0 text-sm">Or continue with email</span>
                    <div className="flex-grow border-t border-cat-frappe-surface2"></div>
                  </div>
                </div>

                <form className="mt-4" onSubmit={handleSubmit}>
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
                          disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                        disabled={loading}
                      />
                    </LabelInputContainer>
                  )}
                  <button
                    className="bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust block w-full rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#A09AFF_inset,0px_-1px_0px_0px_#FEC9A7_inset] disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')} &rarr;
                    <BottomGradient />
                  </button>
                </form>
                <p className="mt-4 text-center">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-blue-500 hover:underline"
                    disabled={loading}
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
