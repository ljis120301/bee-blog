'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import { pb } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

const NavbarSunnyDay = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUser(pb.authStore.model);

    pb.authStore.onChange((auth) => {
      setUser(auth?.model);
    });
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/');
  };

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
        <div className="flex items-center">
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-cat-frappe-base dark:text-cat-frappe-text">Welcome, {user.username}</span>
                {user.role === "admin" && (
                  <Link href="/blogposts/aurthor-portal">
                    <button className="px-4 py-2 bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg border-2 border-current dark:border-cat-frappe-yellow hover:scale-105 hover:rotate-1 active:scale-95 active:rotate-0">
                      Author Portal 🐝✍️
                    </button>
                  </Link>
                )}
                <NavButton onClick={handleLogout} text="Logout" bgColor="bg-yellow-2" textColor="text-cat-frappe-base" />
              </>
            ) : (
              <NavButton href="/auth" text="Sign In / Register" bgColor="bg-yellow-2" textColor="text-cat-frappe-base" />
            )}
          </div>
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2 p-2 text-cat-frappe-yellow dark:text-cat-frappe-text"
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <div className="flex flex-col space-y-2">
            {user ? (
              <>
                <span className="text-cat-frappe-base dark:text-cat-frappe-text">Welcome, {user.username}</span>
                {user.role === "admin" && (
                  <Link href="/blogposts/aurthor-portal">
                    <button className="px-4 py-2 bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg border-2 border-current dark:border-cat-frappe-yellow hover:scale-105 hover:rotate-1 active:scale-95 active:rotate-0 w-full">
                      Author Portal 🐝✍️
                    </button>
                  </Link>
                )}
                <NavButton onClick={handleLogout} text="Logout" bgColor="bg-yellow-2" textColor="text-cat-frappe-base" />
              </>
            ) : (
              <NavButton href="/auth" text="Sign In / Register" bgColor="bg-yellow-2" textColor="text-cat-frappe-base" />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const NavButton = ({ href, text, bgColor = "bg-yellow-2", textColor = "text-cat-frappe-base", onClick }) => {
  const buttonContent = (
    <button className={`
      px-5 py-2 
      ${bgColor} ${textColor} 
      dark:bg-cat-frappe-surface1 dark:text-cat-frappe-yellow
      rounded-full font-bold 
      transition-all duration-300 
      shadow-md hover:shadow-lg 
      border-2 border-current dark:border-cat-frappe-yellow
      hover:bg-gradient-to-br hover:from-cat-frappe-peach hover:to-cat-frappe-yellow
      hover:text-cat-frappe-base dark:hover:text-cat-frappe-crust
      hover:scale-105 hover:rotate-1
      active:scale-95 active:rotate-0
      w-full md:w-auto
    `} onClick={onClick}>
      <span className="relative">
        {text}
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-current transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
      </span>
    </button>
  );

  return href ? <Link href={href}>{buttonContent}</Link> : buttonContent;
};

export default NavbarSunnyDay;
