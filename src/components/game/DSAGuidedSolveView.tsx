import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  Sparkles,
  CheckCircle2,
  Play,
  HelpCircle,
  Lightbulb,
  Info,
} from 'lucide-react';
import { DSALevelDefinition, DSAGuidedStep } from '../../data/dsaLevelsConfig';
import { soundManager } from '../../utils/audio';

interface DSAGuidedSolveViewProps {
  level: DSALevelDefinition;
  onStop: () => void;
  onPlayInteractive: () => void;
}

export const DSAGuidedSolveView: React.FC<DSAGuidedSolveViewProps> = ({
  level,
  onStop,
  onPlayInteractive,
}) => {
  // Manual Step Index: Starts strictly at Step 0 (Step 1 of total)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const totalSteps = level.guidedSteps.length;
  const currentStep: DSAGuidedStep = level.guidedSteps[currentStepIndex] || level.guidedSteps[0];
  const isFinalStep = currentStepIndex === totalSteps - 1;
  const isComplete = currentStepIndex >= totalSteps - 1;

  // CRITICAL: Next Step performs EXACTLY ONE action and stops
  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      soundManager.playClick();
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

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

  // Render Visual Demonstration based on level and current step state snapshot
  const renderVisualization = () => {
    const state = currentStep.stateSnapshot || {};

    // LEVEL 1: Data Structure Detective
    if (level.level === 1) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-2xl mx-auto">
          {/* Problem Requirement Card */}
          <div className="w-full p-4 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-md">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Scenario Requirement
            </div>
            <p className="text-base font-semibold text-slate-100">
              "{state.scenario}"
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
            {state.options.map((opt: string) => {
              const isHighlighted = state.highlightedOption === opt;
              const isSelected = state.selectedOption === opt;

              return (
                <div
                  key={opt}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all duration-300 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg scale-105 ring-2 ring-emerald-400/50'
                      : isHighlighted
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 scale-102 ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 opacity-60'
                  }`}
                >
                  <div className="text-base mb-1 font-mono">
                    {opt === 'Array' ? '📦' : opt === 'Stack' ? '🥞' : opt === 'Queue' ? '🚶' : opt === 'Linked List' ? '🔗' : '🌳'}
                  </div>
                  {opt}
                </div>
              );
            })}
          </div>

          {state.isCorrect && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              Array matches requirement: Contiguous memory + O(1) indexed access!
            </div>
          )}
        </div>
      );
    }

    // LEVEL 2: Array Builder
    if (level.level === 2) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-2xl mx-auto">
          {/* Target Requirement */}
          <div className="p-3 px-5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500 text-white">Target</span>
            Place value <strong className="text-base text-blue-800 dark:text-blue-200">40</strong> at index <strong className="text-base text-blue-800 dark:text-blue-200">2</strong>
          </div>

          {/* Staged Element */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Staged Value:</span>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl font-mono transition-all duration-300 ${
                state.highlightedElement === 40
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110 shadow-lg'
                  : state.array[2] === 40
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through opacity-50'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white'
              }`}
            >
              40
            </div>
          </div>

          {/* Array Slots Grid */}
          <div className="flex items-center gap-3 w-full justify-center">
            {state.array.map((val: number | null, idx: number) => {
              const isTargetSlot = state.highlightedSlot === idx;
              const hasPlacedValue = val !== null;

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black font-mono transition-all duration-300 border-2 ${
                      hasPlacedValue
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-105 ring-2 ring-blue-400/40'
                        : isTargetSlot
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-dashed border-blue-500 text-blue-600 dark:text-blue-300 animate-pulse'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {val !== null ? val : '—'}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // LEVEL 3: Stack Tower
    if (level.level === 3) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-md mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
            Stack Action: {state.lastAction || 'Initial State'}
          </div>

          {/* Vertical Stack Cylinder */}
          <div className="w-56 p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border-4 border-t-0 border-indigo-400 dark:border-indigo-600 flex flex-col-reverse gap-2.5 min-h-[220px] justify-start shadow-inner">
            {state.stack.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono italic my-auto">
                [ Empty Stack ]
              </div>
            ) : (
              state.stack.map((item: number, idx: number) => {
                const isTop = idx === state.stack.length - 1;
                return (
                  <div
                    key={idx}
                    className={`w-full py-3 rounded-xl font-mono font-black text-lg text-center transition-all duration-300 flex items-center justify-between px-4 ${
                      isTop
                        ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400 scale-[1.02]'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <span>{item}</span>
                    {isTop && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-800 text-indigo-200">
                        TOP
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {state.poppedValue && (
            <div className="text-xs font-mono font-bold text-rose-500 flex items-center gap-1.5">
              <span>Removed item from TOP:</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {state.poppedValue}
              </span>
            </div>
          )}
        </div>
      );
    }

    // LEVEL 4: Queue Station
    if (level.level === 4) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-lg mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold">
            Queue Action: {state.lastAction || 'Initial State'}
          </div>

          {/* Horizontal Queue Highway */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 px-2">
              <span>← FRONT (Leaves first)</span>
              <span>REAR (Joins here) →</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-2 border-dashed border-cyan-400 dark:border-cyan-600 flex items-center justify-start gap-3 min-h-[90px] overflow-x-auto">
              {state.queue.length === 0 ? (
                <div className="w-full text-center text-slate-400 text-xs font-mono italic">
                  [ Queue is Empty ]
                </div>
              ) : (
                state.queue.map((item: string, idx: number) => {
                  const isFront = idx === 0;
                  const isRear = idx === state.queue.length - 1;

                  return (
                    <div
                      key={idx}
                      className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-xl transition-all duration-300 border shrink-0 ${
                        isFront
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-md scale-105'
                          : isRear
                          ? 'bg-cyan-500 text-white border-cyan-400'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <span>{item}</span>
                      <span className="text-[9px] font-normal uppercase opacity-80">
                        {isFront ? 'Front' : isRear ? 'Rear' : `#${idx}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    }

    // LEVEL 5: Linked List Workshop
    if (level.level === 5) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-2xl mx-auto">
          {/* Chain Formula Display */}
          <div className="p-3 px-5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-mono font-bold text-sm">
            {state.chainDesc}
          </div>

          {/* Rendered Nodes Chain */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {state.nodes.map((node: any, idx: number) => (
              <div key={node.id} className="flex items-center gap-2">
                <div
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 min-w-[90px] transition-all duration-300 ${
                    state.activeHighlight === node.id || (state.activeHighlight?.includes(node.data))
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg scale-105'
                      : 'bg-white dark:bg-slate-800 border-purple-300 dark:border-purple-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider opacity-70">
                    Node {idx + 1}
                  </div>
                  <div className="text-xl font-black font-mono">
                    {node.data}
                  </div>
                  <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    next: {node.next || 'null'}
                  </div>
                </div>

                {idx < state.nodes.length - 1 ? (
                  <span className="text-purple-500 font-mono text-xl font-bold">→</span>
                ) : (
                  <span className="text-slate-400 font-mono text-sm font-bold flex items-center gap-1">
                    → <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">NULL</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // LEVEL 6: Tree Builder
    if (level.level === 6) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-4 w-full max-w-lg mx-auto">
          {/* Root Node */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-amber-600 text-white font-black font-mono text-lg flex items-center justify-center shadow-md ring-4 ring-amber-400/30">
              {state.root}
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
              ROOT (50)
            </span>
          </div>

          {/* Branches to Left & Right */}
          <div className="flex items-center justify-between w-64 text-amber-400 font-mono text-xs">
            <span>╱ (smaller)</span>
            <span>(greater) ╲</span>
          </div>

          {/* Level 1 Children */}
          <div className="flex items-center justify-between w-72">
            {/* Left Child */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full font-black font-mono text-base flex items-center justify-center transition-all ${
                  state.left
                    ? 'bg-amber-500 text-white shadow ring-2 ring-amber-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-dashed border-slate-400'
                }`}
              >
                {state.left || '?'}
              </div>
              <span className="text-[10px] font-mono text-slate-500">Left (30)</span>
            </div>

            {/* Right Child */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full font-black font-mono text-base flex items-center justify-center transition-all ${
                  state.right
                    ? 'bg-amber-500 text-white shadow ring-2 ring-amber-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-dashed border-slate-400'
                }`}
              >
                {state.right || '?'}
              </div>
              <span className="text-[10px] font-mono text-slate-500">Right (70)</span>
            </div>
          </div>

          {/* Subtree Leaves if completed */}
          {state.leftLeft && (
            <div className="flex items-center justify-between w-full pt-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">20</span>
              <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">40</span>
              <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">60</span>
              <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">80</span>
            </div>
          )}
        </div>
      );
    }

    // LEVEL 7: Sorting Race
    if (level.level === 7) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold">
            {state.lastAction}
          </div>

          {/* Array Cards Comparison Bars */}
          <div className="flex items-end justify-center gap-3 h-48 w-full px-4">
            {state.array.map((val: number, idx: number) => {
              const isComparing = state.comparingIndices?.includes(idx);
              const heightPx = val * 3; // Height proportional to value

              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 max-w-[64px]">
                  <div
                    style={{ height: `${heightPx}px` }}
                    className={`w-full rounded-2xl flex items-center justify-center font-mono font-black text-lg transition-all duration-300 shadow ${
                      state.isSorted
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                        : isComparing
                        ? 'bg-rose-500 text-white scale-105 ring-4 ring-rose-400/40 shadow-rose-500/30'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // LEVEL 8: Search Mission
    if (level.level === 8) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-2xl mx-auto">
          {/* Status Tracker */}
          <div className="flex items-center justify-between w-full text-xs font-mono bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200">
            <span>Target Value: <strong>60</strong></span>
            <span>LOW: <strong>{state.low}</strong></span>
            <span>MID: <strong>{state.mid !== null ? state.mid : '—'}</strong></span>
            <span>HIGH: <strong>{state.high}</strong></span>
          </div>

          {/* Array Grid with Pointers */}
          <div className="flex items-center gap-2 w-full justify-center flex-wrap">
            {state.array.map((val: number, idx: number) => {
              const isMid = state.mid === idx;
              const isInSearchSpace = state.searchSpace?.includes(idx);
              const isFound = state.found && val === 60;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-12 h-14 rounded-xl flex items-center justify-center font-mono font-black text-base border-2 transition-all duration-300 ${
                      isFound
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-400/40 shadow-lg scale-110'
                        : isMid
                        ? 'bg-teal-600 text-white border-teal-400 shadow-md ring-2 ring-teal-400'
                        : isInSearchSpace
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-teal-300 dark:border-teal-800'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 opacity-40'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // LEVEL 9: DSA Master Challenge
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 w-full max-w-xl mx-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full shadow-lg">
          <div className="text-xs font-mono uppercase tracking-wider text-violet-200 mb-1">
            Master Mission {state.mission || 1} of 6
          </div>
          <div className="text-lg font-black font-display">
            Topic: {state.topic}
          </div>
          <div className="text-sm text-violet-100 mt-2 font-mono flex items-center gap-2">
            <span>Optimal Action:</span>
            <span className="px-2 py-0.5 rounded bg-white/20 text-white font-bold">
              {state.answer}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id="guided-solve-container"
      className="flex flex-col gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden"
    >
      {/* 1. Header with Level Title, Step Counter, and Stop Button */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Guided Solve Mode • Level {level.level.toString().padStart(2, '0')}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {level.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Step Counter Badge */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>

          {/* Stop Guided Solve Button */}
          <button
            id="btn-stop-guided-solve"
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Stop Guided Solve</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* 3. Instruction & Explanation Panel */}
      <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-mono text-xs uppercase font-black tracking-wider">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          Step {currentStep.step}: {currentStep.instruction}
        </div>
        <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {currentStep.explanation}
        </p>
      </div>

      {/* 4. Main Interactive Visual Demonstration Stage */}
      <div className="min-h-[260px] rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center p-4">
        {renderVisualization()}
      </div>

      {/* 5. Completion Screen Overlay / Card (When final step is reached) */}
      {isComplete && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex flex-col gap-4 animate-scale-up">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            <div>
              <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                🎉 Guided Solve Complete!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                You walked through all {totalSteps} manual steps of {level.title}.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-4 border-l-2 border-emerald-400">
            <span className="font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              What was learned:
            </span>
            {level.whatWasLearned.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              id="btn-guided-return-to-level"
              onClick={onStop}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Return to Levels
            </button>
            <button
              id="btn-guided-play-interactive"
              onClick={onPlayInteractive}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Level
            </button>
          </div>
        </div>
      )}

      {/* 6. Step-by-Step Controls (CRITICAL: One Click = Exactly One Action) */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* Previous Step Button */}
          <button
            id="btn-guided-prev-step"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Restart Guide Button */}
          <button
            id="btn-guided-restart"
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>

        {/* Next Step Button (VISUALLY PROMINENT) */}
        {!isFinalStep ? (
          <button
            id="btn-guided-next-step"
            onClick={handleNextStep}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Final Step Reached
          </span>
        )}
      </div>
    </div>
  );
};
