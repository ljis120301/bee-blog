import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CodeSnippet from "../components/CodeSnippet";
import Information from "../components/Information";
import MoreInformation from "../components/MoreInformation";
import ScrollProgressBar from "../components/ScrollProgressBar";

export default function Blog() {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Cute Website</title>
        <meta
          name="description"
          content="A cute website built with Next.js and TailwindCSS"
        />
      </Head>
      <ScrollProgressBar />
      <Header />
      <main className="flex-grow pt-16 text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
          <aside className="lg:col-span-1">
            <Information />
          </aside>
          <div className="lg:col-span-2">
            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
              <div className="text-center rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                  an introduction: 🌈
                </h1>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl">
                  Hello! Welcome to my blog website! I will be using this site to keep
                  the world updated on what projects I am working on.
                </p>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                  I intend to use this site to also inform the world of any changes I
                  made in software to get it working or other tips and tricks
                </p>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                  That is why I implemented a cool way of displaying code on my
                  website!
                </p>
                <article className="mt-8 text-left">
                  <div className="text-cat-frappe-base dark:text-cat-frappe-yellow text-3xl font-bold">
                    here's a cute code snippet:
                  </div>
                  <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                    This is for me to talk about the code I wrote
                  </p>
                  <CodeSnippet
                    title={"a title for the code snippet"}
                    code={`def cute_function():
                       print("Hello, cute world!") 
                       return "🌈🦄✨"`}
                  />
                </article>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-1">
            <MoreInformation />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}