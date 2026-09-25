import React from 'react';
import { Sparkles, Layers, Plus, Link as LinkIcon, Flag, Trash2, Play, CheckCircle2 } from 'lucide-react';
import { LevelConfig, TaskConfig } from '../../types/dllGameTypes';

interface TaskCardGridProps {
  levels?: LevelConfig[];
  level?: LevelConfig;
  activeLevelId: number | 'all';
  onSelectLevel: (levelId: number | 'all') => void;
  activeTaskId: string;
  onPlayTask: (taskId: string, levelId?: number) => void;
  completedTaskIds: string[];
  completedLevelNumbers?: number[];
}

export const TaskCardGrid: React.FC<TaskCardGridProps> = ({
  levels = [],
  level,
  activeLevelId,
  onSelectLevel,
  activeTaskId,
  onPlayTask,
  completedTaskIds,
  completedLevelNumbers = [],
}) => {
  const allLevels = levels.length > 0 ? levels : (level ? [level] : []);

  const currentLevel = typeof activeLevelId === 'number'
    ? (allLevels.find((l) => l.id === activeLevelId) || allLevels[0])
    : (level || allLevels[0]);

  const levelSelectors = allLevels.map((l) => ({
    id: l.id,
    label: l.code || `L${l.levelNumber.toString().padStart(2, '0')}`,
    isLocked: l.id > 1 && !completedLevelNumbers.includes(l.id - 1),
    isCompleted: completedLevelNumbers.includes(l.id),
  }));

  const renderIcon = (type: TaskConfig['iconType']) => {
    switch (type) {
      case 'plus':
        return <Plus className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'pointer':
        return <Flag className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      case 'trash':
        return <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getCodeSnippet = (task: TaskConfig): string => {
    if (task.codeSnippet) return task.codeSnippet;
    if (!task.cCode) return 'Node* newNode = (Node*)malloc(sizeof(Node));';
    const lines = task.cCode
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return lines[0] || 'Node* newNode = (Node*)malloc(sizeof(Node));';
  };

  const renderTaskCard = (task: TaskConfig, targetLevelId: number, isFirstCard: boolean) => {
    const isCompleted = completedTaskIds.includes(task.id);
    const isTargetHighlight = activeTaskId === task.id || (isFirstCard && !activeTaskId);

    return (
      <div
        key={task.id}
        id={`task-card-${task.id}`}
        className={`bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-sm dark:shadow-xl ${
          isTargetHighlight
            ? 'border-2 border-blue-500 ring-4 ring-blue-500/20 shadow-blue-500/10'
            : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div>
          {/* Top Row: Icon + Task # Badge on left, XP Badge on right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                {renderIcon(task.iconType)}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                {task.tag || `Task #${task.taskNumber}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Done</span>
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-200 dark:border-indigo-500/30">
                +{task.xpReward} XP
              </span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-4 mb-2">
            {task.title}
          </h4>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed min-h-[44px]">
            {task.description || task.objective}
          </p>

          {/* Code Snippet Box (Dark code block per prompt) */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#0B132B] dark:bg-[#070D1E] font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre border border-slate-800/90 font-medium leading-relaxed shadow-inner">
            <code>{getCodeSnippet(task)}</code>
          </div>
        </div>

        {/* Play Task Button (Vibrant Blue button matching reference) */}
        <div className="mt-5 pt-2">
          <button
            id={`btn-play-task-${task.id}`}
            onClick={() => onPlayTask(task.id, targetLevelId)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play Task</span>
          </button>
        </div>
      </div>
    );
  };

  const displayLevel = currentLevel || allLevels[0];
  const lvlCompletedCount = displayLevel ? displayLevel.tasks.filter((t) => completedTaskIds.includes(t.id)).length : 0;
  const lvlTotalTasks = displayLevel ? displayLevel.tasks.length : 4;

  return (
    <div className="w-full space-y-6">
      {/* 1. MASTER LEVEL HEADER */}
      {displayLevel && (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Blue Squircle Icon */}
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  {displayLevel.breadcrumb || `HANDS-ON POINTER MANIPULATION • LEVEL 0${displayLevel.levelNumber} OF 08`}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  {displayLevel.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-3xl">
                  {displayLevel.subtitle}
                </p>
              </div>
            </div>

            {/* Level Switcher Tabs: L01, L02, L03, L04, L05, L06, L07, L08 */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-[#090E1A] rounded-full border border-slate-200 dark:border-slate-800 self-start lg:self-auto shrink-0 flex-wrap sm:flex-nowrap">
              {levelSelectors.map((item) => {
                const isSelected = displayLevel.id === item.id;
                return (
                  <button
                    key={item.label}
                    id={`btn-level-tab-${item.id}`}
                    onClick={() => {
                      if (!item.isLocked) onSelectLevel(item.id);
                    }}
                    disabled={item.isLocked}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                      item.isLocked
                        ? 'text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 cursor-pointer'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                    }`}
                    title={item.isLocked ? `Level ${item.id} is locked. Complete Level ${item.id - 1} first.` : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Summary Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 font-bold">
                INTERACTION MODE
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {displayLevel.interactionMode || 'Manual Pointers & Memory'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 font-bold">
                TASKS IN LEVEL
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                {displayLevel.tasks.length} Hands-on Tasks
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 font-bold">
                FEEDBACK ENGINE
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {displayLevel.feedbackEngine || 'Concept & Address Validation'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 font-bold">
                TOTAL XP REWARD
              </div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                +{displayLevel.totalXp} XP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHOOSE TASK SECTION HEADER */}
      <div className="flex items-center justify-between pt-2 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Choose Task to Play
          </h3>
        </div>

        <div className="text-sm font-mono font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0F172A] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {lvlCompletedCount}/{lvlTotalTasks} Completed
        </div>
      </div>

      {/* 3. TASK CARDS GRID */}
      {displayLevel && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {displayLevel.tasks.map((task, idx) =>
            renderTaskCard(task, displayLevel.id, idx === 0)
          )}
        </div>
      )}
    </div>
  );
};
