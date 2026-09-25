import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Flame,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DSA_GAME_LEVELS, DSALevelDefinition } from '../../data/dsaLevelsConfig';
import { DSAGameCard } from './DSAGameCard';
import { soundManager } from '../../utils/audio';

interface DSAGameLandingProps {
  completedLevelNumbers: number[];
  totalXp: number;
  onPlayLevel: (levelNumber: number) => void;
  onGuidedSolve: (levelNumber: number) => void;
}

export const DSAGameLanding: React.FC<DSAGameLandingProps> = ({
  completedLevelNumbers,
  totalXp,
  onPlayLevel,
  onGuidedSolve,
}) => {
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const completedCount = completedLevelNumbers.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 9) * 100));

  const handleLockedClick = (requiredLevel: number) => {
    soundManager.playError();
    setLockedNotice(`Locked: Please complete Level ${requiredLevel} first to unlock this challenge.`);
    setTimeout(() => {
      setLockedNotice(null);
    }, 4000);
  };

  return (
    <div id="dsa-game-landing-screen" className="flex flex-col gap-8">
      {/* 1. Page Header with Title, Subtitle, and Metrics Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Arena Curriculum
            </span>
            <span className="text-xs text-slate-400 font-mono">9 Mission Challenges</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">
            DSA Game Levels
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Complete interactive challenges, earn XP, and become a DSA Master.
          </p>
        </div>

        {/* Stats Widget */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Total XP */}
          <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400">
                Total Score
              </div>
              <div className="text-xl font-black font-mono text-amber-900 dark:text-amber-200">
                {totalXp} XP
              </div>
            </div>
          </div>

          {/* Completed Levels Progress */}
          <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400">
                Completed
              </div>
              <div className="text-xl font-black font-mono text-indigo-900 dark:text-indigo-200">
                {completedCount} / 9
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Locked Notice Toast */}
      {lockedNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm font-bold flex items-center gap-3 shadow-md animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* 2. Responsive 9-Level Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {DSA_GAME_LEVELS.map((level) => {
          // Level 1 is always unlocked. Level N is unlocked if level N - 1 is completed.
          const isUnlocked = level.level === 1 || completedLevelNumbers.includes(level.level - 1);
          const isCompleted = completedLevelNumbers.includes(level.level);

          return (
            <DSAGameCard
              key={level.level}
              level={level}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              onPlayLevel={onPlayLevel}
              onGuidedSolve={onGuidedSolve}
              onLockedClick={handleLockedClick}
            />
          );
        })}
      </div>
    </div>
  );
};
