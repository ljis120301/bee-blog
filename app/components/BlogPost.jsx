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
      <button className="px-5 py-2 bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 rounded-full font-bold hover:from-amber-200 hover:to-yellow-300 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-amber-300">        <span className="relative">
        <a href={id} className="p-4">
          Read More
        </a>
        </span>
      </button>
    </div>
  );
};

export default BlogPost;