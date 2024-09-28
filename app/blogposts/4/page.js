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
            <h1 className="text-light-purple text-3xl font-bold text-pretty"> learn how this website was made... ✨</h1>
            <div className="break-words">
            

Hello, I am a young web developer from Arizona. I love learning new technologies and striving to be the best I can be in the world of IT. I have been creating simple HTML and CSS sites since I was 10 years old. More recently, I have turned to the exciting world of JavaScript. JavaScript enables me to implement the fun animations you see on the site and allows for many of the modern web elements we see in websites today.

Furthermore, libraries such as React and Node.js allow developers to create beautiful websites. I decided to take a different approach when it came to designing this website in particular. This website has been 100% AI-generated. Everything from the HTML, CSS, and JavaScript has been entirely written by an AI. With AI becoming smarter every day, I thought it would be a cool experiment to test and see the capabilities it has for web development.

To start out, I asked ChatGPT, “I am familiar with writing websites in HTML and CSS, but want to start learning JavaScript. My friend took a class on React and Node.js, and I'm interested in learning the basics of JavaScript to become more familiar with big concepts like React and Node.js. I have a small blog site and just want to make it cuter and prettier.” What it gave me was quite surprising:

                    
            </div>
            </div>
      </main>
      <Footer />
    </>
  );
}

