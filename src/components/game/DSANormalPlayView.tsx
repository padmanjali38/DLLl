import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Sparkles,
  BookOpen,
  Play,
  Check,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DSALevelDefinition } from '../../data/dsaLevelsConfig';
import { soundManager } from '../../utils/audio';

interface DSANormalPlayViewProps {
  level: DSALevelDefinition;
  onBackToLevels: () => void;
  onOpenGuidedSolve: () => void;
  onLevelCompleted: (levelNumber: number, earnedXp: number) => void;
}

export const DSANormalPlayView: React.FC<DSANormalPlayViewProps> = ({
  level,
  onBackToLevels,
  onOpenGuidedSolve,
  onLevelCompleted,
}) => {
  // Feedback & Modal state
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // LEVEL 1: Scenario Matching State
  const [l1Answers, setL1Answers] = useState<Record<string, string>>({});

  // LEVEL 2: Array Builder State
  const [l2Array, setL2Array] = useState<(number | null)[]>([null, null, null, null, null]);
  const [l2SelectedValue, setL2SelectedValue] = useState<number | null>(null);

  // LEVEL 3: Stack Tower State
  const [l3Stack, setL3Stack] = useState<number[]>([]);
  const [l3PoppedHistory, setL3PoppedHistory] = useState<number[]>([]);

  // LEVEL 4: Queue Station State
  const [l4Queue, setL4Queue] = useState<string[]>([]);
  const [l4ServedHistory, setL4ServedHistory] = useState<string[]>([]);

  // LEVEL 5: Linked List Workshop State
  const [l5Connections, setL5Connections] = useState<Record<string, string>>({
    n1: '', // 10 -> ?
    n2: '', // 20 -> ?
    n3: '', // 30 -> ?
  });

  // LEVEL 6: Tree Builder State
  const [l6Tree, setL6Tree] = useState<{
    root: number | null;
    left: number | null;
    right: number | null;
    leftLeft: number | null;
    leftRight: number | null;
  }>({
    root: null,
    left: null,
    right: null,
    leftLeft: null,
    leftRight: null,
  });
  const [l6SelectedNumber, setL6SelectedNumber] = useState<number | null>(null);

  // LEVEL 7: Sorting Race State
  const [l7Array, setL7Array] = useState<number[]>([40, 10, 30, 20, 50]);
  const [l7ActiveIndex, setL7ActiveIndex] = useState<number>(0);
  const [l7SwapsCount, setL7SwapsCount] = useState<number>(0);

  // LEVEL 8: Search Mission State
  const [l8Low, setL8Low] = useState<number>(0);
  const [l8High, setL8High] = useState<number>(6);
  const [l8ProbedIndex, setL8ProbedIndex] = useState<number | null>(null);

  // LEVEL 9: DSA Master Challenge State
  const [l9Answers, setL9Answers] = useState<Record<string, string>>({});

  // Trigger feedback
  const triggerSuccess = (msg: string) => {
    soundManager.playSuccess();
    setFeedback({ message: msg, type: 'success' });
    setIsCompleted(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    onLevelCompleted(level.level, level.xp);
  };

  const triggerError = (msg: string) => {
    soundManager.playError();
    setFeedback({ message: msg, type: 'error' });
  };

  // Reset Handler
  const handleReset = () => {
    soundManager.playClick();
    setFeedback(null);
    setShowHint(false);
    setIsCompleted(false);

    if (level.level === 1) setL1Answers({});
    if (level.level === 2) {
      setL2Array([null, null, null, null, null]);
      setL2SelectedValue(null);
    }
    if (level.level === 3) {
      setL3Stack([]);
      setL3PoppedHistory([]);
    }
    if (level.level === 4) {
      setL4Queue([]);
      setL4ServedHistory([]);
    }
    if (level.level === 5) {
      setL5Connections({ n1: '', n2: '', n3: '' });
    }
    if (level.level === 6) {
      setL6Tree({ root: null, left: null, right: null, leftLeft: null, leftRight: null });
      setL6SelectedNumber(null);
    }
    if (level.level === 7) {
      setL7Array([40, 10, 30, 20, 50]);
      setL7ActiveIndex(0);
      setL7SwapsCount(0);
    }
    if (level.level === 8) {
      setL8Low(0);
      setL8High(6);
      setL8ProbedIndex(null);
    }
    if (level.level === 9) setL9Answers({});
  };

  // LEVEL 1: Check detective matching
  const handleCheckLevel1 = () => {
    soundManager.playClick();
    const s1 = l1Answers['s1'] === 'Stack';
    const s2 = l1Answers['s2'] === 'Queue';
    const s3 = l1Answers['s3'] === 'Array';

    if (s1 && s2 && s3) {
      triggerSuccess('Excellent! All 3 scenarios matched with their optimal data structures!');
    } else {
      triggerError('Not quite. Try again. Think about LIFO vs FIFO vs indexed lookup!');
    }
  };

  // LEVEL 2: Check array builder
  const handleCheckLevel2 = () => {
    soundManager.playClick();
    // Requirements: 10 at index 0, 40 at index 2, 50 at index 4
    if (l2Array[0] === 10 && l2Array[2] === 40 && l2Array[4] === 50) {
      triggerSuccess('Excellent! 10 placed at index 0, 40 at index 2, and 50 at index 4 perfectly!');
    } else {
      triggerError('Not quite. Make sure slot 0 has 10, slot 2 has 40, and slot 4 has 50.');
    }
  };

  // LEVEL 3: Check Stack Tower
  const handleCheckLevel3 = () => {
    soundManager.playClick();
    // Objective: stack has [10, 20] and 30 was pushed then popped
    if (l3Stack.length === 2 && l3Stack[0] === 10 && l3Stack[1] === 20 && l3PoppedHistory.includes(30)) {
      triggerSuccess('Excellent! Stack operated with PUSH 10, 20, 30 and POP 30! TOP is 20.');
    } else if (l3Stack.length === 2 && l3Stack[0] === 10 && l3Stack[1] === 20) {
      triggerSuccess('Excellent! Stack tower holds [10, 20] with TOP = 20!');
    } else {
      triggerError('Not quite. Target stack must be [10, 20] with TOP = 20.');
    }
  };

  // LEVEL 4: Check Queue Station
  const handleCheckLevel4 = () => {
    soundManager.playClick();
    // Target queue: [B, C], Passenger A was served
    if (l4Queue.length === 2 && l4Queue[0] === 'B' && l4Queue[1] === 'C') {
      triggerSuccess('Excellent! Queue FIFO order verified! A was served first, leaving [B, C].');
    } else {
      triggerError('Not quite. ENQUEUE A, B, C and then DEQUEUE A to leave [B, C].');
    }
  };

  // LEVEL 5: Check Linked List Workshop
  const handleCheckLevel5 = () => {
    soundManager.playClick();
    if (l5Connections.n1 === 'n2' && l5Connections.n2 === 'n3' && l5Connections.n3 === 'NULL') {
      triggerSuccess('Excellent! Linked List chain 10 → 20 → 30 → NULL verified!');
    } else {
      triggerError('Not quite. Wire node 10 → 20, node 20 → 30, and node 30 → NULL.');
    }
  };

  // LEVEL 6: Check Tree Builder
  const handleCheckLevel6 = () => {
    soundManager.playClick();
    if (
      l6Tree.root === 50 &&
      l6Tree.left === 30 &&
      l6Tree.right === 70 &&
      l6Tree.leftLeft === 20 &&
      l6Tree.leftRight === 40
    ) {
      triggerSuccess('Excellent! Binary Search Tree hierarchy verified: left < parent < right!');
    } else {
      triggerError('Not quite. Root = 50, Left = 30, Right = 70, Left-Child of 30 = 20, Right-Child of 30 = 40.');
    }
  };

  // LEVEL 7: Check Sorting Race
  const handleCheckLevel7 = () => {
    soundManager.playClick();
    const isSorted = l7Array.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
    if (isSorted) {
      triggerSuccess(`Excellent! Array is sorted: [${l7Array.join(', ')}] in ${l7SwapsCount} swaps!`);
    } else {
      triggerError('Not quite sorted yet! Continue comparing and swapping out-of-order pairs.');
    }
  };

  // LEVEL 8: Check Search Mission
  const handleCheckLevel8 = () => {
    soundManager.playClick();
    if (l8ProbedIndex === 5) {
      triggerSuccess('Excellent! Target 60 identified at index 5 in O(log N) steps!');
    } else {
      triggerError('Not quite. Target 60 is located at index 5.');
    }
  };

  // LEVEL 9: Check Master Challenge
  const handleCheckLevel9 = () => {
    soundManager.playClick();
    const q1 = l9Answers['m1'] === 'Queue (FIFO)';
    const q2 = l9Answers['m2'] === 'O(log N)';
    const q3 = l9Answers['m3'] === 'Left subtree';
    const q4 = l9Answers['m4'] === 'Doubly Linked List';

    if (q1 && q2 && q3 && q4) {
      triggerSuccess('🏆 DSA MASTER ACHIEVEMENT UNLOCKED! Perfect score across all data structures!');
    } else {
      triggerError('Not quite 100%. Review your answers for Queue FIFO, Binary Search complexity, and BST!');
    }
  };

  return (
    <div
      id="normal-play-view-container"
      className="flex flex-col gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden"
    >
      {/* 1. Header with Breadcrumb, Level Info, and Action Icons */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-levels"
            onClick={onBackToLevels}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Levels"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                LEVEL {level.level.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">{level.progressType}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {level.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Hint Button */}
          <button
            id="btn-level-hint"
            onClick={() => setShowHint((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Hint</span>
          </button>

          {/* Reset Button */}
          <button
            id="btn-level-reset"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {/* Guided Solve Learning Aid Shortcut */}
          <button
            id="btn-switch-to-guided"
            onClick={onOpenGuidedSolve}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Guided Solve</span>
          </button>
        </div>
      </div>

      {/* 2. Task Prompt & Objective Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-1.5">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Mission Objective:
        </div>
        <div className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
          {level.normalTask.prompt}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {level.normalTask.objective}
        </div>
      </div>

      {/* Optional Hint Dropdown */}
      {showHint && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs md:text-sm font-medium flex items-start gap-2.5 animate-slide-down">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <span>{level.normalTask.hint}</span>
        </div>
      )}

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          {isCompleted && (
            <button
              onClick={onBackToLevels}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
            >
              Continue →
            </button>
          )}
        </div>
      )}

      {/* 3. LEVEL-SPECIFIC INTERACTIVE WORKSPACE */}
      <div className="min-h-[300px] rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col items-center justify-center">
        {/* LEVEL 1: Scenario Matcher */}
        {level.level === 1 && (
          <div className="flex flex-col gap-5 w-full max-w-2xl">
            {level.normalTask.initialData.scenarios.map((sc: any) => (
              <div
                key={sc.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-3 shadow-sm"
              >
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {sc.question}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {sc.options.map((opt: string) => {
                    const isSelected = l1Answers[sc.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setL1Answers((prev) => ({ ...prev, [sc.id]: opt }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEVEL 2: Array Builder */}
        {level.level === 2 && (
          <div className="flex flex-col items-center gap-8 w-full max-w-xl">
            {/* Available value cards */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500">Pick Value:</span>
              {level.normalTask.initialData.availableValues.map((v: number) => {
                const isSelected = l2SelectedValue === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setL2SelectedValue(v);
                    }}
                    className={`w-12 h-12 rounded-xl font-mono font-black text-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400 scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>

            {/* Target 5-Slot Array */}
            <div className="flex items-center gap-3 w-full justify-center">
              {l2Array.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (l2SelectedValue !== null) {
                        soundManager.playClick();
                        setL2Array((prev) => {
                          const next = [...prev];
                          next[idx] = l2SelectedValue;
                          return next;
                        });
                      }
                    }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black font-mono border-2 transition-all ${
                      val !== null
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-white dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-700 text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {val !== null ? val : '—'}
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-400">[{idx}]</span>
                  {val !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setL2Array((prev) => {
                          const next = [...prev];
                          next[idx] = null;
                          return next;
                        });
                      }}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      clear
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEVEL 3: Stack Tower */}
        {level.level === 3 && (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {[10, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setL3Stack((prev) => [...prev, num]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs shadow-sm transition-all"
                >
                  PUSH {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (l3Stack.length > 0) {
                    soundManager.playClick();
                    const popped = l3Stack[l3Stack.length - 1];
                    setL3Stack((prev) => prev.slice(0, -1));
                    setL3PoppedHistory((prev) => [...prev, popped]);
                  }
                }}
                disabled={l3Stack.length === 0}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-mono font-bold text-xs shadow-sm transition-all"
              >
                POP
              </button>
            </div>

            {/* Stack Cylinder */}
            <div className="w-48 p-4 rounded-2xl bg-white dark:bg-slate-800 border-4 border-t-0 border-indigo-400 dark:border-indigo-600 flex flex-col-reverse gap-2 min-h-[180px] shadow-inner">
              {l3Stack.length === 0 ? (
                <div className="text-center text-xs text-slate-400 italic font-mono my-auto">
                  [ Empty Stack ]
                </div>
              ) : (
                l3Stack.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-mono font-bold text-center flex items-center justify-between px-3"
                  >
                    <span>{item}</span>
                    {idx === l3Stack.length - 1 && (
                      <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1 rounded uppercase">TOP</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* LEVEL 4: Queue Station */}
        {level.level === 4 && (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg">
            {/* Queue Controls */}
            <div className="flex items-center gap-3">
              {['A', 'B', 'C'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setL4Queue((prev) => [...prev, c]);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-mono font-bold text-xs shadow-sm"
                >
                  ENQUEUE {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (l4Queue.length > 0) {
                    soundManager.playClick();
                    const served = l4Queue[0];
                    setL4Queue((prev) => prev.slice(1));
                    setL4ServedHistory((prev) => [...prev, served]);
                  }
                }}
                disabled={l4Queue.length === 0}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-mono font-bold text-xs shadow-sm"
              >
                DEQUEUE
              </button>
            </div>

            {/* Queue Track */}
            <div className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-cyan-400 flex items-center gap-3 min-h-[90px] overflow-x-auto">
              {l4Queue.length === 0 ? (
                <div className="w-full text-center text-xs text-slate-400 font-mono italic">
                  [ Queue is Empty ]
                </div>
              ) : (
                l4Queue.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 rounded-xl bg-cyan-600 text-white font-mono font-bold text-lg flex flex-col items-center justify-center shrink-0"
                  >
                    <span>{item}</span>
                    <span className="text-[9px] opacity-75">{idx === 0 ? 'FRONT' : 'REAR'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* LEVEL 5: Linked List Workshop */}
        {level.level === 5 && (
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {[
                { id: 'n1', val: 10, label: 'Node 1' },
                { id: 'n2', val: 20, label: 'Node 2' },
                { id: 'n3', val: 30, label: 'Node 3' },
              ].map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-purple-800 flex flex-col items-center gap-2 min-w-[120px]"
                >
                  <span className="text-[10px] font-mono uppercase text-slate-400">{n.label}</span>
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{n.val}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-slate-500">next:</span>
                    <select
                      value={l5Connections[n.id] || ''}
                      onChange={(e) => {
                        soundManager.playClick();
                        setL5Connections((prev) => ({ ...prev, [n.id]: e.target.value }));
                      }}
                      className="text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1"
                    >
                      <option value="">(none)</option>
                      <option value="n2">Node 2 (20)</option>
                      <option value="n3">Node 3 (30)</option>
                      <option value="NULL">NULL</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEVEL 6: Tree Builder */}
        {level.level === 6 && (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg">
            {/* Number Selector */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs font-mono font-bold text-slate-500">Pick Number:</span>
              {level.normalTask.initialData.availableValues.map((num: number) => {
                const isSelected = l6SelectedNumber === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setL6SelectedNumber(num);
                    }}
                    className={`w-10 h-10 rounded-xl font-mono font-black text-sm border ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-400'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Interactive Tree Drop Slots */}
            <div className="flex flex-col items-center gap-3">
              {/* Root */}
              <button
                type="button"
                onClick={() => {
                  if (l6SelectedNumber) {
                    soundManager.playClick();
                    setL6Tree((prev) => ({ ...prev, root: l6SelectedNumber }));
                  }
                }}
                className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-mono font-bold text-lg flex items-center justify-center"
              >
                {l6Tree.root !== null ? l6Tree.root : 'Root'}
              </button>

              <div className="flex items-center justify-between w-64 text-xs font-mono text-amber-500">
                <span>Left &lt; Root</span>
                <span>Right &gt; Root</span>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between w-64">
                <button
                  type="button"
                  onClick={() => {
                    if (l6SelectedNumber) {
                      soundManager.playClick();
                      setL6Tree((prev) => ({ ...prev, left: l6SelectedNumber }));
                    }
                  }}
                  className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 font-mono font-bold text-base flex items-center justify-center"
                >
                  {l6Tree.left !== null ? l6Tree.left : 'Left'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (l6SelectedNumber) {
                      soundManager.playClick();
                      setL6Tree((prev) => ({ ...prev, right: l6SelectedNumber }));
                    }
                  }}
                  className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 font-mono font-bold text-base flex items-center justify-center"
                >
                  {l6Tree.right !== null ? l6Tree.right : 'Right'}
                </button>
              </div>

              {/* Sub-children under Left */}
              <div className="flex items-center justify-start gap-6 w-64 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (l6SelectedNumber) {
                      soundManager.playClick();
                      setL6Tree((prev) => ({ ...prev, leftLeft: l6SelectedNumber }));
                    }
                  }}
                  className="w-10 h-10 rounded-full border border-dashed border-amber-400 text-xs font-mono font-bold flex items-center justify-center bg-white dark:bg-slate-800"
                >
                  {l6Tree.leftLeft !== null ? l6Tree.leftLeft : 'L-L'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (l6SelectedNumber) {
                      soundManager.playClick();
                      setL6Tree((prev) => ({ ...prev, leftRight: l6SelectedNumber }));
                    }
                  }}
                  className="w-10 h-10 rounded-full border border-dashed border-amber-400 text-xs font-mono font-bold flex items-center justify-center bg-white dark:bg-slate-800"
                >
                  {l6Tree.leftRight !== null ? l6Tree.leftRight : 'L-R'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 7: Sorting Race */}
        {level.level === 7 && (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">
                Comparing index: <strong>{l7ActiveIndex}</strong> & <strong>{l7ActiveIndex + 1}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  // Swap elements at active index and active index + 1
                  setL7Array((prev) => {
                    const next = [...prev];
                    const temp = next[l7ActiveIndex];
                    next[l7ActiveIndex] = next[l7ActiveIndex + 1];
                    next[l7ActiveIndex + 1] = temp;
                    return next;
                  });
                  setL7SwapsCount((prev) => prev + 1);
                }}
                disabled={l7ActiveIndex >= l7Array.length - 1}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs shadow-sm"
              >
                SWAP Pair
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setL7ActiveIndex((prev) => (prev + 1) % (l7Array.length - 1));
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Next Pair →
              </button>
            </div>

            {/* Array Bars */}
            <div className="flex items-end justify-center gap-3 h-40 w-full">
              {l7Array.map((val, idx) => {
                const isActive = idx === l7ActiveIndex || idx === l7ActiveIndex + 1;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[50px]">
                    <div
                      style={{ height: `${val * 2.5}px` }}
                      className={`w-full rounded-xl flex items-center justify-center font-mono font-black text-sm transition-all ${
                        isActive
                          ? 'bg-rose-500 text-white ring-2 ring-rose-400'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
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
        )}

        {/* LEVEL 8: Search Mission */}
        {level.level === 8 && (
          <div className="flex flex-col items-center gap-6 w-full max-w-xl">
            <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
              Click the array cell matching Target (60) using Binary Search:
            </div>

            <div className="flex items-center gap-2 w-full justify-center flex-wrap">
              {level.normalTask.initialData.array.map((val: number, idx: number) => {
                const isProbed = l8ProbedIndex === idx;
                const isTarget = val === 60;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setL8ProbedIndex(idx);
                    }}
                    className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-black text-base border-2 transition-all ${
                      isProbed && isTarget
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400'
                        : isProbed
                        ? 'bg-teal-600 text-white border-teal-400 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    <span>{val}</span>
                    <span className="text-[9px] opacity-70">[{idx}]</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LEVEL 9: DSA Master Challenge */}
        {level.level === 9 && (
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            {level.normalTask.initialData.questions.map((q: any) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2.5 shadow-sm"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {q.q}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {q.options.map((opt: string) => {
                    const isSelected = l9Answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setL9Answers((prev) => ({ ...prev, [q.id]: opt }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Action Button Bar */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          id="btn-level-back"
          onClick={onBackToLevels}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Back to Levels
        </button>

        {/* Submit / Check Answer Button */}
        <button
          id="btn-check-answer"
          onClick={() => {
            if (level.level === 1) handleCheckLevel1();
            if (level.level === 2) handleCheckLevel2();
            if (level.level === 3) handleCheckLevel3();
            if (level.level === 4) handleCheckLevel4();
            if (level.level === 5) handleCheckLevel5();
            if (level.level === 6) handleCheckLevel6();
            if (level.level === 7) handleCheckLevel7();
            if (level.level === 8) handleCheckLevel8();
            if (level.level === 9) handleCheckLevel9();
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Check Answer</span>
        </button>
      </div>
    </div>
  );
};
