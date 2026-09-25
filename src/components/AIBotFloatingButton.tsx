import React from 'react';

/**
 * AIBotFloatingButton Component
 * 
 * Renders the circular floating action button fixed to the bottom-right corner
 * across every page in the application, matching Image 1: vibrant blue-to-violet gradient
 * circle with the centered white speech bubble outline icon.
 * 
 * Strictly visual-only as specified (clicking performs no action / triggers no popup).
 */
export const AIBotFloatingButton: React.FC = () => {
  return (
    <button
      id="ai-bot-floating-button"
      type="button"
      aria-label="AI Assistant"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 z-30 w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] lg:w-[64px] lg:h-[64px] rounded-full p-0 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_8px_24px_-3px_rgba(79,70,229,0.45)] hover:shadow-[0_12px_28px_-2px_rgba(124,58,237,0.55)] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 dark:focus:ring-offset-slate-900 select-none"
      onClick={(e) => {
        // Visual-only at this stage as strictly mandated
        e.preventDefault();
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full rounded-full overflow-hidden block"
      >
        <defs>
          {/* Saturated Electric Blue to Radiant Violet Diagonal Gradient matching Image 1 */}
          <linearGradient id="aiChatBadgeGrad" x1="14%" y1="12%" x2="86%" y2="88%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="28%" stopColor="#3B52F6" />
            <stop offset="55%" stopColor="#6034F2" />
            <stop offset="78%" stopColor="#7E1CE9" />
            <stop offset="100%" stopColor="#9212E8" />
          </linearGradient>
        </defs>

        {/* 1. Base Circular Gradient Badge */}
        <circle cx="50" cy="50" r="50" fill="url(#aiChatBadgeGrad)" />

        {/* 2. White Speech Bubble Outline matching Image 1 */}
        <path
          d="M 32.9 54.3 C 32.2 58.5 30.5 63.5 31.5 66.5 C 32.0 68.0 33.8 68.5 35.8 67.2 C 39.8 64.5 44.2 64.8 48.3 66.3 A 19.5 19.5 0 1 0 32.9 54.3 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

