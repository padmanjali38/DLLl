import React from 'react';
import { Lightbulb, CheckCircle2, ArrowRight, Sparkles, Play } from 'lucide-react';
import { TaskConfig } from '../../types/dllGameTypes';

interface TeachingAssistantBannerProps {
  task: TaskConfig;
  isTaskCompleted: boolean;
  onNextTask?: () => void;
  isLastTask?: boolean;
  totalSteps?: number;
  currentStepIndex?: number;
  onExecuteNextStep?: () => void;
  onShowHint?: () => void;
}

export const TeachingAssistantBanner: React.FC<TeachingAssistantBannerProps> = ({
  task,
  isTaskCompleted,
  onNextTask,
  isLastTask = false,
  totalSteps = 5,
  currentStepIndex = 0,
  onExecuteNextStep,
  onShowHint,
}) => {
  const stepsCount = Math.max(totalSteps || 5, 5);
  const completedSteps = isTaskCompleted ? stepsCount : Math.min(currentStepIndex, stepsCount);

  return (
    <div
      id="teaching-assistant-banner"
      className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border ${
        isTaskCompleted
          ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 shadow-sm dark:shadow-emerald-500/5'
          : 'bg-gradient-to-r from-amber-50 via-white to-indigo-50 dark:from-amber-950/30 dark:via-slate-900/90 dark:to-indigo-950/30 border-amber-300 dark:border-amber-500/30 shadow-sm dark:shadow-amber-500/5'
      }`}
    >
      {/* Giant Watermark Lightbulb Icon in background (Matching Photo) */}
      <div className="absolute -right-4 -bottom-6 pointer-events-none opacity-5 dark:opacity-10 select-none">
        <Lightbulb className="w-52 h-52 text-amber-500 dark:text-amber-400 stroke-[1]" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          {/* Header Tag: Lightbulb + TEACHING ASSISTANT */}
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                isTaskCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
            </div>
            <span
              className={`text-xs font-mono font-bold tracking-wider uppercase ${
                isTaskCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              TEACHING ASSISTANT
            </span>
          </div>

          {/* Title and Progress Dots: "Task Finished! ● ● ● ● ●" */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isTaskCompleted ? 'Task Finished!' : 'Task in Progress'}
            </h2>

            {/* Progress Pill Dots (Matching Photo) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
              {Array.from({ length: stepsCount }).map((_, i) => {
                const isFilled = i < completedSteps;
                return (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      isFilled
                        ? isTaskCompleted
                          ? 'w-4 bg-emerald-500 dark:bg-emerald-400 shadow-xs shadow-emerald-400/50'
                          : 'w-4 bg-amber-500 dark:bg-amber-400 shadow-xs shadow-amber-400/50'
                        : 'w-2 bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Subtext and Description */}
          {isTaskCompleted ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Excellent! You built the linked list correctly.</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All pointer linkages, memory addresses, and data criteria match the target specification.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>
                  Step {completedSteps + 1} of {stepsCount}: {task.title}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {task.description || 'Follow the step-by-step guide on the right or use the pointer tools below.'}
              </p>
            </div>
          )}
        </div>

        {/* Action Button: "Continue to Next Task →" (Green Button Matching Photo) */}
        <div className="shrink-0 flex items-center gap-3">
          {isTaskCompleted ? (
            <button
              id="btn-teaching-assistant-continue"
              onClick={onNextTask}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>{isLastTask ? 'Complete Arena Level' : 'Continue to Next Task'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            onExecuteNextStep && (
              <button
                id="btn-teaching-assistant-perform-step"
                onClick={onExecuteNextStep}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Perform Next Step</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
