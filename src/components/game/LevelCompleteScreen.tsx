import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { LevelSpec } from './gameData';

interface LevelCompleteScreenProps {
  level: LevelSpec;
  onBackToLevels: () => void;
  onProceedToNextLevel?: () => void;
  onReplayLevel: () => void;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  level,
  onBackToLevels,
  onProceedToNextLevel,
  onReplayLevel,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#10B981', '#6366F1', '#F59E0B'],
      });
    } catch {
      // ignore
    }
  }, []);

  const nextLevelTitle =
    level.id === 1 ? 'Level 2 (Insertion)' : level.id === 2 ? 'Level 3 (Deletion)' : null;

  return (
    <div className="w-full max-w-xl mx-auto py-8 animate-fade-in text-center select-none">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-lg space-y-6">
        {/* Trophy Icon */}
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center mx-auto text-amber-500 shadow-md shadow-amber-500/10">
          <Trophy className="w-10 h-10" />
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            Level Complete
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {level.title} Mastered!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            You successfully solved all 3 tasks with correct bi-directional pointer wiring and memory management.
          </p>
        </div>

        {/* Task Recap List */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-left space-y-2.5">
          <div className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
            Tasks Completed:
          </div>
          {level.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Task {task.taskNumber}: {task.title}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                6/6 Steps Verified
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {onProceedToNextLevel && nextLevelTitle ? (
            <button
              onClick={onProceedToNextLevel}
              className="w-full flex-1 py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-mono text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Proceed to {nextLevelTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onBackToLevels}
              className="w-full flex-1 py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-mono text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Back to Level Select</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onReplayLevel}
            className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Level</span>
          </button>
        </div>
      </div>
    </div>
  );
};
