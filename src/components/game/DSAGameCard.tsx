import React from 'react';
import {
  Play,
  BookOpen,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { DSALevelDefinition } from '../../data/dsaLevelsConfig';

interface DSAGameCardProps {
  level: DSALevelDefinition;
  isUnlocked: boolean;
  isCompleted: boolean;
  onPlayLevel: (levelNumber: number) => void;
  onGuidedSolve: (levelNumber: number) => void;
  onLockedClick: (requiredLevel: number) => void;
}

export const DSAGameCard: React.FC<DSAGameCardProps> = ({
  level,
  isUnlocked,
  isCompleted,
  onPlayLevel,
  onGuidedSolve,
  onLockedClick,
}) => {
  // Color mapping based on level accent
  const colorStyles: Record<
    string,
    {
      borderAccent: string;
      topBar: string;
      levelBadge: string;
      diffColor: string;
      playBtn: string;
      guideBtn: string;
      shadowHover: string;
    }
  > = {
    emerald: {
      borderAccent: 'border-emerald-500/30 hover:border-emerald-500',
      topBar: 'bg-emerald-500',
      levelBadge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      diffColor: 'bg-emerald-500 text-emerald-700 dark:text-emerald-300',
      playBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
      guideBtn: 'border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
      shadowHover: 'hover:shadow-emerald-500/10',
    },
    blue: {
      borderAccent: 'border-blue-500/30 hover:border-blue-500',
      topBar: 'bg-blue-500',
      levelBadge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      diffColor: 'bg-blue-500 text-blue-700 dark:text-blue-300',
      playBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
      guideBtn: 'border-blue-300 dark:border-blue-700/60 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30',
      shadowHover: 'hover:shadow-blue-500/10',
    },
    indigo: {
      borderAccent: 'border-indigo-500/30 hover:border-indigo-500',
      topBar: 'bg-indigo-500',
      levelBadge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      diffColor: 'bg-indigo-500 text-indigo-700 dark:text-indigo-300',
      playBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
      guideBtn: 'border-indigo-300 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30',
      shadowHover: 'hover:shadow-indigo-500/10',
    },
    cyan: {
      borderAccent: 'border-cyan-500/30 hover:border-cyan-500',
      topBar: 'bg-cyan-500',
      levelBadge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
      diffColor: 'bg-cyan-500 text-cyan-700 dark:text-cyan-300',
      playBtn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20',
      guideBtn: 'border-cyan-300 dark:border-cyan-700/60 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30',
      shadowHover: 'hover:shadow-cyan-500/10',
    },
    purple: {
      borderAccent: 'border-purple-500/30 hover:border-purple-500',
      topBar: 'bg-purple-500',
      levelBadge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      diffColor: 'bg-purple-500 text-purple-700 dark:text-purple-300',
      playBtn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
      guideBtn: 'border-purple-300 dark:border-purple-700/60 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30',
      shadowHover: 'hover:shadow-purple-500/10',
    },
    amber: {
      borderAccent: 'border-amber-500/30 hover:border-amber-500',
      topBar: 'bg-amber-500',
      levelBadge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      diffColor: 'bg-amber-500 text-amber-700 dark:text-amber-300',
      playBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
      guideBtn: 'border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30',
      shadowHover: 'hover:shadow-amber-500/10',
    },
    rose: {
      borderAccent: 'border-rose-500/30 hover:border-rose-500',
      topBar: 'bg-rose-500',
      levelBadge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      diffColor: 'bg-rose-500 text-rose-700 dark:text-rose-300',
      playBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
      guideBtn: 'border-rose-300 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30',
      shadowHover: 'hover:shadow-rose-500/10',
    },
    teal: {
      borderAccent: 'border-teal-500/30 hover:border-teal-500',
      topBar: 'bg-teal-500',
      levelBadge: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      diffColor: 'bg-teal-500 text-teal-700 dark:text-teal-300',
      playBtn: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20',
      guideBtn: 'border-teal-300 dark:border-teal-700/60 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30',
      shadowHover: 'hover:shadow-teal-500/10',
    },
    violet: {
      borderAccent: 'border-violet-500/30 hover:border-violet-500',
      topBar: 'bg-violet-500',
      levelBadge: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      diffColor: 'bg-violet-500 text-violet-700 dark:text-violet-300',
      playBtn: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
      guideBtn: 'border-violet-300 dark:border-violet-700/60 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30',
      shadowHover: 'hover:shadow-violet-500/10',
    },
  };

  const style = colorStyles[level.accentColor] || colorStyles.emerald;

  const handleCardClick = () => {
    if (!isUnlocked) {
      onLockedClick(level.level - 1);
    }
  };

  return (
    <div
      id={`dsa-level-card-${level.level}`}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
        isUnlocked
          ? `border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-xl ${style.shadowHover}`
          : 'border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40 opacity-80 cursor-not-allowed'
      }`}
    >
      {/* Top Accent Stripe */}
      <div
        className={`h-1.5 w-full transition-all duration-300 ${
          isUnlocked ? style.topBar : 'bg-slate-300 dark:bg-slate-700'
        }`}
      />

      <div className="p-6 flex flex-col flex-grow justify-between gap-5">
        {/* Row 1: Badges & Rewards */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Level Badge */}
            <span
              className={`px-2.5 py-1 text-xs font-black tracking-wider uppercase rounded-lg border font-mono ${
                isUnlocked ? style.levelBadge : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              LEVEL {level.level.toString().padStart(2, '0')}
            </span>

            {/* Progression Type Pill */}
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60">
              {level.progressType}
            </span>

            {/* Difficulty Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/40">
              <span
                className={`w-2 h-2 rounded-full ${
                  level.difficulty === 'Very Easy'
                    ? 'bg-emerald-500'
                    : level.difficulty === 'Easy'
                    ? 'bg-blue-500'
                    : level.difficulty === 'Medium'
                    ? 'bg-amber-500'
                    : level.difficulty === 'Hard'
                    ? 'bg-rose-500'
                    : 'bg-violet-500'
                }`}
              />
              {level.difficulty}
            </span>
          </div>

          {/* XP Indicator / Completion Badge */}
          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 text-xs font-black font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                +{level.xp} XP
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Title & Description */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {level.title}
            </h3>
            {!isUnlocked && (
              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shrink-0">
                <Lock className="w-4 h-4" />
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {level.description}
          </p>
        </div>

        {/* Row 3: Concept Highlight Box */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
            Concept:
          </span>
          <span className="line-clamp-1">{level.concept}</span>
        </div>

        {/* Row 4: Action Buttons or Locked State */}
        {isUnlocked ? (
          <div className="pt-2 flex items-center gap-3">
            {/* Play Level Button */}
            <button
              id={`btn-play-level-${level.level}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlayLevel(level.level);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-[0.98] ${style.playBtn}`}
            >
              <Play className="w-4 h-4 fill-current" />
              Play Level
            </button>

            {/* Guided Solve Button */}
            <button
              id={`btn-guided-solve-${level.level}`}
              onClick={(e) => {
                e.stopPropagation();
                onGuidedSolve(level.level);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border bg-white dark:bg-slate-900 transition-all active:scale-[0.98] ${style.guideBtn}`}
            >
              <BookOpen className="w-4 h-4" />
              Guided Solve
            </button>
          </div>
        ) : (
          /* Locked State Notice Banner */
          <div className="pt-2">
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Complete Level {level.level - 1} to unlock</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLockedClick(level.level - 1);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Go to L0{level.level - 1}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
