import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CodeSnippet from "../../components/CodeSnippet";


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
          <div className="flex flex-wrap justify-center gap-4 p-5 mx-auto ">
            <h1 className="text-light-purple text-3xl font-bold text-pretty"> why AI is amazing (totally not written by an AI) 🤖</h1>
            <div className="break-words">Artificial intelligence (AI) is rapidly changing the world as we know it. From self-driving cars to facial recognition software, AI is already having a major impact on our lives. And it's only going to become more prevalent in the years to come.
                    I can put stuff here
                    
            </div>
            </div>
      </main>
      <Footer />
    </>
  );
}

