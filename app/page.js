import Head from "next/head";
import Header from "./components/Header";
import AboutSection from "./components/AboutSection";
import BlogPost from "./components/BlogPost";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Cute Website</title>
        <meta name="description" content="A cute website built with Next.js and TailwindCSS" />
        <link rel="icon" href="/bee-icon.ico" />
      </Head>
      <Header />
     
      <div className="flex justify-center items-center p-4">
        <h2 className="text-4xl text-center mb-5 relative inline-block text-light-purple after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-light-pink after:to-light-blue after:rounded-[2px] font-bold">
          posts:
        </h2>
      </div>
      <main>
        {/* Main grid for BlogPost cards with improved responsiveness */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto p-5">
          {/* Example BlogPost components */}
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="an introduction: 🌈"
            description="a short intro of what you'll expect to find here"
            id="/blogposts"
          />
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="💡 creating a colorful smart home experience with python and tinytuya 🐍🖥️"
            description="Explore how to control your RGB lights using Python and TinyTuya with a fun GUI!"
            id="blogposts/2"
          />
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="why AI is amazing (totally not written by an AI) 🤖"
            description="Artificial intelligence (AI) is rapidly changing the world as we know it. From self-driving cars to facial recognition software, AI is already having a major impact on our lives. And it's only going to become more prevalent in the years to come."
            id="blogposts/3"
          />
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="how this website was made: ✨"
            description="learn how this website was made...."
            id="blogposts/4"
          />
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="this is a sample blog post for testing... 📝"
            description="this is a sample decription of text"
            id="blogposts/sign-in"
          />
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="this is a sample blog post 📝"
            description="this is a sample decription of text"
            id="blogposts/file-upload"
          />
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="this is a cool secret blog post 📝"
            description="this is a sample decription of text"
            id="blogposts/"
          />
          <BlogPost
            className="bg-white rounded shadow p-4 overflow-hidden break-words"
            title="this is a sample blog post 📝"
            description="this is a sample decription of text"
            id="blogposts/8"
          />
          {/* Add more BlogPost components as needed */}
          
        </section>
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
