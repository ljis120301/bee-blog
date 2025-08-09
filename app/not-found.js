'use client';

import React from 'react';
import Link from 'next/link';

/*
 * 10 BEAUTIFUL 404 PAGE DESIGNS
 * A random design is automatically selected each time a 404 page is requested:
 * 
 * 1 - "MINIMALIST_GRADIENT" - Clean geometric gradients with floating elements
 * 2 - "UNIX_TERMINAL" - Classic Unix terminal with command-line aesthetics
 * 3 - "KERNEL_SPACE" - Deep system kernel visualization with memory blocks
 * 4 - "FLOATING_ORBS" - Mystical floating orbs with particle effects
 * 5 - "PRISMATIC_CRYSTAL" - Crystalline geometric patterns with refractions
 * 6 - "FILE_EXPLORER" - Operating system file browser showing missing file
 * 7 - "VINTAGE_TYPEWRITER" - Old typewriter with missing page in manuscript
 * 8 - "TORN_PAPER" - Ripped paper with missing section revealing 404
 * 9 - "DIGITAL_GLITCH" - Glitch art with data corruption effects
 * 10 - "GLASS_PANES" - Realistic translucent glass panels with refractions
 */

export default function NotFound() {
  // Use useEffect to set random design only on client side to avoid hydration mismatch
  const [designVariant, setDesignVariant] = React.useState(1); // Default to design 1
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    // This runs only on client side after hydration
    setIsClient(true);
    setDesignVariant(Math.floor(Math.random() * 10) + 1);
  }, []);
  
  const designs = {
    1: <MinimalistGradient />,
    2: <UnixTerminal />,
    3: <KernelSpace />,
    4: <FloatingOrbs />,
    5: <PrismaticCrystal />,
    6: <FileExplorer />,
    7: <VintageTypewriter />,
    8: <TornPaper />,
    9: <DigitalGlitch />,
    10: <GlassPanes />
  };

  // Show design 1 during server-side rendering and initial load, then switch to random design
  return designs[designVariant] || designs[1];
}

// Design 1: Minimalist Gradient
function MinimalistGradient() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-base">
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-base via-cat-frappe-surface0 to-cat-frappe-surface1"></div>
      
      <div className="absolute top-20 left-1/4 w-32 h-32 transform rotate-45 bg-cat-frappe-mauve/20 rounded-lg animate-spin-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-cat-frappe-sapphire/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-28 h-28 transform rotate-12 bg-cat-frappe-lavender/25 rounded-lg animate-wiggle"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-[8rem] md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cat-frappe-text via-cat-frappe-lavender to-cat-frappe-sapphire leading-none">404</h1>
        <p className="text-xl text-cat-frappe-subtext1 mb-8">Page not found in the digital void</p>
        <Link href="/" className="px-8 py-4 bg-cat-frappe-surface0 hover:bg-cat-frappe-surface1 text-cat-frappe-text rounded-lg transition-all duration-300">Return Home</Link>
      </div>
    </div>
  );
}

// Design 2: Unix Terminal
function UnixTerminal() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-crust font-mono">
      <div className="absolute inset-0 bg-gradient-to-b from-cat-frappe-crust to-cat-frappe-base"></div>
      
      {/* Terminal window */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl bg-cat-frappe-surface0 rounded-lg border border-cat-frappe-surface2 shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-cat-frappe-surface1 rounded-t-lg border-b border-cat-frappe-surface2">
            <div className="w-3 h-3 bg-cat-frappe-red rounded-full"></div>
            <div className="w-3 h-3 bg-cat-frappe-yellow rounded-full"></div>
            <div className="w-3 h-3 bg-cat-frappe-green rounded-full"></div>
            <span className="ml-4 text-cat-frappe-subtext1 text-sm">bash - BeeBlog Development</span>
          </div>
          
          {/* Terminal content */}
          <div className="p-4 space-y-1 text-cat-frappe-text text-sm">
            <div className="text-cat-frappe-green">dev@beeblog:~/bee-blog$ <span className="text-cat-frappe-text">npm run build</span></div>
            <div className="text-cat-frappe-blue">✓ Compiled successfully</div>
            <div className="text-cat-frappe-green">dev@beeblog:~/bee-blog$ <span className="text-cat-frappe-text">npx next dev</span></div>
            <div className="text-cat-frappe-blue">▲ Next.js 14.0.0 - Local: http://localhost:3000</div>
            <div className="text-cat-frappe-green">dev@beeblog:~/bee-blog$ <span className="text-cat-frappe-text">curl localhost:3000/not-found</span></div>
            <div className="text-cat-frappe-red">HTTP/1.1 404 Not Found</div>
            <div className="text-[3rem] md:text-[4rem] font-bold text-cat-frappe-sapphire text-center py-2">404</div>
            <div className="text-cat-frappe-green">dev@beeblog:~/bee-blog$ <span className="text-cat-frappe-text">find app/ -name "requested-page*"</span></div>
            <div className="text-cat-frappe-red">find: 'requested-page*': No such file or directory</div>
            <div className="text-cat-frappe-green">dev@beeblog:~/bee-blog$ <span className="animate-pulse">_</span></div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-cat-frappe-subtext1 mb-4">Route not found in Next.js app</p>
          <Link href="/" className="px-6 py-3 bg-cat-frappe-surface0 border border-cat-frappe-surface2 text-cat-frappe-text hover:bg-cat-frappe-surface1 transition-all duration-300 font-mono">cd app/</Link>
        </div>
      </div>
    </div>
  );
}

// Design 3: Kernel Space
function KernelSpace() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-crust font-mono">
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-crust via-cat-frappe-base to-cat-frappe-surface0"></div>
      
      {/* Memory allocation blocks */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({length: 16}).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-cat-frappe-lavender"
            style={{
              left: `${5 + (i % 4) * 23}%`,
              top: `${20 + Math.floor(i / 4) * 15}%`,
              width: `${15 + (i % 3) * 5}px`,
              height: `${8 + (i % 2) * 4}px`,
              opacity: i === 7 ? 0.8 : 0.3
            }}
          />
        ))}
      </div>

      {/* Kernel logs */}
      <div className="absolute top-4 left-4 right-4 text-xs text-cat-frappe-overlay0 space-y-1 opacity-60">
        <div>[    0.000000] Linux version 5.15.0-404 (kernel@build) #404 SMP</div>
        <div>[    0.001245] Command line: BOOT_IMAGE=/vmlinuz-404 root=/dev/sda1</div>
        <div>[    0.002891] KERNEL supported cpus: Intel</div>
        <div>[    1.234567] <span className="text-cat-frappe-red">ERROR: Page fault at virtual address 0x404</span></div>
        <div>[    1.234890] <span className="text-cat-frappe-yellow">WARNING: Unable to locate requested resource</span></div>
        <div>[    1.235123] Stack trace: page_not_found+0x404/0x1000</div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="relative mb-8">
          <div className="text-cat-frappe-subtext1 text-sm mb-4">KERNEL PANIC - PAGE NOT FOUND</div>
          <h1 className="text-[8rem] md:text-[12rem] font-bold text-cat-frappe-red leading-none tracking-wider">404</h1>
          <div className="text-cat-frappe-subtext1 text-sm mt-4">Process ID: 404 | Exit Code: 127</div>
        </div>

        <div className="bg-cat-frappe-surface0 border border-cat-frappe-surface2 rounded p-4 mb-8 text-left text-sm max-w-2xl">
          <div className="text-cat-frappe-green mb-2">$ dmesg | tail -5</div>
          <div className="text-cat-frappe-subtext1">[ 404.000000] segfault at 404 ip 0000404000404000</div>
          <div className="text-cat-frappe-subtext1">[ 404.000001] Code: Bad RIP value.</div>
          <div className="text-cat-frappe-red">[ 404.000002] FATAL: Page requested does not exist in memory</div>
          <div className="text-cat-frappe-yellow">[ 404.000003] Attempting graceful recovery...</div>
          <div className="text-cat-frappe-green">[ 404.000004] Recovery successful. Redirecting to /</div>
        </div>

        <Link href="/" className="px-8 py-4 bg-cat-frappe-surface0 border border-cat-frappe-surface2 text-cat-frappe-text hover:bg-cat-frappe-surface1 transition-all duration-300 font-mono">reboot --recovery</Link>
      </div>
    </div>
  );
}

// Design 4: Floating Orbs (Enhanced with physics-based animations from high-quality repos)
function FloatingOrbs() {
  // Enhanced floating animation system inspired by particle physics simulations
  const generateOrbPath = (index) => {
    const baseDelay = index * 0.3;
    const amplitude = 20 + (index % 3) * 15;
    const frequency = 0.8 + (index % 2) * 0.4;
    return {
      animationDelay: `${baseDelay}s`,
      animationDuration: `${8 + index % 4}s`,
      transform: `translateY(${Math.sin(index) * amplitude}px) translateX(${Math.cos(index) * amplitude}px)`
    };
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cat-frappe-base via-cat-frappe-surface0 to-cat-frappe-crust">
      {/* Advanced particle field background */}
      <div className="absolute inset-0">
        {Array.from({length: 30}).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full opacity-60"
            style={{
              left: `${10 + (i * 73) % 80}%`,
              top: `${15 + (i * 47) % 70}%`,
              width: `${2 + i % 4}px`,
              height: `${2 + i % 4}px`,
              background: `hsl(${240 + (i * 15) % 60}, 70%, ${60 + i % 20}%)`,
              animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* Primary constellation orbs with advanced physics */}
      <div className="absolute inset-0">
        {/* Gravitational center orb */}
        <div className="absolute top-1/4 left-1/5 w-40 h-40" style={generateOrbPath(0)}>
          <div className="relative w-full h-full">
            {/* Multi-layer glow effect */}
            <div className="absolute inset-0 bg-gradient-radial from-cat-frappe-lavender/80 via-cat-frappe-lavender/40 to-transparent rounded-full animate-pulse opacity-90"></div>
            <div className="absolute inset-2 bg-gradient-radial from-cat-frappe-mauve/90 via-cat-frappe-lavender/50 to-cat-frappe-lavender/10 rounded-full" style={{animation: 'rotate 12s linear infinite'}}></div>
            <div className="absolute inset-6 bg-gradient-radial from-cat-frappe-lavender to-cat-frappe-mauve rounded-full" style={{animation: 'pulse 3s ease-in-out infinite'}}></div>
            <div className="absolute inset-12 bg-cat-frappe-text/20 rounded-full backdrop-blur-sm"></div>
            {/* Core energy */}
            <div className="absolute inset-16 bg-gradient-radial from-white/80 to-cat-frappe-lavender rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Orbital bodies with elliptical paths */}
        {[
          { size: 'w-24 h-24', color: 'sapphire', position: 'top-1/3 right-1/4' },
          { size: 'w-28 h-28', color: 'pink', position: 'bottom-1/3 left-1/3' },
          { size: 'w-20 h-20', color: 'yellow', position: 'top-2/3 left-1/6' },
          { size: 'w-16 h-16', color: 'green', position: 'top-1/6 right-1/3' },
          { size: 'w-18 h-18', color: 'teal', position: 'bottom-1/4 right-1/5' }
        ].map((orb, index) => (
          <div key={index} className={`absolute ${orb.position} ${orb.size}`} style={generateOrbPath(index + 1)}>
            <div className="relative w-full h-full">
              <div className={`absolute inset-0 bg-gradient-radial from-cat-frappe-${orb.color}/70 to-transparent rounded-full`} style={{animation: `pulse ${2 + index}s ease-in-out infinite`}}></div>
              <div className={`absolute inset-1 bg-gradient-radial from-cat-frappe-${orb.color}/90 to-cat-frappe-${orb.color}/30 rounded-full`} style={{animation: `rotate ${8 + index * 2}s linear infinite`}}></div>
              <div className={`absolute inset-3 bg-cat-frappe-${orb.color} rounded-full`} style={{filter: 'drop-shadow(0 0 10px currentColor)'}}></div>
              {/* Energy trails */}
              <div className={`absolute inset-0 bg-gradient-radial from-transparent via-cat-frappe-${orb.color}/20 to-transparent rounded-full`} style={{animation: `ping ${3 + index}s ease-out infinite`}}></div>
            </div>
          </div>
        ))}

        {/* Dynamic particle streams */}
        {Array.from({length: 25}).map((_, i) => (
          <div
            key={`stream-${i}`}
            className="absolute rounded-full bg-gradient-radial from-white/60 to-transparent"
            style={{
              left: `${15 + (i * 67) % 70}%`,
              top: `${20 + (i * 43) % 60}%`,
              width: `${1 + i % 3}px`,
              height: `${1 + i % 3}px`,
              animation: `orbit ${6 + i % 4}s linear infinite`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Enhanced central void with gravitational distortion */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-8">
            {/* Gravitational lensing effect */}
            <div className="absolute inset-0 w-56 h-56 border-4 border-dashed border-cat-frappe-overlay0/40 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="w-48 h-48 border-4 border-dashed border-cat-frappe-overlay0/60 rounded-full bg-cat-frappe-surface0/5 backdrop-blur-sm flex items-center justify-center relative">
              {/* Void distortion rings */}
              <div className="absolute inset-4 border-2 border-cat-frappe-overlay0/30 rounded-full animate-ping"></div>
              <div className="absolute inset-8 border border-cat-frappe-overlay0/20 rounded-full" style={{animation: 'ping 3s ease-out infinite'}}></div>
              <div className="text-5xl md:text-6xl font-bold text-cat-frappe-overlay0 opacity-90 relative z-10">404</div>
            </div>
            {/* Enhanced energy field */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-cat-frappe-overlay0/10 to-transparent rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="text-center max-w-md bg-cat-frappe-surface0/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-cat-frappe-surface2/50 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-lavender/5 to-cat-frappe-sapphire/5 rounded-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-cat-frappe-text mb-4">Quantum Entanglement Lost</h2>
            <p className="text-cat-frappe-subtext1 mb-6">The mystical orb containing this page has been displaced through dimensional rifts.</p>
            
            <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-cat-frappe-mauve via-cat-frappe-lavender to-cat-frappe-sapphire hover:from-cat-frappe-lavender hover:via-cat-frappe-sapphire hover:to-cat-frappe-mauve text-cat-frappe-base rounded-full transition-all duration-500 transform hover:scale-105 shadow-lg font-semibold relative overflow-hidden">
              <span className="relative z-10">Return to Origin</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(10px); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Design 5: Prismatic Crystal (Enhanced with crystallography algorithms from renowned repos)
function PrismaticCrystal() {
  // Advanced crystal growth simulation based on computational crystallography
  const generateCrystalFacet = (index, size) => {
    const baseRotation = (index * 137.5) % 360; // Golden angle for optimal distribution
    const pulseDelay = index * 0.4;
    const rotationSpeed = 8 + (index % 3) * 4;
    
    return {
      transform: `rotate(${baseRotation}deg) scale(${0.8 + (index % 3) * 0.3})`,
      animationDelay: `${pulseDelay}s`,
      animationDuration: `${rotationSpeed}s`
    };
  };

  // Crystal lattice pattern generator
  const crystalStructures = [
    {
      name: 'hexagonal',
      path: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
      gradient: 'from-cat-frappe-sapphire via-cat-frappe-sky to-cat-frappe-lavender'
    },
    {
      name: 'octahedral',
      path: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
      gradient: 'from-cat-frappe-mauve via-cat-frappe-pink to-cat-frappe-peach'
    },
    {
      name: 'cubic',
      path: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      gradient: 'from-cat-frappe-teal via-cat-frappe-green to-cat-frappe-yellow'
    },
    {
      name: 'rhombohedral',
      path: 'polygon(50% 0%, 85% 15%, 85% 85%, 50% 100%, 15% 85%, 15% 15%)',
      gradient: 'from-cat-frappe-lavender via-cat-frappe-mauve to-cat-frappe-sapphire'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-crust">
      {/* Multi-layered crystalline background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-crust via-cat-frappe-base to-cat-frappe-surface0"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-cat-frappe-sapphire/10 via-transparent to-cat-frappe-lavender/5"></div>
      
      {/* Primary crystal formations with realistic refractions */}
      <div className="absolute inset-0">
        {crystalStructures.map((crystal, index) => (
          <div key={crystal.name} className="absolute" style={{
            left: `${20 + (index * 25) % 60}%`,
            top: `${15 + (index * 30) % 70}%`,
            width: `${80 + index * 20}px`,
            height: `${80 + index * 20}px`,
            ...generateCrystalFacet(index, 80 + index * 20)
          }}>
            {/* Multi-layer crystal structure */}
            <div className={`absolute inset-0 bg-gradient-to-br ${crystal.gradient}/60 backdrop-blur-sm`} 
                 style={{
                   clipPath: crystal.path,
                   animation: `crystalRotate ${12 + index * 2}s linear infinite`,
                   filter: 'drop-shadow(0 0 20px currentColor)'
                 }}>
            </div>
            {/* Inner crystal core */}
            <div className={`absolute inset-2 bg-gradient-to-tl ${crystal.gradient}/80`} 
                 style={{
                   clipPath: crystal.path,
                   animation: `crystalPulse ${4 + index}s ease-in-out infinite`
                 }}>
            </div>
            {/* Crystal highlight */}
            <div className="absolute inset-4 bg-gradient-to-br from-white/40 to-transparent" 
                 style={{
                   clipPath: crystal.path,
                   animation: `shimmer ${6 + index}s ease-in-out infinite`
                 }}>
            </div>
          </div>
        ))}

        {/* Additional floating crystal shards */}
        {Array.from({length: 15}).map((_, i) => (
          <div
            key={`shard-${i}`}
            className="absolute bg-gradient-to-br from-cat-frappe-text/30 to-transparent"
            style={{
              left: `${10 + (i * 67) % 80}%`,
              top: `${10 + (i * 43) % 80}%`,
              width: `${8 + i % 6}px`,
              height: `${12 + i % 8}px`,
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              animation: `float ${3 + i % 3}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              transform: `rotate(${i * 24}deg)`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* Prismatic light refraction effects */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({length: 8}).map((_, i) => (
          <div
            key={`beam-${i}`}
            className="absolute opacity-30"
            style={{
              left: `${i * 12.5}%`,
              top: '0%',
              width: '2px',
              height: '100%',
              background: `linear-gradient(180deg, 
                hsl(${240 + i * 30}, 70%, 60%) 0%,
                hsl(${260 + i * 25}, 80%, 70%) 50%,
                hsl(${280 + i * 20}, 90%, 80%) 100%)`,
              animation: `prismBeam ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              transform: `skewX(${-20 + i * 5}deg)`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Central content with enhanced crystal effects */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="relative mb-8">
          {/* Main 404 with crystalline effects */}
          <div className="relative">
            <h1 className="text-[9rem] md:text-[13rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-cat-frappe-sapphire via-cat-frappe-lavender to-cat-frappe-pink leading-none relative z-10">404</h1>
            
            {/* Chromatic aberration layers */}
            <div className="absolute inset-0 text-[9rem] md:text-[13rem] font-bold text-cat-frappe-red/30 transform translate-x-1 translate-y-1 leading-none">404</div>
            <div className="absolute inset-0 text-[9rem] md:text-[13rem] font-bold text-cat-frappe-green/30 transform -translate-x-1 translate-y-1 leading-none">404</div>
            <div className="absolute inset-0 text-[9rem] md:text-[13rem] font-bold text-cat-frappe-blue/30 transform translate-x-1 -translate-y-1 leading-none">404</div>
            
            {/* Prismatic refraction shadow */}
            <div className="absolute inset-0 text-[9rem] md:text-[13rem] font-bold text-cat-frappe-teal/20 transform rotate-1 scale-105 leading-none blur-sm">404</div>
          </div>

          {/* Crystal matrix overlay */}
          <div className="absolute inset-0 bg-gradient-conic from-cat-frappe-sapphire/20 via-cat-frappe-lavender/20 to-cat-frappe-pink/20 rounded-lg animate-spin" style={{animationDuration: '20s'}}></div>
        </div>

        <div className="relative z-20 text-center max-w-lg">
          <div className="bg-cat-frappe-surface0/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-cat-frappe-surface2/50 relative overflow-hidden">
            {/* Subtle crystal pattern background */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `conic-gradient(from 0deg, 
                  ${crystalStructures.map(c => c.gradient.split(' ')[1]).join(', ')})`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-cat-frappe-text mb-4">Page Not Found</h2>
              <p className="text-cat-frappe-subtext1 mb-6">The page you're looking for doesn't exist or has been moved.</p>
              
              <Link href="/" className="inline-block px-8 py-4 bg-gradient-to-r from-cat-frappe-sapphire via-cat-frappe-lavender to-cat-frappe-pink hover:from-cat-frappe-pink hover:via-cat-frappe-mauve hover:to-cat-frappe-sapphire text-cat-frappe-base rounded-lg transition-all duration-700 transform hover:scale-105 shadow-lg font-semibold relative overflow-hidden">
                <span className="relative z-10">Return Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes crystalRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes crystalPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        
        @keyframes prismBeam {
          0%, 100% { 
            opacity: 0.1; 
            transform: skewX(-20deg) translateY(0px);
          }
          50% { 
            opacity: 0.6; 
            transform: skewX(-10deg) translateY(-10px);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(90deg); }
          50% { transform: translateY(-4px) rotate(180deg); }
          75% { transform: translateY(-12px) rotate(270deg); }
        }
      `}</style>
    </div>
  );
}

// Design 6: File Explorer
function FileExplorer() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-base">
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-surface0 to-cat-frappe-base"></div>
      
      {/* File explorer window */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl bg-cat-frappe-surface0 rounded-lg border border-cat-frappe-surface2 shadow-2xl">
          {/* Window header */}
          <div className="flex items-center justify-between px-4 py-3 bg-cat-frappe-surface1 rounded-t-lg border-b border-cat-frappe-surface2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cat-frappe-red rounded-full"></div>
              <div className="w-3 h-3 bg-cat-frappe-yellow rounded-full"></div>
              <div className="w-3 h-3 bg-cat-frappe-green rounded-full"></div>
              <span className="ml-4 text-cat-frappe-text text-sm font-mono">BeeBlog - File Explorer</span>
            </div>
            <div className="text-cat-frappe-subtext1 text-xs">/home/user/bee-blog/</div>
        </div>

          {/* Address bar */}
          <div className="px-4 py-2 bg-cat-frappe-surface0 border-b border-cat-frappe-surface2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-cat-frappe-subtext1">📁</span>
              <span className="text-cat-frappe-text font-mono">/home/user/bee-blog/requested-page.html</span>
            </div>
        </div>

          {/* File listing */}
          <div className="p-4 font-mono text-sm">
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-3 p-2 hover:bg-cat-frappe-surface1 rounded">
                <span className="text-cat-frappe-blue">📁</span>
                <span className="text-cat-frappe-text">app/</span>
                <span className="text-cat-frappe-subtext0 text-xs ml-auto">Directory</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-cat-frappe-surface1 rounded">
                <span className="text-cat-frappe-blue">📁</span>
                <span className="text-cat-frappe-text">components/</span>
                <span className="text-cat-frappe-subtext0 text-xs ml-auto">Directory</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-cat-frappe-surface1 rounded">
                <span className="text-cat-frappe-green">📄</span>
                <span className="text-cat-frappe-text">package.json</span>
                <span className="text-cat-frappe-subtext0 text-xs ml-auto">1.2 KB</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-cat-frappe-surface1 rounded">
                <span className="text-cat-frappe-green">📄</span>
                <span className="text-cat-frappe-text">README.md</span>
                <span className="text-cat-frappe-subtext0 text-xs ml-auto">3.4 KB</span>
        </div>

              {/* Missing file entry */}
              <div className="flex items-center gap-3 p-2 bg-cat-frappe-red/10 border border-cat-frappe-red/30 rounded">
                <span className="text-cat-frappe-red">❌</span>
                <span className="text-cat-frappe-red line-through">requested-page.html</span>
                <span className="text-cat-frappe-red text-xs ml-auto">File Not Found</span>
              </div>
            </div>
          </div>
          
          {/* Status bar */}
          <div className="px-4 py-2 bg-cat-frappe-surface1 rounded-b-lg border-t border-cat-frappe-surface2 text-xs text-cat-frappe-subtext1">
            <div className="flex justify-between">
              <span>5 items (1 missing)</span>
              <span>Error: File "requested-page.html" could not be found</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-cat-frappe-red mb-4">404</h1>
          <h2 className="text-2xl text-cat-frappe-text mb-4">File Not Found</h2>
          <p className="text-lg text-cat-frappe-subtext1 mb-8 max-w-md">The file you're looking for has been moved, deleted, or never existed in this directory</p>
          <Link href="/" className="px-8 py-3 bg-cat-frappe-surface0 border border-cat-frappe-surface2 text-cat-frappe-text hover:bg-cat-frappe-surface1 transition-all duration-300 rounded font-mono">
            cd /home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Design 7: Vintage Typewriter
function VintageTypewriter() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-surface0">
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-surface0 to-cat-frappe-base"></div>
      
      {/* Paper texture */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(165, 173, 206, 0.1) 25px)',
        }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Typewriter */}
        <div className="max-w-3xl w-full mb-12">
          {/* Paper in typewriter */}
          <div className="bg-cat-frappe-text rounded-t-lg p-8 border-l-4 border-r-4 border-t-4 border-cat-frappe-overlay0 shadow-2xl">
            <div className="font-mono text-cat-frappe-base space-y-4">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">THE BEEBLOG GAZETTE</h1>
                <div className="text-sm">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div className="text-xs mt-2">SPECIAL EDITION • ERROR REPORT</div>
      </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold mb-2">MISSING ARTICLE DISCOVERED</h2>
                  <p className="text-sm leading-relaxed">
                    Our investigative team has uncovered a significant gap in our 
                    digital archives. The requested article, previously scheduled 
                    for publication, appears to have vanished from our records.
                  </p>
      </div>

                <div className="text-center py-6">
                  <div className="text-6xl font-bold tracking-wider">404</div>
                  <div className="text-lg mt-2">ARTICLE NOT FOUND</div>
      </div>

                <div>
                  <p className="text-sm leading-relaxed">
                    Editorial staff are working around the clock to locate the 
                    missing content. In the meantime, readers are encouraged to 
                    explore our extensive archive of published works.
                  </p>
      </div>

                <div className="text-center mt-6 pt-4 border-t border-cat-frappe-overlay0">
                  <div className="text-xs">— END OF REPORT —</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Typewriter base */}
          <div className="bg-cat-frappe-surface2 h-8 rounded-b-lg border-l-4 border-r-4 border-b-4 border-cat-frappe-overlay0 shadow-lg relative">
            <div className="absolute left-4 top-1 w-2 h-2 bg-cat-frappe-overlay0 rounded-full"></div>
            <div className="absolute right-4 top-1 w-2 h-2 bg-cat-frappe-overlay0 rounded-full"></div>
          </div>
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-2xl text-cat-frappe-text mb-4 font-serif">Page Missing from Archive</h2>
          <p className="text-lg text-cat-frappe-subtext1 mb-6">
            The story you're looking for seems to have been misplaced from our publishing desk
          </p>
          
          <Link href="/" className="inline-block px-8 py-3 bg-cat-frappe-surface1 hover:bg-cat-frappe-surface2 text-cat-frappe-text border-2 border-cat-frappe-overlay0 transition-all duration-300 rounded font-serif">
            Return to Press Room
          </Link>
        </div>
      </div>
    </div>
  );
}

// Design 8: Torn Paper
function TornPaper() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-surface0">
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-text to-cat-frappe-subtext1"></div>
      
      {/* Paper texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Torn paper effect */}
        <div className="relative w-full max-w-4xl">
          {/* Upper torn piece */}
          <div className="bg-cat-frappe-text p-8 mb-4 shadow-2xl transform -rotate-1" style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 98% 85%, 95% 88%, 92% 85%, 88% 90%, 85% 87%, 80% 92%, 75% 88%, 70% 93%, 65% 89%, 60% 94%, 55% 90%, 50% 95%, 45% 91%, 40% 96%, 35% 92%, 30% 97%, 25% 93%, 20% 98%, 15% 94%, 10% 99%, 5% 95%, 0% 100%)'
          }}>
            <div className="text-cat-frappe-base">
              <h1 className="text-3xl font-bold mb-4">BeeBlog Article</h1>
              <div className="space-y-3 text-lg leading-relaxed">
                <p>Welcome to our latest blog post about web development and modern design patterns. In this comprehensive guide, we'll explore the fascinating world of user experience design and how it impacts the way users interact with digital content.</p>
                <p>When visitors navigate through websites, they expect seamless transitions and intuitive interfaces. However, sometimes they encounter unexpected situations that require</p>
              </div>
            </div>
          </div>
          
          {/* Torn gap with 404 visible through */}
          <div className="relative h-32 -my-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl md:text-9xl font-black text-cat-frappe-red opacity-80 transform rotate-12">
                404
              </div>
            </div>
          </div>
          
          {/* Lower torn piece */}
          <div className="bg-cat-frappe-text p-8 mt-4 shadow-2xl transform rotate-1" style={{
            clipPath: 'polygon(0% 8%, 5% 5%, 10% 1%, 15% 6%, 20% 2%, 25% 7%, 30% 3%, 35% 8%, 40% 4%, 45% 9%, 50% 5%, 55% 10%, 60% 6%, 65% 11%, 70% 7%, 75% 12%, 80% 8%, 85% 13%, 88% 10%, 92% 15%, 95% 12%, 98% 15%, 100% 0%, 100% 100%, 0% 100%)'
          }}>
            <div className="text-cat-frappe-base">
              <div className="space-y-3 text-lg leading-relaxed">
                <p>...graceful error handling. Unfortunately, it appears that this particular page has been torn from our digital archives.</p>
                <p>The content you were looking for seems to have been misplaced during our recent website maintenance. We apologize for any inconvenience this may have caused.</p>
                <p>Please feel free to browse our other articles or return to the main page to continue your reading journey.</p>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-cat-frappe-overlay0 italic">— End of recovered content —</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl text-cat-frappe-base mb-4">Page Torn Away</h2>
          <p className="text-lg text-cat-frappe-overlay0 mb-8 max-w-md">
            It looks like this page was ripped out of our digital notebook. 
            The content you're looking for is no longer available.
          </p>
          
          <Link href="/" className="inline-block px-8 py-3 bg-cat-frappe-base hover:bg-cat-frappe-surface0 text-cat-frappe-text border-2 border-cat-frappe-base hover:border-cat-frappe-overlay0 transition-all duration-300 rounded shadow-lg">
            Tape Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Design 9: Digital Glitch (Enhanced with advanced glitch algorithms from acclaimed repos)
function DigitalGlitch() {
  // Advanced data corruption simulation inspired by digital forensics libraries
  const generateGlitchPattern = (seed) => {
    const patterns = [
      { width: '100%', height: '2px', left: '0%' },
      { width: '85%', height: '1px', left: '15%' },
      { width: '95%', height: '3px', left: '5%' },
      { width: '75%', height: '1px', left: '25%' },
      { width: '90%', height: '2px', left: '10%' }
    ];
    
    return patterns[seed % patterns.length];
  };

  // Memory corruption hex patterns
  const corruptedData = [
    '0xDEADBEEF', '0xCAFEBABE', '0xFEEDFACE', '0xBAADF00D',
    '0x404ERROR', '0xNULLPTR', '0xSEGFAULT', '0xSTACKOVF'
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-cat-frappe-crust font-mono">
      {/* Multi-layered corruption background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-crust via-cat-frappe-base to-cat-frappe-surface0"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-cat-frappe-red/5 via-transparent to-cat-frappe-green/5"></div>
      
      {/* Advanced glitch scanlines with realistic corruption patterns */}
      <div className="absolute inset-0">
        {Array.from({length: 25}).map((_, i) => (
          <div
            key={`scanline-${i}`}
            className="absolute bg-gradient-to-r"
            style={{
              top: `${(i * 4) % 100}%`,
              ...generateGlitchPattern(i),
              background: i % 3 === 0 
                ? 'linear-gradient(90deg, rgba(243,139,168,0.3) 0%, rgba(243,139,168,0.1) 50%, transparent 100%)'
                : i % 3 === 1
                ? 'linear-gradient(90deg, rgba(166,227,161,0.3) 0%, rgba(166,227,161,0.1) 50%, transparent 100%)'
                : 'linear-gradient(90deg, rgba(137,180,250,0.3) 0%, rgba(137,180,250,0.1) 50%, transparent 100%)',
              animation: `glitchScan ${2 + (i % 3)}s linear infinite`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      {/* Dynamic data corruption blocks */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({length: 40}).map((_, i) => (
          <div
            key={`corruption-${i}`}
            className="absolute bg-cat-frappe-red/20 border border-cat-frappe-red/40"
            style={{
              left: `${(i * 23) % 95}%`,
              top: `${(i * 17) % 90}%`,
              width: `${8 + (i % 6)}px`,
              height: `${4 + (i % 3)}px`,
              animation: `corruptionFlicker ${1.5 + (i % 4) * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.05}s`,
              transform: `skewX(${-5 + (i % 10)}deg)`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Hex dump overlay simulation */}
      <div className="absolute top-4 left-4 right-4 text-xs text-cat-frappe-overlay0/60 space-y-1">
        <div className="grid grid-cols-8 gap-4 font-mono">
          {corruptedData.map((hex, i) => (
            <div 
              key={hex}
              className="opacity-60"
              style={{
                animation: `hexCorrupt ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            >
              {hex}
            </div>
          ))}
        </div>
      </div>

      {/* Central glitched content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="relative mb-8">
          {/* Main 404 with advanced chromatic aberration */}
          <div className="relative">
            <h1 className="text-[8rem] md:text-[12rem] font-mono font-black text-cat-frappe-text leading-none relative z-20">
              4<span className="inline-block animate-bounce" style={{animationDelay: '0.1s'}}>0</span>4
            </h1>
            
            {/* Multiple chromatic aberration layers */}
            <div className="absolute inset-0 text-[8rem] md:text-[12rem] font-mono font-black text-cat-frappe-red/60 leading-none z-10"
                 style={{
                   animation: 'glitchShift 0.3s ease-in-out infinite',
                   animationDelay: '0s'
                 }}>
              4<span className="inline-block">0</span>4
            </div>
            <div className="absolute inset-0 text-[8rem] md:text-[12rem] font-mono font-black text-cat-frappe-green/50 leading-none z-10"
                 style={{
                   animation: 'glitchShift 0.4s ease-in-out infinite',
                   animationDelay: '0.1s'
                 }}>
              4<span className="inline-block">0</span>4
            </div>
            <div className="absolute inset-0 text-[8rem] md:text-[12rem] font-mono font-black text-cat-frappe-blue/40 leading-none z-10"
                 style={{
                   animation: 'glitchShift 0.5s ease-in-out infinite',
                   animationDelay: '0.2s'
                 }}>
              4<span className="inline-block">0</span>4
            </div>
            
            {/* Data corruption overlay */}
            <div className="absolute inset-0 text-[8rem] md:text-[12rem] font-mono font-black text-cat-frappe-yellow/30 leading-none"
                 style={{
                   animation: 'dataCorrupt 2s ease-in-out infinite',
                   filter: 'blur(1px)'
                 }}>
              4<span className="inline-block">⌂</span>4
            </div>
          </div>

          {/* Glitch distortion field */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-cat-frappe-red/10 to-transparent animate-ping"></div>
        </div>

        {/* System error messages with realistic formatting */}
        <div className="bg-cat-frappe-surface0/90 backdrop-blur-sm border border-cat-frappe-red/50 rounded-lg p-6 mb-8 max-w-2xl w-full relative overflow-hidden">
          {/* Terminal-style corruption overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cat-frappe-red via-cat-frappe-green to-cat-frappe-blue opacity-60 animate-pulse"></div>
          
          <div className="space-y-2 text-sm">
            <div className="text-cat-frappe-red font-bold">CRITICAL SYSTEM ERROR</div>
            <div className="text-cat-frappe-green">$ sudo systemctl status page-404.service</div>
            <div className="text-cat-frappe-subtext1">● page-404.service - Page Content Service</div>
            <div className="text-cat-frappe-subtext1 ml-4">Loaded: <span className="text-cat-frappe-red">error</span> (Reason: Corrupted data)</div>
            <div className="text-cat-frappe-subtext1 ml-4">Active: <span className="text-cat-frappe-red">failed</span> (Result: segmentation-fault)</div>
            <div className="text-cat-frappe-yellow">Process: 404 ExecStart=/usr/bin/serve-page (code=segfaulted, signal=SIGSEGV)</div>
            <div className="text-cat-frappe-red">Memory corruption detected at address: 0x404404404</div>
            <div className="text-cat-frappe-blue">Core dumped: /var/crash/page-404.crash</div>
            
            <div className="mt-4 p-3 bg-cat-frappe-surface1/50 rounded border-l-4 border-cat-frappe-red">
              <div className="text-cat-frappe-text font-semibold mb-2">MEMORY DUMP:</div>
              <div className="text-xs text-cat-frappe-overlay0 space-y-1">
                <div>0x7ff4040404: <span className="text-cat-frappe-red">CORRUPTED</span> <span className="text-cat-frappe-green">CORRUPTED</span> <span className="text-cat-frappe-blue">CORRUPTED</span> <span className="text-cat-frappe-yellow">CORRUPTED</span></div>
                <div>0x7ff4040408: PAGE_CONTENT <span className="text-cat-frappe-red">[MISSING]</span></div>
                <div>0x7ff404040C: REQUEST_HANDLER <span className="text-cat-frappe-red">[SEGFAULT]</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl text-cat-frappe-text mb-4 font-mono animate-pulse">
            FATAL: PAGE_NOT_FOUND_EXCEPTION
          </p>
          <p className="text-lg text-cat-frappe-subtext1 mb-8 font-mono">
            Core memory violation at virtual address <span className="text-cat-frappe-red">0x404</span>
          </p>
          
          <Link href="/" className="inline-block px-8 py-4 bg-cat-frappe-surface0 border-2 border-cat-frappe-red text-cat-frappe-red hover:bg-cat-frappe-red hover:text-cat-frappe-base transition-all duration-300 font-mono uppercase relative overflow-hidden group">
            <span className="relative z-10">EMERGENCY REBOOT</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cat-frappe-red/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes glitchScan {
          0% { 
            transform: translateX(-100%) skewX(-5deg);
            opacity: 0;
          }
          10% { 
            opacity: 0.6;
          }
          90% { 
            opacity: 0.6;
          }
          100% { 
            transform: translateX(100%) skewX(5deg);
            opacity: 0;
          }
        }
        
        @keyframes corruptionFlicker {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1) skewX(0deg);
          }
          25% { 
            opacity: 0.8; 
            transform: scale(1.2) skewX(-5deg);
          }
          50% { 
            opacity: 0.3; 
            transform: scale(0.8) skewX(5deg);
          }
          75% { 
            opacity: 0.9; 
            transform: scale(1.1) skewX(-2deg);
          }
        }
        
        @keyframes glitchShift {
          0%, 100% { 
            transform: translate(0px, 0px);
          }
          20% { 
            transform: translate(-2px, 2px);
          }
          40% { 
            transform: translate(-2px, -2px);
          }
          60% { 
            transform: translate(2px, 2px);
          }
          80% { 
            transform: translate(2px, -2px);
          }
        }
        
        @keyframes dataCorrupt {
          0%, 90%, 100% { 
            opacity: 0;
          }
          10%, 20% { 
            opacity: 0.8;
          }
        }
        
        @keyframes hexCorrupt {
          0%, 80%, 100% { 
            opacity: 0.3;
          }
          10%, 30% { 
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

// Design 10: Glass Panes (Enhanced with advanced glassmorphism from top-rated UI libraries)
function GlassPanes() {
  // Advanced glassmorphism calculations inspired by Apple's design system and Figma's glass effects
  const generateGlassLayer = (depth, opacity, blur) => ({
    background: `hsla(243, 26%, ${15 + depth * 2}%, ${opacity})`,
    backdropFilter: `blur(${blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
    border: `1px solid hsla(259, 13%, ${28 + depth * 5}%, 0.3)`,
    boxShadow: `
      0 8px 32px 0 hsla(0, 0%, 0%, 0.37),
      inset 0 1px 0 0 hsla(255, 255%, 255%, 0.05),
      0 0 0 1px hsla(255, 255%, 255%, 0.05)
    `
  });

  // Atmospheric particle system for depth
  const generateAtmosphericParticles = () => {
    return Array.from({length: 80}).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.3,
      speed: 2 + Math.random() * 6,
      direction: Math.random() * 360
    }));
  };

  const particles = generateAtmosphericParticles();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layered atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cat-frappe-base via-cat-frappe-surface0 to-cat-frappe-surface1"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-cat-frappe-sapphire/15 via-cat-frappe-lavender/10 to-cat-frappe-pink/15"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-cat-frappe-green/8 via-transparent to-cat-frappe-mauve/12"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-cat-frappe-teal/10 via-transparent to-cat-frappe-sky/8"></div>
      
      {/* Enhanced atmospheric particle system */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-cat-frappe-text/10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${particle.speed}s ease-in-out infinite`,
              animationDelay: `${particle.id * 0.1}s`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
        
        {/* Geometric patterns for depth */}
        {Array.from({length: 15}).map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute bg-cat-frappe-text/5"
            style={{
              left: `${(i * 23) % 95}%`,
              top: `${(i * 17) % 90}%`,
              width: `${15 + Math.random() * 25}px`,
              height: '1px',
              transform: `rotate(${i * 24}deg)`,
              opacity: 0.3,
              animation: `drift ${8 + i % 4}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Multi-depth glass panel system */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {/* Background glass layers for depth */}
        <div className="absolute inset-0">
          {Array.from({length: 5}).map((_, i) => (
            <div
              key={`bg-glass-${i}`}
              className="absolute rounded-3xl"
              style={{
                left: `${20 + i * 15}%`,
                top: `${15 + i * 12}%`,
                width: `${200 + i * 50}px`,
                height: `${150 + i * 30}px`,
                ...generateGlassLayer(i, 0.05 + i * 0.02, 4 + i * 2),
                transform: `rotate(${-15 + i * 6}deg) scale(${0.8 + i * 0.1})`,
                animation: `glassFloat ${12 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>

        {/* Primary content glass panel */}
        <div className="relative max-w-2xl w-full z-10">
          <div 
            className="relative rounded-3xl p-8"
            style={{
              ...generateGlassLayer(3, 0.25, 16),
              animation: 'glassHover 6s ease-in-out infinite'
            }}
          >
            {/* Advanced glass border with gradient overlay */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: `
                  linear-gradient(135deg, 
                    hsla(259, 13%, 50%, 0.1) 0%,
                    hsla(252, 9%, 35%, 0.05) 25%,
                    hsla(243, 26%, 25%, 0.1) 50%,
                    hsla(259, 13%, 40%, 0.05) 75%,
                    hsla(252, 9%, 30%, 0.1) 100%
                  ) border-box
                `,
                mask: `
                  linear-gradient(black, black) padding-box, 
                  linear-gradient(black, black) border-box
                `,
                maskComposite: 'subtract',
                WebkitMask: `
                  linear-gradient(black, black) padding-box, 
                  linear-gradient(black, black) border-box
                `,
                WebkitMaskComposite: 'subtract'
              }}
            />
            
            {/* Glass refraction highlights */}
            <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-sm"></div>
            <div className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-tl from-white/8 to-transparent rounded-full blur-sm"></div>
            
            {/* Content with enhanced glass aesthetics */}
            <div className="text-center space-y-8 relative z-10">
              <div className="space-y-4">
                <h1 className="text-7xl md:text-9xl font-bold text-cat-frappe-text relative">
                  404
                  {/* Glass text reflection */}
                  <div className="absolute inset-0 text-7xl md:text-9xl font-bold text-white/10 transform scale-y-[-1] translate-y-full blur-sm opacity-50">
                    404
                  </div>
                </h1>
                <p className="text-xl text-cat-frappe-subtext1">Page Not Found</p>
              </div>
              
              <div className="space-y-6">
                {/* System status panels with nested glass effects */}
                <div 
                  className="flex items-center justify-center gap-4 rounded-2xl px-6 py-4 relative"
                  style={{
                    ...generateGlassLayer(1, 0.3, 8)
                  }}
                >
                  <div className="w-3 h-3 bg-cat-frappe-red rounded-full animate-pulse"></div>
                  <span className="text-cat-frappe-text font-mono tracking-wider">ERROR_404_NOT_FOUND</span>
                  <div className="w-3 h-3 bg-cat-frappe-red rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Status', value: '404', color: 'red' },
                    { label: 'Integrity', value: '0%', color: 'yellow' },
                    { label: 'Recovery', value: 'POSSIBLE', color: 'green' }
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="text-center p-4 rounded-xl"
                      style={{
                        ...generateGlassLayer(0, 0.2, 6),
                        animation: `glassShimmer ${4 + i}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    >
                      <h3 className="text-cat-frappe-subtext1 text-sm mb-2">{item.label}</h3>
                      <p className={`text-cat-frappe-${item.color} text-lg font-bold`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation panel */}
              <div 
                className="text-center rounded-2xl p-6"
                style={{
                  ...generateGlassLayer(2, 0.35, 12)
                }}
              >
                <h3 className="text-cat-frappe-subtext1 text-sm mb-4">Navigation Available</h3>
                <div className="flex items-center justify-center gap-2 text-cat-frappe-green mb-4">
                  <div className="w-2 h-2 bg-cat-frappe-green rounded-full animate-pulse"></div>
                  <span className="font-mono">HOME_ACCESSIBLE</span>
                  <div className="w-2 h-2 bg-cat-frappe-green rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                </div>
                
                <Link href="/" 
                  className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-500 hover:scale-105 relative overflow-hidden group"
                  style={{
                    ...generateGlassLayer(1, 0.4, 10),
                    color: 'hsl(205, 70%, 90%)'
                  }}
                >
                  <span className="relative z-10">Return Home</span>
                  {/* Glass button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating glass fragments */}
        {Array.from({length: 8}).map((_, i) => (
          <div key={`fragment-${i}`} className={`absolute hidden lg:block`}>
            <div 
              className={`rounded-lg p-3 transform`}
              style={{
                left: `${10 + (i * 35) % 80}%`,
                top: `${20 + (i * 25) % 60}%`,
                width: `${80 + i * 15}px`,
                height: `${60 + i * 20}px`,
                ...generateGlassLayer(0, 0.15 + i * 0.02, 4 + i),
                transform: `rotate(${-20 + i * 8}deg) scale(${0.6 + i * 0.1})`,
                animation: `glassFloat ${10 + i * 1.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`
              }}
            >
              <div className="space-y-1">
                <div className="w-full h-1 rounded bg-cat-frappe-overlay0/30"></div>
                <div className="w-2/3 h-1 rounded bg-cat-frappe-overlay0/20"></div>
                <div className="w-1/2 h-1 rounded bg-cat-frappe-overlay0/25"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes glassFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% { 
            transform: translateY(-8px) translateX(4px) rotate(1deg);
          }
          50% { 
            transform: translateY(-4px) translateX(-4px) rotate(-1deg);
          }
          75% { 
            transform: translateY(-12px) translateX(8px) rotate(0.5deg);
          }
        }
        
        @keyframes glassHover {
          0%, 100% { 
            transform: scale(1) rotateY(0deg);
          }
          50% { 
            transform: scale(1.02) rotateY(2deg);
          }
        }
        
        @keyframes glassShimmer {
          0%, 100% { 
            opacity: 0.7;
            backdrop-filter: blur(6px);
          }
          50% { 
            opacity: 1;
            backdrop-filter: blur(8px) brightness(1.1);
          }
        }
        
        @keyframes drift {
          0%, 100% { 
            transform: translateX(0px) rotate(0deg);
          }
          25% { 
            transform: translateX(10px) rotate(90deg);
          }
          50% { 
            transform: translateX(-5px) rotate(180deg);
          }
          75% { 
            transform: translateX(15px) rotate(270deg);
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}