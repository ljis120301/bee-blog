"use client";

import React, { useState } from "react";
import { Menu, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";

const Header = ({ id }) => {
  const [active, setActive] = useState(null);

  return (
    <header className="bg-gradient-to-r from-light-purple via-light-blue to-light-green py-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <a href="/" className="mr-4">
              <img
                src="/bee.png"
                alt="Logo"
                width={100}
                height={100}
                className="transition-transform duration-300 hover:scale-110"
              />
            </a>
          </div>
          
7
          <div className="flex space-x-4">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 shadow-md">
              <a href="/blogposts/register">
                📝 register 📝 
              </a>
            </button>
            <button className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 shadow-md">
              <a href="/blogposts/sign-in" className="">
                ✨ sign in ✨
              </a>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;