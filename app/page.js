"use client";
// Import the required libraries and components
import React from "react";
import Head from "next/head";
import Header from "./components/Header";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import {
  HoneycombLoader,
  BeeFlightPath,
  PulsingFlower,
  BuzzingBee,
  GrowingFlower,
  HoneycombGrid,
  BeeSwarm,
  BloomingGarden,
  HoneyDrip,
  PollinationProcess
} from "@/components/ui/bee-skeleton";
import InformationComponent from "@/app/components/Information";
import MoreInformationComponent from "@/app/components/MoreInformation";


// Define the animated skeleton component

//google gemini bee
const AnimatedSkeleton = () => (
  <div className="relative flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-xl overflow-hidden border border-transparent dark:border-white/[0.2]">
    {/* Skeleton shape */}
    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-violet-500/10 animate-skeleton rounded-xl"></div>
    {/* Pulsing dot */}
    <div className="absolute w-4 h-4 bg-pink-400 rounded-full opacity-75 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
  </div>
);

// Define the bee skeleton component with honeycomb animation
const BeeSkeleton = () => (
  <div className="relative flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-xl overflow-hidden border border-transparent dark:border-white/[0.2]">
    {/* Beehive shape */}
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-skeleton rounded-xl">
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5.1l2.879 4.707L17 9.8l-4.121 6.891a1 1 0 0 1-1.758-1.19l2.184-3.571L9.121 9.8l-4.121-6.891a1 1 0 0 1 1.758-1.19zM12 18.9a6.8 6.8 0 1 0 0-13.6 6.8 6.8 0 0 0 0 13.6z" fill="currentColor" />
      </svg>
    </div>
    {/* Honeycomb pattern with animation */}
    <div className="absolute inset-0 animate-honeycomb bg-gradient-to-r from-gray-100/20 to-transparent">
      <svg className="w-full h-full" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0L0 6L6 12L12 6L6 0Z" fill="currentColor" opacity="0.2" />
        <path d="M3 3L9 3L9 9L3 9L3 3Z" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  </div>
);

const swarmStyles = (
  <style jsx>{`
    @keyframes beeSwarm0 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -20px); } }
    @keyframes beeSwarm1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-25px, 15px); } }
    @keyframes beeSwarm2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(15px, 25px); } }
    @keyframes beeSwarm3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-20px, -30px); } }
    @keyframes beeSwarm4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(25px, 20px); } }
  `}</style>
);

const AdditionalStyles = () => (
  <style jsx global>{`
    @keyframes flapWings {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.8); }
    }
    @keyframes beeSwarm {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(20px, 20px) rotate(5deg); }
      50% { transform: translate(-20px, 10px) rotate(-5deg); }
      75% { transform: translate(10px, -20px) rotate(3deg); }
    }
    .animate-beeSwarm {
      animation: beeSwarm 5s ease-in-out infinite;
    }
    .animate-flapWings {
      animation: flapWings 0.2s ease-in-out infinite alternate;
    }
    .animation-delay-100 {
      animation-delay: 0.1s;
    }
  `}</style>
);

const styles = {
  // Custom animation classes
  "@keyframes skeletonAnimation": `
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
 `,
  "@keyframes honeycombAnimation": `
    0% { transform: scale(1); opacity: 0.2; }
    25% { transform: scale(1.1); opacity: 0.4; }
    50% { transform: scale(1); opacity: 0.6; }
    75% { transform: scale(1.1); opacity: 0.4; }
    100% { transform: scale(1); opacity: 0.2; }
  `,
};

const CustomStyles = () => (
  <style jsx>{`
    @keyframes beeFlightPath {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(100%, 100%); }
      50% { transform: translate(200%, 0); }
      75% { transform: translate(100%, -100%); }
    }
    @keyframes pulseFlower {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }
    @keyframes buzzingBee {
      0%, 100% { transform: translateX(0); }
      25%, 75% { transform: translateX(-2px); }
      50% { transform: translateX(2px); }
    }
    @keyframes growFlower {
      0% { height: 0; }
      100% { height: 4rem; }
    }
    @keyframes bloomFlower {
      0%, 100% { transform: scale(0); }
      50% { transform: scale(1); }
    }
    @keyframes beeSwarm {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(50%, 50%); }
      50% { transform: translate(100%, 0); }
      75% { transform: translate(50%, -50%); }
    }
    @keyframes bloomGarden {
      0%, 100% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1); opacity: 1; }
    }
    @keyframes honeyDrip {
      0%, 100% { height: 2rem; }
      50% { height: 4rem; }
    }
    @keyframes pollination {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(200%, 0); }
    }
  `}</style>
);

// Blog posts array with animated skeletons
const blogPosts = [
  {
    title: "an introduction: 🌈",
    description: "a short intro of what you'll expect to find here",
    id: "/blogposts",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    header: <BeeSwarm />,
    className: "md:col-span-2",
    
  },
  {
    title: "💡 creating a colorful smart home experience with python and tinytuya 🐍🖥️",
    description: "Explore how to control your RGB lights using Python and TinyTuya with a fun GUI!",
    id: "blogposts/2",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    header: <BeeFlightPath />,
  },
  {
    title: "why AI is amazing (totally not written by an AI) 🤖",
    description: "Artificial intelligence (AI) is rapidly changing the world as we know it.",
    id: "blogposts/3",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    header: <PulsingFlower />
  },
  {
    title: "how this website was made: ✨",
    description: "Learn how this website was made....",
    id: "blogposts/4",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    header: <BeeSwarm className="md:col-span-2" />,
    className: "md:col-span-2"
  },
  {
    title: "file uploads page 📁",
    description: "Upload and manage your files here.",
    id: "blogposts/file-upload-page",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    header: <GrowingFlower />
  },
  {
    title: "file uploads page 📁",
    description: "Upload and manage your files here.",
    id: "blogposts/file-upload-page",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    header: <HoneycombGrid />
  },
  {
    title: "Template Post 🍯",
    description: "Template Post",
    id: "blogposts/template-post",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    header: <BeeSwarm />,
  },
  {
    title: "BloomingGarden 101 🐝🧑‍🌾",
    description: "A beginner's guide to starting your own beehive.",
    id: "blogposts/beekeeping-basics",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    header: <BloomingGarden />,
  },
  {
    title: "HoneyDrip 101 🐝🧑‍🌾",
    description: "A beginner's guide to starting your own beehive.",
    id: "blogposts/beekeeping-basics",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    header: <HoneyDrip />,
  },
  {
    title: "The Dance of the Bees 💃🐝",
    description: "PollinationProcess Uncover the fascinating way bees communicate through dance.",
    id: "blogposts/bee-dance",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    header: <PollinationProcess />,
  },

  
];

export default function Home() {
  return (
    <>
      {/* Add custom styles */}
      <CustomStyles />

      <Head>
        <title>Cute Website</title>
        <meta name="description" content="A cute website built with Next.js and TailwindCSS" />
        <link rel="icon" href="/bee-icon.ico" />
      </Head>
      <Header />

      <div className="flex justify-center items-center p-4">
        <h2 className="text-3xl sm:text-4xl text-center mb-5 relative inline-block text-[#e5c890] after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-[#ef9f76] after:to-[#e5c890] after:rounded-[2px] font-bold">
          posts:
        </h2>
      </div>

      <main className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <section className="my-10">
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="xl:w-1/5">
              <InformationComponent />
            </div>
            <div className="xl:w-3/5">
              <BentoGrid className="xl:auto-rows-[20rem] gap-4">
                {blogPosts.map((post, i) => (
                  <BentoGridItem
                    key={i}
                    title={post.title}
                    description={post.description}
                    header={post.header}
                    className={post.className}
                    icon={post.icon}
                    href={post.id}
                  />
                ))}
              </BentoGrid>
            </div>
            <div className="xl:w-1/5">
              <MoreInformationComponent />
            </div>
          </div>
        </section>
        <AboutSection />
      </main>
      <Footer />
      <AdditionalStyles />
    </>
  );
}