import React from 'react';
import Navbar from './Navbar';
import ScrollProgressBar from './ScrollProgressBar';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-yellow-1 dark:bg-cat-frappe-base shadow-md">
      <div className="h-20"> {/* Fixed height for the Navbar */}
        <Navbar />
      </div>
      <ScrollProgressBar />
    </header>
  );
};

export default Header;
