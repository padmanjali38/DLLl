import React from 'react';
import {
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Circle,
  ArrowRight,
  Code2,
  Zap,
  RotateCcw,
  Check,
  XCircle,
} from 'lucide-react';
import { TaskConfig, HeapNode } from '../../types/dllGameTypes';

interface TaskDetailPanelProps {
  task: TaskConfig;
  criteriaStatuses: { id: string; label: string; isMet: boolean }[];
  onCheckAnswer: () => void;
  onShowConcept: () => void;
  onShowHint: () => void;
  isTaskCompleted: boolean;
  onNextTask?: () => void;
  onBackToTasks: () => void;
  isLastTask: boolean;
  isGuidedMode?: boolean;
  onToggleGuidedMode?: () => void;
  currentGuidedStepIndex?: number;
  onExecuteGuidedNextStep?: () => void;
  selectedNode?: HeapNode | null;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  criteriaStatuses,
  onCheckAnswer,
  onShowConcept,
  onShowHint,
  isTaskCompleted,
  onNextTask,
  onBackToTasks,
  isLastTask,
  isGuidedMode = false,
  onToggleGuidedMode,
  currentGuidedStepIndex = 0,
  onExecuteGuidedNextStep,
}) => {
  const steps = task.guidedSteps || [];
  const currentStep = steps[currentGuidedStepIndex] || steps[steps.length - 1];
  const stepNumber = Math.min(currentGuidedStepIndex + 1, steps.length);

  return (
    <div
      id="task-detail-panel"
      className="w-full lg:w-[410px] shrink-0 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-2xl flex flex-col justify-between relative"
    >
      <div className="space-y-4">
        {/* 1. TOP HEADER: Badges (Task #1, +XP) + Concept / Hint */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-black">
              {task.tag || `Task #${task.taskNumber}`}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-black">
              +{task.xpReward} XP
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-task-concept"
              onClick={onShowConcept}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Concept</span>
            </button>
            <button
              id="btn-task-hint"
              onClick={onShowHint}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Hint</span>
            </button>
          </div>
        </div>

        {/* 2. TASK TITLE & INSTRUCTIONS */}
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {task.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-sans">
            {task.description || task.objective}
          </p>
        </div>

        {/* 3. TARGET VERIFICATION CHECKLIST (Prompt Specified) */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">
            TARGET VERIFICATION CHECKLIST
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800/80 space-y-2.5">
            {criteriaStatuses.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 text-xs">
                {item.isMet ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                )}
                <span
                  className={`leading-relaxed ${
                    item.isMet
                      ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 font-normal'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. GUIDED STEP-BY-STEP (Prompt Specified) */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
              <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>GUIDED STEP-BY-STEP</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase">
              {isTaskCompleted
                ? 'COMPLETED'
                : `Step ${stepNumber} of ${steps.length}`}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800/80 space-y-3">
            {currentStep && (
              <div>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">
                  Step {stepNumber}: {currentStep.instruction}
                </div>
                {currentStep.explanation && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                    {currentStep.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Guided Step Buttons: [ Perform Next Step → ] & [ Stop Guided Solve ] */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="btn-perform-next-step"
                onClick={onExecuteGuidedNextStep}
                disabled={isTaskCompleted || currentGuidedStepIndex >= steps.length}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Perform Next Step</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              {isGuidedMode && onToggleGuidedMode && (
                <button
                  id="btn-stop-guided-solve"
                  onClick={onToggleGuidedMode}
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Stop Guided Solve
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5. C / C++ POINTER EQUIVALENT (Inside Dark Code Card) */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">
            <Code2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>C / C++ POINTER EQUIVALENT</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#060B18] text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed font-medium">
            <code>{task.cCode}</code>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM ACTION BUTTONS */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2.5">
        {isTaskCompleted ? (
          onNextTask ? (
            <button
              id="btn-next-task"
              onClick={onNextTask}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>{isLastTask ? 'Proceed to Next Level' : 'Next Task'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-back-levels"
              onClick={onBackToTasks}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-black shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Level Complete! Back to Overview</span>
            </button>
          )
        ) : (
          <button
            id="btn-check-answer-panel"
            onClick={onCheckAnswer}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check Answer</span>
          </button>
        )}
      </div>
    </div>
  );
};
