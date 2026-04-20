import React from 'react';

export default function Logo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Engineered SVG Icon Logo */}
      <svg viewBox="0 0 100 100" className="h-full aspect-square drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="28" fill="url(#paint0_linear)"/>
        
        {/* Core Heart / Humanity Vector */}
        <path 
          d="M50 35C50 35 38 22 28 32C18 42 25 58 50 78C75 58 82 42 72 32C62 22 50 35 50 35Z" 
          fill="white" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Inner Tech Node */}
        <circle cx="50" cy="46" r="6" fill="#004B8D"/>
        
        {/* Connection Arcs to represent 'Bridging the Gap' */}
        <path d="M30 65 Q 50 45 70 65" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" opacity="0.6"/>

        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#004B8D"/>
            <stop offset="1" stopColor="#10B981"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Modern Gradient Typography */}
      <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#004B8D] to-[#10B981]" style={{ lineHeight: '1' }}>
        ServeX
      </span>
    </div>
  );
}
