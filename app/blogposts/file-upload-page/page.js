"use client";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CodeSnippet from "../../components/CodeSnippet";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

export default function Blog() {
    const [files, setFiles] = useState([]);
    const handleFileUpload = (files) => {
      setFiles(files);
      console.log(files);
    }

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>File Upload Page</title>
        <meta
          name="description"
          content="Upload and manage your files on this cute website built with Next.js and TailwindCSS"
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
                  file uploads: 🌈
                </h1>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl">
                  Upload and manage your files here.
                </p>
                <article className="mt-8 text-left">
                  <div className="text-cat-frappe-base dark:text-cat-frappe-yellow text-3xl font-bold">
                    here's a cute code snippet:
                  </div>
                  <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                    This is for me to talk about the code I wrote
                  </p>
                  <CodeSnippet
                    title={""}
                    code={`def cute_function():
                       print("Hello, cute world!") 
                       return "🌈🦄✨"`}
                  />
                  <div className="mt-8">
                    <h2 className="text-cat-frappe-base dark:text-cat-frappe-yellow text-2xl font-bold mb-4">
                      Upload Your Files
                    </h2>
                    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <FileUpload onChange={handleFileUpload} />
                    </div>
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
    </div>
  );
}

