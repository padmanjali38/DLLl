import React from 'react';
import { ArrowRight, Check, AlertCircle, Sparkles, SkipForward } from 'lucide-react';
import { ProbeStep, TechniqueType } from '../types/game';

interface ProbingControllerProps {
  technique: TechniqueType;
  currentKey: number;
  baseHash: number;
  h2Val?: number;
  currentStepIndex: number;
  allSteps: ProbeStep[];
  onNextStep: () => void;
  onAutoSolveProbe: () => void;
  onConfirmInsertion: () => void;
  isCompleted: boolean;
}

export const ProbingController: React.FC<ProbingControllerProps> = ({
  technique,
  currentKey,
  baseHash,
  h2Val = 1,
  currentStepIndex,
  allSteps,
  onNextStep,
  onAutoSolveProbe,
  onConfirmInsertion,
  isCompleted,
}) => {
  const currentStep = allSteps[currentStepIndex] || allSteps[0];
  const isFinalStep = currentStep && !currentStep.isOccupied;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] font-sans transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] dark:bg-blue-400 animate-pulse shadow-xs" />
          <h4 className="text-xs uppercase font-bold text-slate-900 dark:text-white tracking-wider">
            Collision Resolution Probing
          </h4>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-[#2563EB] dark:text-blue-300 rounded-lg shadow-2xs">
          Probe Attempt #{currentStepIndex}
        </span>
      </div>

      {/* Math Step Details */}
      <div className="space-y-4">
        <div className="bg-slate-50/80 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase font-mono tracking-wider">
            Calculation Step:
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white mt-1">
            {currentStep?.calculationStr || `Step ${currentStepIndex}`}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-200/80 dark:border-slate-800 font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Target Slot:{' '}
              <strong className="bg-[#2563EB] text-white px-2 py-0.5 rounded-md font-bold shadow-2xs">
                [{currentStep?.targetIndex < 10 ? `0${currentStep?.targetIndex}` : currentStep?.targetIndex}]
              </strong>
            </span>
            {currentStep?.isOccupied ? (
              <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Occupied (Collision)
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" /> Empty Slot Found!
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {!isFinalStep ? (
            <>
              <button
                id="btn-next-probe-step"
                onClick={onNextStep}
                className="flex-1 btn-modern-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowRight className="w-4 h-4 text-white" />
                {technique === 'linear' && 'Test Next Slot (+1)'}
                {technique === 'quadratic' && `Jump Step (+${(currentStepIndex + 1) * (currentStepIndex + 1)})`}
                {technique === 'double_hashing' && `Jump Step (+${h2Val})`}
              </button>

              <button
                id="btn-auto-probe"
                onClick={onAutoSolveProbe}
                className="btn-modern-secondary py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <SkipForward className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                Auto-Probe
              </button>
            </>
          ) : (
            <button
              id="btn-confirm-probe-placement"
              onClick={onConfirmInsertion}
              className="w-full btn-modern-primary py-3 px-5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Place Key {currentKey} in Open Slot [{currentStep.targetIndex}]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
