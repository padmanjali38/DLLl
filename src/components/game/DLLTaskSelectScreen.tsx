import React from 'react';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, Award, BookOpen, Layers, PlusCircle, Trash2, Milestone } from 'lucide-react';
import { DLLLevel, DLLTask } from './dllGameData';
import { soundManager } from '../../utils/audio';

interface DLLTaskSelectScreenProps {
  level: DLLLevel;
  completedTaskIds: string[];
  onBackToLevels: () => void;
  onSelectTask: (task: DLLTask) => void;
}

export const DLLTaskSelectScreen: React.FC<DLLTaskSelectScreenProps> = ({
  level,
  completedTaskIds,
  onBackToLevels,
  onSelectTask,
}) => {
  const getTaskIcon = (taskNum: number, levelNum: number) => {
    if (levelNum === 1) {
      if (taskNum === 1) return <BookOpen className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />;
      if (taskNum === 2) return <Layers className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />;
      return <Milestone className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />;
    }
    if (levelNum === 2) {
      return <PlusCircle className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />;
    }
    return <Trash2 className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />;
  };

  const handleTaskClick = (task: DLLTask) => {
    soundManager.playClick();
    onSelectTask(task);
  };

  return (
    <div id="dll-task-selection-screen" className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-7 font-sans select-text">
      {/* =========================================================================
          TOP NAVIGATION & HEADER
          ========================================================================= */}
      <div className="flex flex-col gap-4">
        {/* Back Button & Level Badge */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLevels}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Topics</span>
          </button>

          <span className="text-xs font-mono font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-100 dark:border-blue-900/40">
            {level.badge} • {level.title}
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Hands-on Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Complete the tasks by understanding and manipulating the doubly linked list.
          </p>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN CARD GRID ON DESKTOP (ONE-COLUMN ON MOBILE)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {level.tasks.map((task) => {
          const isDone = completedTaskIds.includes(task.id);

          return (
            <div
              key={task.id}
              id={`task-card-${task.id}`}
              className="flex flex-col justify-between bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-200"
            >
              {/* Card Top: Icon, Task # badge, and XP/Status */}
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center">
                      {getTaskIcon(task.taskNumber, level.number)}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      Task {task.taskNumber}
                    </span>
                  </div>

                  {/* XP Badge OR Done Status */}
                  {isDone ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                      <Award className="w-3.5 h-3.5" />
                      <span>+{task.xp} XP</span>
                    </span>
                  )}
                </div>

                {/* Task Title & Short Beginner Description */}
                <div className="space-y-1.5 pt-1">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {task.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed min-h-[38px]">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Single Action Button */}
              <div className="pt-5 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleTaskClick(task)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDone
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      : 'bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white'
                  }`}
                >
                  {isDone ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Replay Task</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Task</span>
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
