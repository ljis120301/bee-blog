import React from 'react';
import styles from '../../app/styles/BeeSwarm.module.css';

// Helper function to generate a random pastel color
const getRandomPastelColor = (isDark) => {
  const hue = Math.floor(Math.random() * 360);
  const lightness = isDark ? "80%" : "60%";
  return `hsl(${hue}, 70%, ${lightness})`;
};

// Reusable component for conditional styling
const ThemedDiv = ({ children, lightClass, darkClass }) => (
  <div className={`${lightClass} dark:${darkClass}`}>
    {children}
  </div>
);

// 1. Honeycomb Loader
const HoneycombLoader = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-16 h-16 text-[#DF8E1D] dark:text-[#E5C890] animate-pulse" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,19.2L9.2,17.8L12,16.4L14.8,17.8L12,19.2M6.6,16.8L3.8,15.4L6.6,14L9.4,15.4L6.6,16.8M17.4,16.8L14.6,15.4L17.4,14L20.2,15.4L17.4,16.8M12,13.6L9.2,12.2L12,10.8L14.8,12.2L12,13.6M6.6,11.2L3.8,9.8L6.6,8.4L9.4,9.8L6.6,11.2M17.4,11.2L14.6,9.8L17.4,8.4L20.2,9.8L17.4,11.2M12,8L9.2,6.6L12,5.2L14.8,6.6L12,8M6.6,5.6L3.8,4.2L6.6,2.8L9.4,4.2L6.6,5.6M17.4,5.6L14.6,4.2L17.4,2.8L20.2,4.2L17.4,5.6Z" />
        </svg>
      </div>
    }
  />
);

// 2. Bee Flight Path
const BeeFlightPath = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute inset-0">
        <div className="w-4 h-4 bg-[#DF8E1D] dark:bg-[#E5C890] rounded-full absolute animate-[beeFlightPath_5s_ease-in-out_infinite]"></div>
      </div>
    }
  />
);

// 3. Pulsing Flower
const PulsingFlower = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-[#DC8A78] dark:bg-[#F2D5CF] rounded-full animate-[pulseFlower_2s_ease-in-out_infinite]"></div>
      </div>
    }
  />
);

// 4. Buzzing Bee
const BuzzingBee = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-8 bg-[#DF8E1D] dark:bg-[#E5C890] rounded-full relative animate-[buzzingBee_0.5s_ease-in-out_infinite]">
          <div className="absolute top-1 left-1 w-6 h-6 bg-[#EFF1F5] dark:bg-[#292C3C] rounded-full"></div>
          <div className="absolute top-1 right-1 w-6 h-6 bg-[#EFF1F5] dark:bg-[#292C3C] rounded-full"></div>
        </div>
      </div>
    }
  />
);

// 5. Growing Flower
const GrowingFlower = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-16 bg-[#40A02B] dark:bg-[#A6D189] animate-[growFlower_2s_ease-in-out_infinite]"></div>
        <div className="absolute top-4 w-8 h-8 bg-[#DC8A78] dark:bg-[#F2D5CF] rounded-full animate-[bloomFlower_2s_ease-in-out_infinite]"></div>
      </div>
    }
  />
);

// 6. Honeycomb Grid
const HoneycombGrid = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-[#DF8E1D] dark:bg-[#E5C890] rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
        ))}
      </div>
    }
  />
);

// 7. Bee Swarm
const BeeSwarm = ({ className }) => {
  const isWide = className && className.includes('md:col-span-2');

  return (
    <div className={`relative ${className} bg-[#EFF1F5] dark:bg-[#292C3C]`}>
      {[...Array(isWide ? 8 : 5)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-beeSwarm"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * (isWide ? 90 : 80) + 5}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${5 + Math.random() * 2}s`,
          }}
        >
          {/* Bee body */}
          <div className="relative w-8 h-6 bg-[#DF8E1D] dark:bg-[#E5C890] rounded-full">
            {/* Bee stripes */}
            <div className="absolute top-1 left-1 right-1 h-1 bg-black opacity-20 rounded-full"></div>
            <div className="absolute bottom-1 left-1 right-1 h-1 bg-black opacity-20 rounded-full"></div>
            
            {/* Bee wings */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#D0D0D0] dark:bg-gray-200 rounded-full opacity-80 animate-flapWings"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#D0D0D0] dark:bg-gray-200 rounded-full opacity-80 animate-flapWings animation-delay-100"></div>
            
            {/* Bee antenna */}
            <div className="absolute -top-2 left-2 w-0.5 h-2 bg-black rounded-full transform -rotate-15"></div>
            <div className="absolute -top-2 right-2 w-0.5 h-2 bg-black rounded-full transform rotate-15"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 8. Blooming Garden
const BloomingGarden = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-8 h-8 rounded-full animate-[bloomGarden_3s_ease-in-out_infinite]" style={{
            backgroundColor: getRandomPastelColor(false),
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            animationDelay: `${i * 0.5}s`
          }}></div>
        ))}
      </>
    }
  />
);

// 9. Honey Drip
const HoneyDrip = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 bg-[#DF8E1D] dark:bg-[#E5C890]">
        <div className="w-full h-8 rounded-b-full animate-[honeyDrip_2s_ease-in-out_infinite]"></div>
      </div>
    }
  />
);

// 10. Pollination Process
const PollinationProcess = () => (
  <ThemedDiv
    lightClass="bg-[#EFF1F5]"
    darkClass="bg-[#292C3C]"
    children={
      <div className="absolute inset-0 flex items-center justify-around">
        <div className="w-8 h-8 bg-[#DC8A78] dark:bg-[#F2D5CF] rounded-full"></div>
        <div className="w-4 h-4 bg-[#DF8E1D] dark:bg-[#E5C890] rounded-full animate-[pollination_3s_ease-in-out_infinite]"></div>
        <div className="w-8 h-8 bg-[#DC8A78] dark:bg-[#F2D5CF] rounded-full"></div>
      </div>
    }
  />
);

export {
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
};
