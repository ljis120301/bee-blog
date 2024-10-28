'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VerifyPage = () => {
  const [status, setStatus] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setStatus('Invalid verification link.');
          return;
        }

        // Call PocketBase verification endpoint
        await pb.collection('users').confirmVerification(token);
        
        setIsSuccess(true);
        setStatus('Email verified successfully! Redirecting to login...');
        
        // Clear any stored temporary data
        localStorage.removeItem('tempPassword');
        
        // Use window.location for a full page redirect to the frontend domain
        setTimeout(() => {
          window.location.href = 'https://bee.whoisjason.me/auth';
        }, 2000);
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('Verification failed: ' + (err.message || 'Something went wrong while processing your request.'));
      }
    };

    verifyEmail();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-[calc(64px+8px)] min-h-screen">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
              <div className="rounded-lg p-8 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                <h1 className="text-2xl font-bold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">
                  Email Verification
                </h1>
                <p className={`text-[#4c4f69] dark:text-cat-frappe-subtext0 ${
                  isSuccess ? 'text-green-600 dark:text-green-400' : ''
                }`}>
                  {status}
                </p>
                {isSuccess && (
                  <button
                    onClick={() => window.location.href = 'https://bee.whoisjason.me/auth'}
                    className="mt-4 px-4 py-2 bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust rounded-md hover:opacity-90 transition-opacity"
                  >
                    Go to Login &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VerifyPage;
