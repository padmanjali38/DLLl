import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  Sparkles,
  CheckCircle2,
  Play,
  Lightbulb,
  Info,
  Check,
} from 'lucide-react';
import { DLLLevelConfig, DLLGuidedStepDef } from '../../data/dllGameLevelsConfig';
import { DLLNodeVisualizer, VisualDLLNode } from './DLLNodeVisualizer';
import { soundManager } from '../../utils/audio';

interface DLLGuidedSolvePanelProps {
  level: DLLLevelConfig;
  onStop: () => void;
  onPlayInteractive: () => void;
}

export const DLLGuidedSolvePanel: React.FC<DLLGuidedSolvePanelProps> = ({
  level,
  onStop,
  onPlayInteractive,
}) => {
  // CRITICAL RULE: Starts strictly at Step 0.
  // One click on Next Step = exactly one guided action.
  // Never auto-advance!
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const totalSteps = level.guidedSteps.length;
  const currentStep: DLLGuidedStepDef = level.guidedSteps[currentStepIndex] || level.guidedSteps[0];
  const isFinalStep = currentStepIndex === totalSteps - 1;

  // Single step forward
  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      soundManager.playClick();
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Single step back
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      soundManager.playClick();
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    soundManager.playClick();
    setCurrentStepIndex(0);
  };

  // Compute live visual nodes based on level and currentStepIndex
  const getVisualNodesForStep = (): {
    nodes: VisualDLLNode[];
    highlightedPointer: string | null;
    activeNodeId: string | null;
  } => {
    // Level 1: What is a DLL? (Connecting 10, 20, 30)
    if (level.level === 1) {
      const step = currentStepIndex; // 0, 1, 2, 3
      const nodes: VisualDLLNode[] = [
        {
          id: '10',
          data: 10,
          prevVal: step >= 0 ? null : undefined,
          nextVal: step >= 1 ? '20' : undefined,
          isHead: true,
          highlight: step === 0 || step === 1,
        },
        {
          id: '20',
          data: 20,
          prevVal: step >= 1 ? '10' : undefined,
          nextVal: step >= 2 ? '30' : undefined,
          highlight: step === 1 || step === 2,
        },
        {
          id: '30',
          data: 30,
          prevVal: step >= 2 ? '20' : undefined,
          nextVal: step >= 3 ? null : undefined,
          isTail: true,
          highlight: step === 2 || step === 3,
        },
      ];
      const highlightedPointer =
        step === 0 ? '10.prev' : step === 1 ? '10.next' : step === 2 ? '20.next' : '30.next';
      return { nodes, highlightedPointer, activeNodeId: step === 0 ? '10' : step <= 2 ? '20' : '30' };
    }

    // Level 2: Node Memory Structure
    if (level.level === 2) {
      const step = currentStepIndex;
      const nodes: VisualDLLNode[] = [
        {
          id: 'demo',
          data: 25,
          prevVal: step >= 0 ? '0x1A4' : undefined,
          nextVal: step >= 2 ? '0x2B8' : undefined,
          highlight: true,
        },
      ];
      const highlightedPointer = step === 0 ? 'demo.prev' : step === 2 ? 'demo.next' : null;
      return { nodes, highlightedPointer, activeNodeId: 'demo' };
    }

    // Level 3: HEAD, TAIL and NULL
    if (level.level === 3) {
      const step = currentStepIndex;
      const nodes: VisualDLLNode[] = [
        { id: '10', data: 10, prevVal: step >= 1 ? null : '10', nextVal: '20', isHead: step >= 0, highlight: step <= 1 },
        { id: '20', data: 20, prevVal: '10', nextVal: '30' },
        { id: '30', data: 30, prevVal: '20', nextVal: '40' },
        { id: '40', data: 40, prevVal: '30', nextVal: step >= 3 ? null : '40', isTail: step >= 2, highlight: step >= 2 },
      ];
      const highlightedPointer = step === 1 ? '10.prev' : step === 3 ? '40.next' : null;
      return { nodes, highlightedPointer, activeNodeId: step <= 1 ? '10' : '40' };
    }

    // Level 4: Bi-directional Traversal
    if (level.level === 4) {
      const step = currentStepIndex; // 0: at 40, 1: at 30, 2: at 20, 3: at 10
      const activeId = step === 0 ? '40' : step === 1 ? '30' : step === 2 ? '20' : '10';
      const nodes: VisualDLLNode[] = [
        { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true, highlight: activeId === '10' },
        { id: '20', data: 20, prevVal: '10', nextVal: '30', highlight: activeId === '20' },
        { id: '30', data: 30, prevVal: '20', nextVal: '40', highlight: activeId === '30' },
        { id: '40', data: 40, prevVal: '30', nextVal: null, isTail: true, highlight: activeId === '40' },
      ];
      const highlightedPointer = `${activeId}.prev`;
      return { nodes, highlightedPointer, activeNodeId: activeId };
    }

    // Level 5: Insert at Head (5 before 10, 20, 30)
    if (level.level === 5) {
      const step = currentStepIndex;
      const nodes: VisualDLLNode[] =
        step === 0
          ? [
              { id: '5', data: 5, prevVal: undefined, nextVal: undefined, isNew: true, highlight: true },
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: null, isTail: true },
            ]
          : step === 1
          ? [
              { id: '5', data: 5, prevVal: undefined, nextVal: '10', highlight: true },
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: null, isTail: true },
            ]
          : step === 2
          ? [
              { id: '5', data: 5, prevVal: undefined, nextVal: '10' },
              { id: '10', data: 10, prevVal: '5', nextVal: '20', isHead: true, highlight: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: null, isTail: true },
            ]
          : [
              { id: '5', data: 5, prevVal: null, nextVal: '10', isHead: true, highlight: true },
              { id: '10', data: 10, prevVal: '5', nextVal: '20' },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: null, isTail: true },
            ];
      const highlightedPointer =
        step === 1 ? '5.next' : step === 2 ? '10.prev' : step === 3 ? '5.prev' : null;
      return { nodes, highlightedPointer, activeNodeId: step >= 2 ? (step === 2 ? '10' : '5') : '5' };
    }

    // Level 6: Insert at Tail (40 after 10, 20, 30)
    if (level.level === 6) {
      const step = currentStepIndex;
      const nodes: VisualDLLNode[] =
        step === 0
          ? [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: null, isTail: true },
              { id: '40', data: 40, prevVal: undefined, nextVal: undefined, isNew: true, highlight: true },
            ]
          : step === 1
          ? [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: '40', highlight: true },
              { id: '40', data: 40, prevVal: undefined, nextVal: undefined },
            ]
          : step === 2
          ? [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: '40' },
              { id: '40', data: 40, prevVal: '30', nextVal: undefined, highlight: true },
            ]
          : [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: '40' },
              { id: '40', data: 40, prevVal: '30', nextVal: null, isTail: true, highlight: true },
            ];
      const highlightedPointer =
        step === 1 ? '30.next' : step === 2 ? '40.prev' : step === 3 ? '40.next' : null;
      return { nodes, highlightedPointer, activeNodeId: step === 1 ? '30' : '40' };
    }

    // Level 7: Insert at Position (30 between 20 and 40)
    if (level.level === 7) {
      const step = currentStepIndex;
      const nodes: VisualDLLNode[] =
        step === 0
          ? [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '40' },
              { id: '30', data: 30, prevVal: '20', nextVal: '40', isNew: true, highlight: true },
              { id: '40', data: 40, prevVal: '20', nextVal: '50' },
              { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
            ]
          : step === 1
          ? [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '40' },
              { id: '30', data: 30, prevVal: '20', nextVal: '40', highlight: true },
              { id: '40', data: 40, prevVal: '20', nextVal: '50' },
              { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
            ]
          : step === 2
          ? [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30', highlight: true },
              { id: '30', data: 30, prevVal: '20', nextVal: '40' },
              { id: '40', data: 40, prevVal: '20', nextVal: '50' },
              { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
            ]
          : [
              { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
              { id: '20', data: 20, prevVal: '10', nextVal: '30' },
              { id: '30', data: 30, prevVal: '20', nextVal: '40' },
              { id: '40', data: 40, prevVal: '30', nextVal: '50', highlight: true },
              { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
            ];
      const highlightedPointer =
        step === 0 ? '30.next' : step === 1 ? '30.prev' : step === 2 ? '20.next' : '40.prev';
      return { nodes, highlightedPointer, activeNodeId: step === 2 ? '20' : step === 3 ? '40' : '30' };
    }

    // Level 8: Delete Head and Tail
    if (level.level === 8) {
      const step = currentStepIndex;
      let nodes: VisualDLLNode[] = [];
      if (step === 0) {
        nodes = [
          { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: false, isFading: true },
          { id: '20', data: 20, prevVal: '10', nextVal: '30', isHead: true, highlight: true },
          { id: '30', data: 30, prevVal: '20', nextVal: '40' },
          { id: '40', data: 40, prevVal: '30', nextVal: null, isTail: true },
        ];
      } else if (step === 1) {
        nodes = [
          { id: '20', data: 20, prevVal: null, nextVal: '30', isHead: true, highlight: true },
          { id: '30', data: 30, prevVal: '20', nextVal: '40' },
          { id: '40', data: 40, prevVal: '30', nextVal: null, isTail: true },
        ];
      } else if (step === 2) {
        nodes = [
          { id: '20', data: 20, prevVal: null, nextVal: '30', isHead: true },
          { id: '30', data: 30, prevVal: '20', nextVal: '40', isTail: true, highlight: true },
          { id: '40', data: 40, prevVal: '30', nextVal: null, isTail: false, isFading: true },
        ];
      } else {
        nodes = [
          { id: '20', data: 20, prevVal: null, nextVal: '30', isHead: true },
          { id: '30', data: 30, prevVal: '20', nextVal: null, isTail: true, highlight: true },
        ];
      }
      const highlightedPointer =
        step === 0 ? 'HEAD' : step === 1 ? '20.prev' : step === 2 ? 'TAIL' : '30.next';
      return { nodes, highlightedPointer, activeNodeId: step <= 1 ? '20' : '30' };
    }

    // Level 9: Delete Middle Node (30 from 10 ⇄ 20 ⇄ 30 ⇄ 40 ⇄ 50)
    if (level.level === 9) {
      const step = currentStepIndex;
      let nodes: VisualDLLNode[] = [];
      if (step === 0) {
        nodes = [
          { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
          { id: '20', data: 20, prevVal: '10', nextVal: '30' },
          { id: '30', data: 30, prevVal: '20', nextVal: '40', highlight: true },
          { id: '40', data: 40, prevVal: '30', nextVal: '50' },
          { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
        ];
      } else if (step === 1) {
        nodes = [
          { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
          { id: '20', data: 20, prevVal: '10', nextVal: '40', highlight: true },
          { id: '30', data: 30, prevVal: '20', nextVal: '40', isFading: true },
          { id: '40', data: 40, prevVal: '30', nextVal: '50' },
          { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
        ];
      } else if (step === 2) {
        nodes = [
          { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
          { id: '20', data: 20, prevVal: '10', nextVal: '40' },
          { id: '30', data: 30, prevVal: '20', nextVal: '40', isFading: true },
          { id: '40', data: 40, prevVal: '20', nextVal: '50', highlight: true },
          { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
        ];
      } else {
        nodes = [
          { id: '10', data: 10, prevVal: null, nextVal: '20', isHead: true },
          { id: '20', data: 20, prevVal: '10', nextVal: '40' },
          { id: '40', data: 40, prevVal: '20', nextVal: '50' },
          { id: '50', data: 50, prevVal: '40', nextVal: null, isTail: true },
        ];
      }
      const highlightedPointer =
        step === 1 ? '20.next' : step === 2 ? '40.prev' : null;
      return { nodes, highlightedPointer, activeNodeId: step === 1 ? '20' : step === 2 ? '40' : '30' };
    }

    return { nodes: [], highlightedPointer: null, activeNodeId: null };
  };

  const visualState = getVisualNodesForStep();

  return (
    <div id="dll-guided-solve-view" className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Guided Solve Mode
            </span>
            <span className="text-xs font-mono text-slate-400">
              Task #{level.level} of 9
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {level.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manual step-by-step walkthrough. Click <strong>Next Step</strong> to perform each single action.
          </p>
        </div>

        {/* Top Actions: Stop Guided Solve or Try Interactive */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onPlayInteractive}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Try It Yourself
          </button>

          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <X className="w-4 h-4" />
            Exit Guide
          </button>
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="bg-white dark:bg-slate-900 p-4 px-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>Step {currentStepIndex + 1} of {totalSteps}</span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-600 dark:text-indigo-400">{currentStep.title}</span>
          </span>
          <span className="text-slate-400">
            {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
          </span>
        </div>

        {/* Step dots / bar */}
        <div className="grid grid-cols-4 gap-2">
          {level.guidedSteps.map((s, idx) => (
            <div
              key={s.step}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'bg-indigo-600 ring-2 ring-indigo-400/30'
                  : idx < currentStepIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Interactive Visual Stage */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px] shadow-sm relative overflow-hidden">
        <div className="absolute top-4 left-6 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          Live Doubly Linked List State
        </div>

        <DLLNodeVisualizer
          nodes={visualState.nodes}
          highlightedPointer={visualState.highlightedPointer}
          activeNodeId={visualState.activeNodeId}
        />

        {/* Action Taken Badge */}
        <div className="mt-4 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">Action:</span>
          <code className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            {currentStep.action}
          </code>
        </div>
      </div>

      {/* Explanation & Manual Step Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        {/* Step Explanation Text */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold flex items-center justify-center">
              {currentStepIndex + 1}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {currentStep.instruction}
            </h4>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
            {currentStep.explanation}
          </p>

          {currentStep.pointerChanges && currentStep.pointerChanges.length > 0 && (
            <div className="pl-8 pt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Updates:</span>
              {currentStep.pointerChanges.map((ptr, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60"
                >
                  {ptr}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Controller Buttons: One Step Forward, Previous, or Restart */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {currentStepIndex > 0 && (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          )}

          {!isFinalStep ? (
            <button
              id="btn-guided-next-step"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Guide
              </button>

              <button
                onClick={onPlayInteractive}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                Play Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
