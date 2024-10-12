import React from 'react';
import Navbar from './Navbar';
import ScrollProgressBar from './ScrollProgressBar';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-yellow-1 dark:bg-gradient-to-r dark:from-cat-frappe-mantle dark:to-cat-frappe-crust shadow-md">
        <Navbar />
      </div>
      <ScrollProgressBar />
    </header>
  );
};

export default Header;
