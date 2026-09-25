import React from 'react';
import { Lightbulb, X, ArrowRight, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { GuidedStepItem } from '../../data/dllGuidedSolveSteps';

interface DLLGuidedSolveHeaderPanelProps {
  levelNumber: number;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: GuidedStepItem;
  stateMachineState: string;
  onNextStep: () => void;
  onStopGuided: () => void;
}

export const DLLGuidedSolveHeaderPanel: React.FC<DLLGuidedSolveHeaderPanelProps> = ({
  levelNumber,
  currentStepIndex,
  totalSteps,
  currentStep,
  stateMachineState,
  onNextStep,
  onStopGuided,
}) => {
  return (
    <div
      id="guided-solve-active-panel"
      className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-purple-500/10 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-purple-950/40 border-2 border-amber-500/40 dark:border-amber-500/30 rounded-3xl p-5 md:p-6 shadow-md transition-all animate-fade-in"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Section: Badge, Title, Step counter, Explanations */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Lightbulb className="w-3.5 h-3.5 fill-current" />
              💡 Guided Solve Mode
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-xs font-mono font-bold border border-amber-300 dark:border-amber-800">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              State: {stateMachineState}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{currentStep.display}</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.explanation}
            </p>
          </div>

          {/* Current Action Box */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-100/70 dark:bg-amber-950/50 rounded-xl border border-amber-300/80 dark:border-amber-800/80 text-xs md:text-sm text-amber-900 dark:text-amber-200 font-medium">
            <span className="font-bold shrink-0 text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Compass className="w-4 h-4" />
              Action Preview:
            </span>
            <span>{currentStep.actionPreview}</span>
          </div>
        </div>

        {/* Right Section: Explicit Action Buttons */}
        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-2.5 shrink-0">
          <button
            id="guided-next-step-btn"
            onClick={onNextStep}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>Next Step →</span>
          </button>

          <button
            id="guided-stop-btn"
            onClick={onStopGuided}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            <span>✕ Stop Guided Solve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
