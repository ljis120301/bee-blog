"use client";
import React from 'react';
import Link from 'next/link';
import { HoneycombLoader } from '@/components/ui/bee-skeleton';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function Custom404() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="w-64 h-64 mx-auto mb-8">
          <HoneycombLoader />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          404 - Page Not Found
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
          Oops! The page you're looking for has buzzed away.
        </p>
        <Link href="/" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">
          Return to Hive
        </Link>
      </main>
      
      <Footer />
    </div>
  );
}
