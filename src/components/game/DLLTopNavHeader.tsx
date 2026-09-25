import React from 'react';
import {
  ArrowLeftRight,
  Lock,
  CheckCircle2,
  Zap,
  Volume2,
  VolumeX,
  LayoutGrid,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DLL_ARENA_LEVELS } from '../../data/dllArenaLevelsData';
import { LevelConfig } from '../../types/dllGameTypes';

interface DLLTopNavHeaderProps {
  selectedLevel: number;
  completedLevelNumbers: number[];
  totalXp: number;
  currentView: 'landing' | 'normal_play' | 'guided_solve';
  isMuted: boolean;
  onToggleMute: () => void;
  onSelectLevel: (levelNum: number) => void;
  onToggleView: (view: 'landing' | 'normal_play') => void;
  onResetProgress?: () => void;
  onLockedClick: (reqLevel: number) => void;
}

export const DLLTopNavHeader: React.FC<DLLTopNavHeaderProps> = ({
  selectedLevel,
  completedLevelNumbers,
  totalXp,
  currentView,
  isMuted,
  onToggleMute,
  onSelectLevel,
  onToggleView,
  onLockedClick,
}) => {
  const currentLvlConfig: LevelConfig =
    DLL_ARENA_LEVELS.find((l) => l.id === selectedLevel) || DLL_ARENA_LEVELS[0];
  const completedCount = completedLevelNumbers.length;

  return (
    <header
      id="dll-level-navigation-header"
      className="w-full bg-white dark:bg-[#0B132B] text-slate-800 dark:text-slate-100 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl overflow-hidden transition-colors"
    >
      {/* 1. TOP TITLE ROW */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80 dark:bg-[#090E1A]/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-indigo-600 border border-blue-500/40 dark:border-indigo-400/40 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-white font-mono uppercase">
                DOUBLY LINKED LIST • HANDS-ON GAME
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-blue-200 dark:border-indigo-500/30 hidden sm:inline-block">
                PREV ⇄ NEXT
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Direct Memory Address Manipulation • 8 Progressive Levels
            </p>
          </div>
        </div>

        {/* View Switcher, Total XP, Audio */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle Button */}
          <div className="bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <button
              id="btn-view-cards"
              onClick={() => onToggleView('landing')}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
              }`}
              title="Overview of level and task cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Level Overview</span>
            </button>
            <button
              id="btn-view-workspace"
              onClick={() => onToggleView('normal_play')}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'normal_play' || currentView === 'guided_solve'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
              }`}
              title="Interactive level workspace"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>L0{selectedLevel} Workspace</span>
            </button>
          </div>

          {/* Total XP Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-current text-purple-600 dark:text-purple-400" />
            <span>{totalXp} XP</span>
          </div>

          {/* Solved Levels Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{completedCount} / 8 Solved</span>
          </div>

          {/* Audio Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
            }`}
            title={isMuted ? 'Unmute game audio' : 'Mute game audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500 dark:text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. LEVEL NAVIGATION: L01  L02  L03  L04  L05  L06  L07  L08 */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-[#080D1A] border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        <div className="flex items-center gap-2 min-w-max">
          {DLL_ARENA_LEVELS.map((lvl) => {
            const isUnlocked = lvl.id === 1 || completedLevelNumbers.includes(lvl.id - 1);
            const isCompleted = completedLevelNumbers.includes(lvl.id);
            const isSelected = selectedLevel === lvl.id;

            return (
              <button
                key={lvl.id}
                id={`btn-nav-level-${lvl.id}`}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.id);
                  } else {
                    onLockedClick(lvl.id - 1);
                  }
                }}
                className={`group relative px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40 cursor-pointer'
                    : isUnlocked
                    ? 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                }`}
                title={lvl.title}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-black shrink-0 ${
                    isSelected
                      ? 'bg-white text-blue-700'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isUnlocked
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : 'bg-slate-200 dark:bg-slate-900 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <span>{lvl.code}</span>
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span className="font-mono text-xs font-extrabold tracking-wide">
                    {lvl.code}
                  </span>
                  <span className={`text-[10px] font-sans truncate max-w-[120px] ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {lvl.title.replace(`Level 0${lvl.id} • `, '').replace(`${lvl.code} — `, '')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FOUR KEY STAT BOXES (Shown in Workspace View) */}
      {currentView !== 'landing' && (
        <div className="px-5 py-3 bg-slate-50/60 dark:bg-[#0A1022] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono border-t border-slate-200 dark:border-slate-800/60">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              INTERACTION MODE
            </span>
            <span className="font-extrabold text-blue-600 dark:text-sky-400 mt-0.5 text-xs">
              {currentLvlConfig.interactionMode || 'Manual Pointers & Memory'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              TASKS IN LEVEL
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-300 mt-0.5 text-xs">
              {currentLvlConfig.tasks.length} Hands-on Tasks
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              FEEDBACK ENGINE
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 text-xs">
              {currentLvlConfig.feedbackEngine || 'Concept & Address Validation'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              TOTAL XP REWARD
            </span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 text-xs">
              +{currentLvlConfig.totalXp} XP
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
