import dynamic from 'next/dynamic';
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";

const CodeSnippet = dynamic(() => import('../../components/CodeSnippet'), { ssr: false });

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
      <ScrollProgressBar />
      <Header />
      <main className="pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
          <aside className="lg:col-span-1">
            <Information />
          </aside>
          <div className="lg:col-span-2">
            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
              <div className="text-center rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                  template: 🌈
                </h1>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl">
                  first sentence
                </p>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                  second sentence
                </p>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                  third sentence
                </p>
                <article className="mt-8 text-left">
                  <div className="text-cat-frappe-base dark:text-cat-frappe-yellow text-3xl font-bold mb-4">
                    here's a cute code snippet:
                  </div>
                  <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mb-4 text-xl">
                    This is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                  </p>
                  <div className="syntax-highlighter">
                    <CodeSnippet
                      code={`def cute_function():
    print("Hello, cute world!")
    return "🌈🦄✨"

# This is a comment
for i in range(5):
    print(f"Cuteness level: {i+1}")

class CuteClass:
    def __init__(self, name):
        self.name = name

    def be_cute(self):
        return f"{self.name} is being cute!"`}
                    />
                  </div>
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
    </>
  );
}