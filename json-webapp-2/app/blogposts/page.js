import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CodeSnippet from "../components/CodeSnippet";

export default function Blog() {
  return (
    <>
      <Head>
        <title>Cute Website</title>
        <meta
          name="description"
          content="A cute website built with Next.js and TailwindCSS"
        />
      </Head>
      <Header />
      <main>
        <div className="mt-10 text-center">
          <h1 className="text-light-purple text-3xl font-bold">
            an introduction: 🌈
          </h1>
          <p>
            Hello! Welcome to my blog website! I will be using this site to keep
            the world updated on what projects I am working on.
          </p>
          <p>
            I intend to use this site to also inform the world of any chnages I
            made in software to get it working or other tips and tricks
          </p>
          <p>
            That is why I implimented a cool way of displaying code on my
            website!
          </p>

          <CodeSnippet
            title={"Here's a cute code snippet:"}
            code={`def cute_function():
               print("Hello, cute world!") 
               return "🌈🦄✨"`}
          ></CodeSnippet>
        </div>
      </main>
      <Footer />
    </>
  );
}
