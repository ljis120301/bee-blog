import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

const BackgroundBeamsWithCollisionDemo = () => {
  return (
    <div className="mt-8 px-4 py-6 rounded-2xl overflow-hidden">
      <BackgroundBeamsWithCollision className="h-48 md:h-64 rounded-xl border-2 border-[#f9e2af] dark:border-[#e5c890]">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-gray-800 dark:text-gray-100 font-sans tracking-tight flex flex-col items-center">
          <span>✨ Your Favorite Posts 🌈</span>
          <div className="relative mx-auto inline-block w-max mt-4 md:mt-6">

          </div>
        </h2>
      </BackgroundBeamsWithCollision>
    </div>
  );
};

export default BackgroundBeamsWithCollisionDemo;
