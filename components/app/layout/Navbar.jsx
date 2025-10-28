'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/app/shared/ThemeToggle';
import { ButtonNeobrutalist } from '@/components/ui/button-neobrutalist';
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
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/bee.png" alt="Logo" width={50} height={50} className="mr-3" />
          <span className="text-3xl font-bold tracking-wide">
            <span className="text-cat-frappe-peach dark:text-cat-frappe-peach">bee</span>
            <span className="text-cat-frappe-yellow dark:text-cat-frappe-yellow">blog</span>
          </span>
        </Link>
        <div className="flex items-center">
          <div className="hidden md:flex md:items-center md:space-x-3">
            <ThemeToggle />
            {user ? (
              <>
                {user.role === "admin" && (
                  <>
                    <Link href="/admin">
                      <ButtonNeobrutalist variant="blue" size="default">
                        Admin Dashboard 🐝📊
                      </ButtonNeobrutalist>
                    </Link>
                    <Link href="/blogposts/aurthor-portal">
                      <ButtonNeobrutalist variant="peach" size="default">
                        Author Portal 🐝✍️
                      </ButtonNeobrutalist>
                    </Link>
                  </>
                )}
                {user.role === "author" && (
                  <Link href="/blogposts/aurthor-portal">
                    <ButtonNeobrutalist variant="peach" size="default">
                      Author Portal 🐝✍️
                    </ButtonNeobrutalist>
                  </Link>
                )}
                <ButtonNeobrutalist onClick={handleLogout} variant="outline" size="default">
                  Logout
                </ButtonNeobrutalist>
                <Link href="/user-profile">
                  <ButtonNeobrutalist variant="default" size="default">
                    ✨ {user.username}
                  </ButtonNeobrutalist>
                </Link>
              </>
            ) : (
              <Link href="/auth">
                <ButtonNeobrutalist variant="default" size="default">
                  Sign In / Register
                </ButtonNeobrutalist>
              </Link>
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
                <ButtonNeobrutalist variant="default" size="default" className="mb-2 w-full">
                  ✨ {user.username}
                </ButtonNeobrutalist>
                {user.role === "admin" && (
                  <>
                    <Link href="/admin">
                      <ButtonNeobrutalist variant="blue" size="default" className="mb-2 w-full">
                        Admin Dashboard 🐝📊
                      </ButtonNeobrutalist>
                    </Link>
                    <Link href="/blogposts/aurthor-portal">
                      <ButtonNeobrutalist variant="peach" size="default" className="mb-2 w-full">
                        Author Portal 🐝✍️
                      </ButtonNeobrutalist>
                    </Link>
                  </>
                )}
                {user.role === "author" && (
                  <Link href="/blogposts/aurthor-portal">
                    <ButtonNeobrutalist variant="peach" size="default" className="mb-2 w-full">
                      Author Portal 🐝✍️
                    </ButtonNeobrutalist>
                  </Link>
                )}
                <ButtonNeobrutalist onClick={handleLogout} variant="outline" size="default" className="w-full">
                  Logout
                </ButtonNeobrutalist>
              </>
            ) : (
              <Link href="/auth">
                <ButtonNeobrutalist variant="default" size="default" className="w-full">
                  Sign In / Register
                </ButtonNeobrutalist>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarSunnyDay;
