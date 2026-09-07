import React from 'react';
import { Sparkles } from 'lucide-react';

interface GameLevelGuideProps {
  levelId: number;
}

const LEVEL_GUIDES: Record<number, string> = {
  1: 'Insert newNode at Head. Link newNode.next to the current head, set head.prev to newNode, and update head in O(1) time.',
  2: 'Insert newNode at Tail. Link tail.next to newNode, set newNode.prev to current tail, and advance tail in O(1) time.',
  3: 'Bi-directional Traversal. Move forward through curr.next or backward through curr.prev to navigate elements.',
  4: 'Middle Position Insertion. Wire all 4 interlocking pointers: newNode.prev, newNode.next, prevNode.next, and nextNode.prev.',
  5: 'Middle Node Deletion. Bypass the target node using target.prev.next = target.next and target.next.prev = target.prev.',
};

export const GameLevelGuide: React.FC<GameLevelGuideProps> = ({ levelId }) => {
  const guideText =
    LEVEL_GUIDES[levelId] ||
    'Calculate the index and place the key in the correct slot according to the level rules.';

  return (
    <div
      key={`guide-level-${levelId}`}
      id={`game-level-guide-${levelId}`}
      className="max-w-2xl mx-auto w-full bg-blue-50/70 dark:bg-[#111827]/90 border border-blue-100 dark:border-slate-800 rounded-2xl p-4 font-sans text-slate-900 dark:text-slate-100 transition-all duration-300 shadow-2xs dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-2 mb-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#2563EB] dark:text-blue-400 text-xs font-bold leading-none">✦</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-300">
            Level Guide
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-widest hidden sm:inline">
            • Level 0{levelId}
          </span>
        </div>

        {/* Small Non-functional AI Placeholder Button */}
        <button
          id="btn-game-ai-placeholder"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            // Non-functional visual placeholder as instructed
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold font-mono rounded-lg bg-white dark:bg-[#0B1120] text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-slate-700 shadow-xs dark:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:border-blue-300 dark:hover:border-blue-500 dark:hover:shadow-[0_0_16px_rgba(37,99,235,0.3)] transition-all cursor-default select-none"
          title="AI Assistant (Preview)"
          aria-label="AI Help Placeholder"
        >
          <Sparkles className="w-3 h-3 text-[#2563EB] dark:text-blue-400" />
          <span>✦ AI HELP</span>
        </button>
      </div>
      <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-3 border-l-2 border-[#2563EB] dark:border-blue-500">
        {guideText}
      </p>
    </div>
  );
};
