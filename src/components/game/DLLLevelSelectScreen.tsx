import React from 'react';
import {
  Lock,
  CheckCircle2,
  Play,
  ArrowRight,
  Sparkles,
  Award,
  RotateCcw,
} from 'lucide-react';
import { DLL_LEVELS, DLLLevel } from './dllGameData';
import { soundManager } from '../../utils/audio';

interface DLLLevelSelectScreenProps {
  completedTaskIds: string[];
  totalXP: number;
  onSelectLevel: (level: DLLLevel) => void;
  onResetGame?: () => void;
}

interface LevelCardConfig {
  levelNumber: string;
  title: string;
  subtitle: string;
  description: string;
  details: {
    label: string;
    value: string;
  }[];
  buttonLabels: {
    notStarted: string;
    inProgress: string;
    completed: string;
    locked: string;
  };
}

const LEVEL_CONFIGS: LevelCardConfig[] = [
  {
    levelNumber: '01',
    title: 'Level 1: DLL Foundations',
    subtitle: 'Build the Basics of a Doubly Linked List',
    description:
      'Create a DLL node, understand PREV and NEXT pointers, connect nodes correctly, and traverse the list from HEAD to TAIL.',
    details: [
      { label: 'Core Skills', value: 'Node Creation • Pointers • Traversal' },
      { label: 'Operations', value: 'Create • Connect • Traverse' },
      { label: 'Tasks', value: '3 Tasks' },
    ],
    buttonLabels: {
      notStarted: 'PLAY LEVEL 1',
      inProgress: 'CONTINUE LEVEL 1',
      completed: 'REPLAY LEVEL 1',
      locked: 'LOCKED',
    },
  },
  {
    levelNumber: '02',
    title: 'Level 2: DLL Insertion',
    subtitle: 'Insert Nodes and Update Pointers',
    description:
      'Create a new node and insert it at the beginning, end, or any position while correctly updating PREV, NEXT, HEAD, and TAIL.',
    details: [
      { label: 'Core Skills', value: 'Node Creation • Pointer Updates' },
      { label: 'Operations', value: 'Beginning • End • Any Position' },
      { label: 'Tasks', value: '4 Tasks' },
    ],
    buttonLabels: {
      notStarted: 'PLAY LEVEL 2',
      inProgress: 'CONTINUE LEVEL 2',
      completed: 'REPLAY LEVEL 2',
      locked: 'LOCKED • COMPLETE LEVEL 1',
    },
  },
  {
    levelNumber: '03',
    title: 'Level 3: DLL Deletion',
    subtitle: 'Remove Nodes Without Breaking the DLL',
    description:
      'Delete nodes from the beginning, end, or any position and reconnect the remaining nodes while keeping the DLL structure correct.',
    details: [
      { label: 'Core Skills', value: 'Pointer Reconnection • Node Removal' },
      { label: 'Operations', value: 'Beginning • End • Any Position' },
      { label: 'Tasks', value: '3 Tasks' },
    ],
    buttonLabels: {
      notStarted: 'PLAY LEVEL 3',
      inProgress: 'CONTINUE LEVEL 3',
      completed: 'REPLAY LEVEL 3',
      locked: 'LOCKED • COMPLETE LEVEL 2',
    },
  },
];

export const DLLLevelSelectScreen: React.FC<DLLLevelSelectScreenProps> = ({
  completedTaskIds,
  totalXP,
  onSelectLevel,
  onResetGame,
}) => {
  // Check completion per level
  const isLevelCompleted = (levelIndex: number) => {
    const lvl = DLL_LEVELS[levelIndex];
    if (!lvl || !lvl.tasks.length) return false;
    return lvl.tasks.every((t) => completedTaskIds.includes(t.id));
  };

  const isLevel1Complete = isLevelCompleted(0);
  const isLevel2Complete = isLevelCompleted(1);
  const isLevel3Complete = isLevelCompleted(2);

  const completedLevelsCount =
    (isLevel1Complete ? 1 : 0) +
    (isLevel2Complete ? 1 : 0) +
    (isLevel3Complete ? 1 : 0);

  const overallPercentage = Math.round((completedLevelsCount / 3) * 100);

  // Determine unlock state based on progressive prerequisites
  const isLevelUnlocked = (levelIndex: number) => {
    if (levelIndex === 0) return true;
    if (levelIndex === 1) {
      return (
        isLevel1Complete ||
        DLL_LEVELS[1].tasks.some((t) => completedTaskIds.includes(t.id))
      );
    }
    if (levelIndex === 2) {
      return (
        isLevel2Complete ||
        DLL_LEVELS[2].tasks.some((t) => completedTaskIds.includes(t.id))
      );
    }
    return false;
  };

  const getLevelProgressState = (levelIndex: number) => {
    const lvl = DLL_LEVELS[levelIndex];
    const unlocked = isLevelUnlocked(levelIndex);
    if (!unlocked) {
      return { status: 'locked' as const, completedCount: 0, totalCount: lvl.tasks.length };
    }

    const completedCount = lvl.tasks.filter((t) => completedTaskIds.includes(t.id)).length;
    const isComplete = completedCount === lvl.tasks.length;
    const inProgress = completedCount > 0 && !isComplete;

    if (isComplete) {
      return { status: 'completed' as const, completedCount, totalCount: lvl.tasks.length };
    }
    if (inProgress) {
      return { status: 'in_progress' as const, completedCount, totalCount: lvl.tasks.length };
    }
    return { status: 'not_started' as const, completedCount, totalCount: lvl.tasks.length };
  };

  const handleCardClick = (level: DLLLevel, unlocked: boolean) => {
    if (!unlocked) return;
    soundManager.playClick();
    onSelectLevel(level);
  };

  return (
    <div
      id="dll-level-selection-screen"
      className="w-full max-w-6xl mx-auto flex flex-col gap-7 sm:gap-8 font-sans select-text animate-fade-in"
    >
      {/* =========================================================================
          PAGE HEADER: TITLE, BADGE, DESCRIPTION & PROGRESS SUMMARY (REFERENCE 2)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Title & Description */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTERACTIVE DLL CHALLENGES • 3 CORE LEVELS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              DLL Quest: Level Selection
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Choose a level to practice Doubly Linked List concepts, pointer manipulation, insertion, deletion, and traversal through interactive gameplay.
            </p>
          </div>

          {/* Right Column: Progress Summary Card */}
          <div className="w-full lg:w-84 bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                PROGRESS SUMMARY
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                  completedLevelsCount === 3
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border-blue-200 dark:border-blue-800'
                }`}
              >
                {completedLevelsCount === 3 ? 'COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400">Completed Levels</span>
              <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                {completedLevelsCount} / 3
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">OVERALL COMPLETION</span>
                <span className="font-mono font-bold text-[#2563EB] dark:text-blue-400">
                  {overallPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2563EB] dark:bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white">{totalXP} XP</span>
              </div>
              {onResetGame && (
                <button
                  id="btn-dll-global-reset"
                  type="button"
                  onClick={onResetGame}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Reset progress"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Progress</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          THREE LARGE LEVEL CARDS IN RESPONSIVE GRID (REFERENCE 1)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DLL_LEVELS.map((lvl, idx) => {
          const config = LEVEL_CONFIGS[idx] || LEVEL_CONFIGS[0];
          const { status } = getLevelProgressState(idx);
          const unlocked = status !== 'locked';

          // Determine button label
          let actionLabel = config.buttonLabels.notStarted;
          if (status === 'locked') {
            actionLabel = config.buttonLabels.locked;
          } else if (status === 'completed') {
            actionLabel = config.buttonLabels.completed;
          } else if (status === 'in_progress') {
            actionLabel = config.buttonLabels.inProgress;
          }

          return (
            <div
              key={lvl.id}
              id={`card-level-${lvl.number}`}
              onClick={() => handleCardClick(lvl, unlocked)}
              className={`group flex flex-col justify-between rounded-2xl sm:rounded-3xl border p-6 sm:p-7 transition-all duration-200 select-none ${
                unlocked
                  ? 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-blue-300 dark:hover:border-blue-700/60 cursor-pointer'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80 cursor-not-allowed'
              }`}
            >
              {/* TOP SECTION: LEVEL NUMBER BADGE + STATUS BADGE + TITLES + DESCRIPTION */}
              <div className="flex flex-col gap-4">
                {/* 1. Header Row: Level Number Badge + Status Badge */}
                <div className="flex items-center justify-between gap-3">
                  {/* LEVEL NUMBER BADGE */}
                  <div
                    className={`w-11 h-11 rounded-2xl border font-mono font-black text-base flex items-center justify-center shadow-xs ${
                      status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                        : status === 'locked'
                        ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                        : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-blue-400'
                    }`}
                  >
                    {config.levelNumber}
                  </div>

                  {/* STATUS BADGE */}
                  {status === 'completed' && (
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>COMPLETED</span>
                    </span>
                  )}
                  {status === 'in_progress' && (
                    <span className="text-xs font-mono font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/80 flex items-center gap-1.5 shadow-2xs">
                      <Play className="w-3 h-3 fill-current" />
                      <span>IN PROGRESS</span>
                    </span>
                  )}
                  {status === 'locked' && (
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>LOCKED</span>
                    </span>
                  )}
                  {status === 'not_started' && (
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80">
                      READY
                    </span>
                  )}
                </div>

                {/* 2. LEVEL TITLE + 3. SHORT BLUE SUBTITLE */}
                <div className="space-y-1 pt-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                    {config.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-[#2563EB] dark:text-blue-400">
                    {config.subtitle}
                  </p>
                </div>

                {/* 4. BEGINNER-FRIENDLY DESCRIPTION */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[56px]">
                  {config.description}
                </p>

                {/* 5. DIVIDER */}
                <div className="border-t border-slate-100 dark:border-slate-800/80" />

                {/* 6. DLL-SPECIFIC DETAIL ROWS */}
                <div className="space-y-1.5 py-1">
                  {config.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center justify-between text-xs gap-2 py-1 border-b border-slate-100/70 dark:border-slate-800/40 last:border-0"
                    >
                      <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">
                        {detail.label}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. BOTTOM ACTION BUTTON */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-5">
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(lvl, unlocked);
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    unlocked
                      ? 'bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white shadow-xs hover:shadow-sm cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60 cursor-not-allowed'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <span>{actionLabel}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
