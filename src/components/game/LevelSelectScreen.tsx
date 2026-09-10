import React from 'react';
import { Lock, Unlock, Play, CheckCircle2, RotateCcw, Sparkles, ArrowRight, BookOpen, PlusCircle, Trash2 } from 'lucide-react';
import { GAME_LEVELS } from './gameData';

interface LevelSelectScreenProps {
  completedTaskIds: string[];
  isLevel2Unlocked: boolean;
  isLevel3Unlocked: boolean;
  onSelectLevel: (levelId: 1 | 2 | 3) => void;
  onResetProgress: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  completedTaskIds,
  isLevel2Unlocked,
  isLevel3Unlocked,
  onSelectLevel,
  onResetProgress,
}) => {
  const level1CompletedCount = GAME_LEVELS[0].tasks.filter((t) =>
    completedTaskIds.includes(t.id)
  ).length;

  const level2CompletedCount = GAME_LEVELS[1].tasks.filter((t) =>
    completedTaskIds.includes(t.id)
  ).length;

  const level3CompletedCount = GAME_LEVELS[2].tasks.filter((t) =>
    completedTaskIds.includes(t.id)
  ).length;

  const totalTasks = 9;
  const totalCompleted = level1CompletedCount + level2CompletedCount + level3CompletedCount;
  const progressPercent = Math.round((totalCompleted / totalTasks) * 100);

  const levelIcons = [
    <BookOpen key="1" className="w-5 h-5" />,
    <PlusCircle key="2" className="w-5 h-5" />,
    <Trash2 key="3" className="w-5 h-5" />,
  ];

  const levelColors = [
    {
      num: '01',
      bgBadge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      btn: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
      borderHover: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
    {
      num: '02',
      bgBadge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      btn: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700',
      borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    },
    {
      num: '03',
      bgBadge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      btn: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700',
      borderHover: 'hover:border-rose-300 dark:hover:border-rose-700',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Pointer Arena
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Doubly Linked List Challenge
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Master hands-on C/C++ memory pointer mechanics across 3 progressive levels: Concepts, Insertion, and Deletion.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 min-w-[250px] shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-slate-500 dark:text-slate-400 uppercase">Overall Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400">{totalCompleted} / {totalTasks} Tasks</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">{progressPercent}% Mastered (9 Tasks)</span>
              {totalCompleted > 0 && (
                <button
                  onClick={onResetProgress}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer text-[11px]"
                  title="Reset completed tasks"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Level Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GAME_LEVELS.map((level, idx) => {
          const isUnlocked = idx === 0 ? true : idx === 1 ? isLevel2Unlocked : isLevel3Unlocked;
          const completedCount =
            idx === 0 ? level1CompletedCount : idx === 1 ? level2CompletedCount : level3CompletedCount;
          const isFullyDone = completedCount === 3;
          const color = levelColors[idx];

          return (
            <div
              key={level.id}
              id={`level-card-${level.id}`}
              onClick={() => {
                if (isUnlocked) onSelectLevel(level.id as 1 | 2 | 3);
              }}
              className={`group relative rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between ${
                isUnlocked
                  ? `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${color.borderHover} cursor-pointer`
                  : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 opacity-80 cursor-not-allowed'
              }`}
            >
              <div className="space-y-4">
                {/* Header with Level # and Unlock Status */}
                <div className="flex justify-between items-start">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-mono font-black text-base shadow-sm ${
                      isUnlocked
                        ? color.bgBadge
                        : 'bg-slate-200/70 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {color.num}
                  </div>

                  {isUnlocked ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <Unlock className="w-3 h-3" />
                      <span>UNLOCKED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Lock className="w-3 h-3" />
                      <span>LOCKED</span>
                    </div>
                  )}
                </div>

                {/* Title and Description */}
                <div>
                  <div
                    className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                      isUnlocked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                    }`}
                  >
                    {level.badge}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {level.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {level.description}
                  </p>
                </div>

                {/* 3 Tasks Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-slate-400">
                    <span>3 Progressive Tasks:</span>
                    <span>{completedCount} / 3 Met</span>
                  </div>
                  <div className="space-y-1.5">
                    {level.tasks.map((task) => {
                      const isDone = completedTaskIds.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          <div className="truncate mr-2">
                            <span className="font-mono text-[11px] text-slate-400 mr-1.5">
                              T{task.taskNumber}
                            </span>
                            <span>{task.title}</span>
                          </div>
                          {isDone ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              Done
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] shrink-0">
                              {isUnlocked ? '6 Steps' : 'Locked'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lock explanation */}
                {!isUnlocked && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Complete all 3 tasks in Level {idx} to unlock.
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Play Button */}
              <div className="pt-5">
                <button
                  disabled={!isUnlocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isUnlocked) onSelectLevel(level.id as 1 | 2 | 3);
                  }}
                  className={`w-full py-3 px-3 rounded-xl font-mono text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${
                    isUnlocked
                      ? `${color.btn} text-white cursor-pointer`
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isFullyDone ? `Replay Level ${level.id}` : `Play Level ${level.id}`}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked (Complete L{idx})</span>
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
