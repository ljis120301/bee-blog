'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="bg-cat-frappe-rosewater dark:bg-[#292c3c] text-[#e5c890] p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/bee.png"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-2xl font-bold tracking-wide">
            <span className="text-[#ef9f76]">bee</span>
            <span className="text-[#e5c890]">blog</span>
          </span>
        </Link>
        <div className="flex space-x-4 items-center">
          <ThemeToggle />
          <Link href="/blogposts/register">
            <button className="px-5 py-2 bg-gradient-to-r from-[#51576d] to-[#626880] text-[#e5c890] rounded-full font-bold hover:from-[#737994] hover:to-[#838ba7] transition-all duration-300 shadow-md hover:shadow-lg border-2 border-[#e5c890]">
              <span className="relative">
                Register
              </span>
            </button>
          </Link>
          <Link href="/blogposts/sign-in">
            <button className="px-5 py-2 bg-gradient-to-r from-[#51576d] to-[#626880] text-[#e5c890] rounded-full font-bold hover:from-[#737994] hover:to-[#838ba7] transition-all duration-300 shadow-md hover:shadow-lg border-2 border-[#e5c890]">
              <span className="relative">
                Sign In
              </span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;