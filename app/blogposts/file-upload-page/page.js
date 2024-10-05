"use client";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CodeSnippet from "../../components/CodeSnippet";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";



export default function Blog() {
    const [files, setFiles] = useState([]);
    const handleFileUpload = (files) => {
      setFiles(files);
      console.log(files);
    }

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
        <div className="mt-10 text-center border-4 border-light-green dark:border-cat-frappe-lavender rounded-lg p-6 m-4 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
          <h1 className="text-light-purple dark:text-cat-frappe-lavender text-3xl font-bold text-pretty">
            file uploads: 🌈
          </h1>
          <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-4">
            first sentence
          </p>
          <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-left">
            <div className="text-light-purple dark:text-cat-frappe-lavender text-left text-3xl font-bold">
              here's a cute code snippet:
            </div>
            <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2">This is for me to talk about the code I wrote</p>
            <CodeSnippet
              title={""}
              code={`def cute_function():
                 print("Hello, cute world!") 
                 return "🌈🦄✨"`}
            />
            <div
            className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

