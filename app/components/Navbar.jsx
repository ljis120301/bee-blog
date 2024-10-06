'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

const NavbarSunnyDay = () => {
  return (
    <nav className="bg-yellow-1 dark:bg-cat-frappe-base text-cat-frappe-yellow dark:text-cat-frappe-text p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/bee.png" alt="Logo" width={40} height={40} className="mr-2" />
          <span className="text-2xl font-bold tracking-wide">
            <span className="text-cat-frappe-peach dark:text-cat-frappe-peach">bee</span>
            <span className="text-cat-frappe-yellow dark:text-cat-frappe-yellow">blog</span>
          </span>
        </Link>
        <div className="flex space-x-4 items-center">
          <ThemeToggle />
          <NavButton href="/blogposts/register" text="Register" bgColor="bg-yellow-2" textColor="text-cat-frappe-base" />
          <NavButton href="/blogposts/sign-in" text="Sign In" bgColor="bg-yellow-2" textColor="text-cat-frappe-base" />
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ href, text, bgColor = "bg-bg-custom-light", textColor = "text-cat-frappe-text" }) => (
  <Link href={href}>
    <button className={`px-5 py-2 ${bgColor} hover:bg-opacity-80 dark:bg-cat-frappe-surface1 ${textColor} dark:text-[#e5c890] rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg border-2 border-current dark:border-[#e5c890]`}>
      <span className="relative">{text}</span>
    </button>
  </Link>
);

export default NavbarSunnyDay;