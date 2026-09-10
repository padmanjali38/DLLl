import React from 'react';
import { BookOpen, PlusCircle, Trash2, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { DLL_LEVELS, DLLLevel } from './dllGameData';
import { soundManager } from '../../utils/audio';

interface DLLLevelSelectScreenProps {
  completedTaskIds: string[];
  totalXP: number;
  onSelectLevel: (level: DLLLevel) => void;
}

export const DLLLevelSelectScreen: React.FC<DLLLevelSelectScreenProps> = ({
  completedTaskIds,
  totalXP,
  onSelectLevel,
}) => {
  const getLevelIcon = (levelNum: number) => {
    switch (levelNum) {
      case 1:
        return <BookOpen className="w-6 h-6 text-[#2563EB] dark:text-blue-400" />;
      case 2:
        return <PlusCircle className="w-6 h-6 text-[#2563EB] dark:text-blue-400" />;
      case 3:
        return <Trash2 className="w-6 h-6 text-[#2563EB] dark:text-blue-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-[#2563EB] dark:text-blue-400" />;
    }
  };

  const handleCardClick = (level: DLLLevel) => {
    soundManager.playClick();
    onSelectLevel(level);
  };

  return (
    <div id="dll-level-selection-screen" className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8 font-sans select-text">
      {/* =========================================================================
          TOP AREA: TITLE, SUBTITLE & XP DISPLAY
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Choose a Topic to Play
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Select a DLL topic to practice concepts, insertion, and deletion.
          </p>
        </div>

        {/* XP Display Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-xs shrink-0 self-start sm:self-auto">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Total XP
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
              {totalXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          THREE LARGE ROUNDED CARDS ARRANGED HORIZONTALLY ON DESKTOP
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {DLL_LEVELS.map((lvl) => {
          const completedCount = lvl.tasks.filter((t) => completedTaskIds.includes(t.id)).length;
          const isLevelComplete = completedCount === lvl.tasks.length;

          return (
            <div
              key={lvl.id}
              id={`card-level-${lvl.number}`}
              onClick={() => handleCardClick(lvl)}
              className="group flex flex-col justify-between bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-200 cursor-pointer"
            >
              {/* Card Top: Icon & Badge */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getLevelIcon(lvl.number)}
                  </div>
                  {isLevelComplete ? (
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>COMPLETED</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40">
                      {lvl.badge}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 pt-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                    {lvl.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed min-h-[40px]">
                    {lvl.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Play Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(lvl);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Play</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
