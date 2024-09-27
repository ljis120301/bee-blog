const BlogPost = ({ title, description, id }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-5 w-72 flex flex-col h-100`}
    >
      <h2 className="text-light-purple text-xl font-bold">{title}</h2>
      <p className="mt-2 p-2 flex-grow">{description}</p>
      <button className="bg-light-yellow rounded-md mt-3 py-2 px-4 transition-colors duration-300 hover:bg-light-peach self-start">
        <a href={id} className="p-4">
          Read More
        </a>
      </button>
    </div>
  );
};

export default BlogPost;
