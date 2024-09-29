import React from 'react';


const BlogPost = ({ title, description, id }) => {
  return (
    
    <div
      className={`
        bg-white rounded-xl shadow-lg p-5 w-72 flex flex-col h-100
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        transform-gpu
      `}
    >
      <h2 className="text-light-purple text-xl font-bold">{title}</h2>
      <p className="mt-2 p-2 flex-grow">{description}</p>
      <button className="
        px-8 py-2 border border-black bg-transparent text-black  dark:border-white relative group transition duration-200 rounded
      ">
      <div className="absolute -bottom-2 -right-2 bg-yellow-300 h-full w-full -z-10 group-hover:bottom-0 group-hover:right-0 transition-all duration-200 rounded" />
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