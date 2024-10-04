import React from 'react';

const BlogPost = ({ title, description, id }) => {
  return (
    <div
      className={`
        bg-[#f2f2f7] dark:bg-[#414559] rounded-xl shadow-lg p-5 w-72 flex flex-col h-100
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        transform-gpu
      `}
    >
      <h2 className="text-[#4c4f69] dark:text-[#e5c890] text-xl font-bold">{title}</h2>
      <p className="mt-2 p-2 flex-grow text-[#6c6f85] dark:text-[#c6d0f5]">{description}</p>
      <button className="px-5 py-2 bg-gradient-to-r from-[#dce0e8] to-[#bcc2cf] dark:from-[#51576d] dark:to-[#626880] text-[#4c4f69] dark:text-[#e5c890] rounded-full font-bold hover:from-[#e5e9f0] hover:to-[#ced3dc] dark:hover:from-[#737994] dark:hover:to-[#838ba7] transition-all duration-300 shadow-md hover:shadow-lg border-2 border-[#e5c890] dark:border-[#e5c890]">
        <span className="relative">
          <a href={id} className="p-4">
            Read More
          </a>
        </span>
      </button>
    </div>
  );
};

export default BlogPost;
