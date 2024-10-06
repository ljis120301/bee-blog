import React from 'react';
import Navbar from './Navbar';
import ScrollProgressBar from './ScrollProgressBar';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <Navbar />
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-full">
        <ScrollProgressBar />
      </div>
    </header>
  );
};

export default Header;
