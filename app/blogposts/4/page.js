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
          <div className="flex flex-wrap justify-center gap-4 p-5 mx-auto">
            <h1 className="text-light-purple text-3xl font-bold"> TEst h1 tag  </h1>
            <p>Artificial intelligence (AI) is rapidly changing the world as we know it. From self-driving cars to facial recognition software, AI is already having a major impact on our lives. And it's only going to become more prevalent in the years to come.
            </p>
            
            </div>
      </main>
      <Footer />
    </>
  );
}

