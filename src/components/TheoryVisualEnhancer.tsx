import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Sparkles,
  Link as LinkIcon,
  Check,
  Zap,
  Activity,
  Cpu,
  Database,
  Layers,
  RotateCcw,
  Play,
  Server,
  Globe,
  CornerDownRight,
} from 'lucide-react';

interface TheoryVisualEnhancerProps {
  chapterId: string;
}

export const TheoryVisualEnhancer: React.FC<TheoryVisualEnhancerProps> = ({ chapterId }) => {
  // Step tracker for interactive insertion & deletion diagrams
  const [insertStep, setInsertStep] = useState<number>(0);
  const [middleInsertStep, setMiddleInsertStep] = useState<number>(0);
  const [deleteStep, setDeleteStep] = useState<number>(0);

  // Normalize chapter IDs
  const isCh01 = chapterId === 'theory-01' || chapterId === 'what-is-dll' || chapterId === 'what-is-hashing';
  const isCh02 = chapterId === 'theory-02' || chapterId === 'node-structure' || chapterId === 'hash-function';
  const isCh03 = chapterId === 'theory-03' || chapterId === 'head-tail-pointers' || chapterId === 'hash-table';
  const isCh04 = chapterId === 'theory-04' || chapterId === 'bidirectional-traversal' || chapterId === 'hashing-lifecycle';
  const isCh05 = chapterId === 'theory-05' || chapterId === 'insert-head' || chapterId === 'what-is-a-collision';
  const isCh06 = chapterId === 'theory-06' || chapterId === 'insert-tail' || chapterId === 'separate-chaining';
  const isCh07 = chapterId === 'theory-07' || chapterId === 'insert-position' || chapterId === 'linear-probing';
  const isCh08 = chapterId === 'theory-08' || chapterId === 'delete-head-tail' || chapterId === 'quadratic-probing' || chapterId === 'load-factor';
  const isCh09 = chapterId === 'theory-09' || chapterId === 'delete-node' || chapterId === 'double-hashing';
  const isCh10 = chapterId === 'theory-10' || chapterId === 'real-world-applications';
  const isCh11 = chapterId === 'theory-11' || chapterId === 'core-advantages';
  const isCh12 = chapterId === 'theory-12' || chapterId === 'limitations-tradeoffs';

  // =========================================================================
  // CHAPTER 01: WHAT IS A DOUBLY LINKED LIST?
  // =========================================================================
  if (isCh01) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-4 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture Diagram // Doubly Linked Node Anatomy</span>
          </div>

          {/* Node Anatomy Card */}
          <div className="max-w-xl mx-auto p-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="text-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mb-2">
              Single Node Memory Anatomy (3 Component Fields)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                <span className="text-[10px] font-bold font-mono text-amber-700 dark:text-amber-400 block uppercase">1. PREV*</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">Pointer to Predecessor</span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-500 dark:border-blue-400 rounded-xl">
                <span className="text-[10px] font-bold font-mono text-[#2563EB] dark:text-blue-300 block uppercase">2. DATA</span>
                <span className="text-sm font-black text-blue-900 dark:text-white font-mono">Payload (Value)</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl">
                <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400 block uppercase">3. NEXT*</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">Pointer to Successor</span>
              </div>
            </div>
          </div>

          {/* 3 Connected Nodes Visual Representation */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block font-mono">
              Bi-directional Chain Representation:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 py-3 overflow-x-auto">
              <span className="text-xs font-mono text-rose-500 font-bold px-2 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-500/30">
                null
              </span>
              <span className="text-xs text-slate-400 font-bold">←</span>

              {/* Node 1 */}
              <div className="p-3 bg-white dark:bg-[#0B1120] border-2 border-blue-400 dark:border-blue-500 rounded-xl text-center shadow-xs">
                <div className="text-[10px] font-bold text-[#2563EB] dark:text-blue-300 font-mono">HEAD (0x100)</div>
                <div className="text-base font-black font-mono mt-0.5">10</div>
              </div>

              <div className="flex flex-col items-center justify-center text-[#2563EB] dark:text-blue-400 font-mono text-xs font-bold px-1">
                <span>→</span>
                <span>←</span>
              </div>

              {/* Node 2 */}
              <div className="p-3 bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-slate-700 rounded-xl text-center shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">NODE (0x240)</div>
                <div className="text-base font-black font-mono mt-0.5">25</div>
              </div>

              <div className="flex flex-col items-center justify-center text-[#2563EB] dark:text-blue-400 font-mono text-xs font-bold px-1">
                <span>→</span>
                <span>←</span>
              </div>

              {/* Node 3 */}
              <div className="p-3 bg-white dark:bg-[#0B1120] border-2 border-blue-500 dark:border-blue-400 rounded-xl text-center shadow-xs">
                <div className="text-[10px] font-bold text-[#2563EB] dark:text-blue-300 font-mono">TAIL (0x380)</div>
                <div className="text-base font-black font-mono mt-0.5">42</div>
              </div>

              <span className="text-xs text-slate-400 font-bold">→</span>
              <span className="text-xs font-mono text-rose-500 font-bold px-2 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-500/30">
                null
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 02: NODE STRUCTURE & MEMORY ALLOCATION
  // =========================================================================
  if (isCh02) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>Memory Layout // Heap Non-Contiguous Allocation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                Contiguous Array in RAM
              </span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded">0x100 [10]</div>
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded">0x104 [20]</div>
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded">0x108 [30]</div>
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded">0x10C [40]</div>
              </div>
              <p className="text-[11px] text-slate-500">
                Fixed memory chunk. High cache locality, but rigid resizing.
              </p>
            </div>

            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold font-mono text-[#2563EB] dark:text-blue-300">
                Doubly Linked List on Heap
              </span>
              <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded">0x1000 [10]</div>
                <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded">0x4820 [20]</div>
                <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded">0x2A10 [30]</div>
              </div>
              <p className="text-[11px] text-[#2563EB] dark:text-blue-300">
                Non-contiguous heap locations tied together by explicit memory pointer addresses.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 03: HEAD & TAIL POINTER BOUNDARIES
  // =========================================================================
  if (isCh03) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Boundary States // Head & Tail Sentinel Tracking</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-bold text-slate-600 dark:text-slate-400">1. Empty List:</span>
              <span className="text-[#2563EB] dark:text-cyan-300 font-bold">head = null, tail = null (size = 0)</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-bold text-slate-600 dark:text-slate-400">2. Single Node List:</span>
              <span className="text-[#2563EB] dark:text-cyan-300 font-bold">head == tail (head.prev = null, tail.next = null)</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-bold text-slate-600 dark:text-slate-400">3. Multi-Node Boundary Invariant:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">head.prev == null && tail.next == null</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 04: BI-DIRECTIONAL TRAVERSAL PIPELINE
  // =========================================================================
  if (isCh04) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>Traversal Flow // Forward vs Backward Stepping</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#2563EB] dark:text-blue-300 font-bold">
                <ArrowRight className="w-4 h-4" />
                <span>Forward Traversal Pipeline</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans">
                Start at <code className="text-[#2563EB]">head</code>. Step forward via <code className="text-[#2563EB]">curr = curr.next</code> until reaching <code className="text-[#2563EB]">null</code>.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                <ArrowLeft className="w-4 h-4" />
                <span>Backward Traversal Pipeline</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans">
                Start at <code className="text-emerald-600">tail</code>. Step backward via <code className="text-emerald-600">curr = curr.prev</code> until reaching <code className="text-emerald-600">null</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 05: INSERTION AT HEAD (BEGINNING)
  // =========================================================================
  if (isCh05) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <span className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider flex items-center gap-1.5 font-mono">
              <Play className="w-3.5 h-3.5" />
              <span>Step-by-Step Interactive: Insert at Head (O(1))</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">Step {insertStep + 1} of 4</span>
          </div>

          {/* Step explanations */}
          <div className="p-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs space-y-2">
            {insertStep === 0 && (
              <div>
                <span className="text-[#2563EB] dark:text-blue-300 font-bold block mb-1">STEP 1: Allocate New Node</span>
                <p className="text-slate-600 dark:text-slate-300 font-sans">
                  Create <code className="text-[#2563EB]">newNode</code> with value <strong>99</strong>. Set <code className="text-[#2563EB]">newNode.prev = null</code> and <code className="text-[#2563EB]">newNode.next = head</code>.
                </p>
              </div>
            )}
            {insertStep === 1 && (
              <div>
                <span className="text-[#2563EB] dark:text-blue-300 font-bold block mb-1">STEP 2: Connect Old Head Backward</span>
                <p className="text-slate-600 dark:text-slate-300 font-sans">
                  If the list is not empty, set <code className="text-[#2563EB]">head.prev = newNode</code> so the old head points back to the new node.
                </p>
              </div>
            )}
            {insertStep === 2 && (
              <div>
                <span className="text-[#2563EB] dark:text-blue-300 font-bold block mb-1">STEP 3: Shift Head Pointer</span>
                <p className="text-slate-600 dark:text-slate-300 font-sans">
                  Update <code className="text-[#2563EB]">head = newNode</code> to establish the new node as the official beginning of the list.
                </p>
              </div>
            )}
            {insertStep === 3 && (
              <div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">STEP 4: Increment List Size</span>
                <p className="text-slate-600 dark:text-slate-300 font-sans">
                  Operation completed in strict O(1) constant time!
                </p>
              </div>
            )}
          </div>

          {/* Stepper navigation */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              disabled={insertStep === 0}
              onClick={() => setInsertStep((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-blue-950/40 text-xs font-bold disabled:opacity-40"
            >
              Back
            </button>
            <button
              disabled={insertStep === 3}
              onClick={() => setInsertStep((p) => Math.min(3, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-primary-gradient text-white text-xs font-bold disabled:opacity-40 shadow-xs shadow-primary-gradient cursor-pointer"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 06: INSERTION AT TAIL (END)
  // =========================================================================
  if (isCh06) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tail Appending Logic // O(1) Invariant</span>
          </div>

          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-slate-800 rounded-xl text-xs font-mono space-y-2">
            <div className="text-[#2563EB] dark:text-blue-300 font-bold">The 3-Line Tail Rewire Sequence:</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 font-mono">
              <li><code>newNode.prev = tail;</code> (Link backward to current tail)</li>
              <li><code>tail.next = newNode;</code> (Link old tail forward to new node)</li>
              <li><code>tail = newNode;</code> (Advance container tail pointer)</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 07: INSERTION AT MIDDLE POSITION (4 POINTERS)
  // =========================================================================
  if (isCh07) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The 4 Essential Pointer Updates for Middle Insertion</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[#2563EB] font-bold block">1. newNode.next = curr</span>
              <span className="text-slate-500 text-[11px]">Wire new node forward to target successor</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[#2563EB] font-bold block">2. newNode.prev = curr.prev</span>
              <span className="text-slate-500 text-[11px]">Wire new node backward to target predecessor</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-emerald-600 font-bold block">3. curr.prev.next = newNode</span>
              <span className="text-slate-500 text-[11px]">Wire predecessor forward to new node</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-emerald-600 font-bold block">4. curr.prev = newNode</span>
              <span className="text-slate-500 text-[11px]">Wire successor backward to new node</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 08: DELETION AT HEAD & TAIL
  // =========================================================================
  if (isCh08) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Boundary Node Deletions (Head & Tail)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-700 dark:text-rose-400 font-bold block">Delete Head Operation</span>
              <p className="text-slate-700 dark:text-slate-300 font-sans text-[11px]">
                Advance <code className="text-rose-600">head = head.next</code>. If new head exists, set <code className="text-rose-600">head.prev = null</code> to maintain boundary invariant.
              </p>
            </div>

            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-700 dark:text-rose-400 font-bold block">Delete Tail Operation</span>
              <p className="text-slate-700 dark:text-slate-300 font-sans text-[11px]">
                Retract <code className="text-rose-600">tail = tail.prev</code>. If new tail exists, set <code className="text-rose-600">tail.next = null</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 09: DELETION OF A MIDDLE NODE (BYPASS)
  // =========================================================================
  if (isCh09) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>The 2-Line Bypass Wiring for Middle Node Deletion</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono space-y-3">
            <div className="p-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg">
              <code>target.prev.next = target.next; // Predecessor skips target</code>
            </div>
            <div className="p-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg">
              <code>target.next.prev = target.prev; // Successor skips target</code>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-sans text-[11px]">
              Because both predecessor and successor pointers are immediately reachable via <code className="text-[#2563EB]">target</code>, deletion occurs in strict O(1) pointer updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 10: REAL-WORLD APPLICATIONS (LRU CACHE & BROWSER)
  // =========================================================================
  if (isCh10) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Globe className="w-3.5 h-3.5" />
            <span>Industrial Case Study // Hybrid LRU Cache & Browser History</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-[#2563EB] dark:text-blue-300 font-bold block">1. Browser Forward/Back</span>
              <p className="text-slate-600 dark:text-slate-300 font-sans text-[11px]">
                Clicking Back accesses <code className="text-[#2563EB]">curr.prev</code>. Clicking Forward accesses <code className="text-[#2563EB]">curr.next</code>. Visiting a new URL truncates the forward chain and appends the new page.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-[#2563EB] dark:text-blue-300 font-bold block">2. LRU Cache (Hash + DLL)</span>
              <p className="text-slate-600 dark:text-slate-300 font-sans text-[11px]">
                Hash Map provides O(1) key lookup. Doubly Linked List enables O(1) node detachment and head promotion whenever a key is accessed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 11: ASYMPTOTIC COMPLEXITY & CORE ADVANTAGES
  // =========================================================================
  if (isCh11) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>Asymptotic Complexity Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="p-2 text-left">Operation</th>
                  <th className="p-2 text-center">Array</th>
                  <th className="p-2 text-center">Singly LL</th>
                  <th className="p-2 text-center text-[#2563EB] dark:text-blue-300 font-bold">Doubly LL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-2 font-semibold">Access / Index</td>
                  <td className="p-2 text-center text-emerald-600 font-bold">O(1)</td>
                  <td className="p-2 text-center text-rose-500">O(N)</td>
                  <td className="p-2 text-center text-rose-500">O(N)</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Insert / Delete Head</td>
                  <td className="p-2 text-center text-rose-500">O(N)</td>
                  <td className="p-2 text-center text-emerald-600 font-bold">O(1)</td>
                  <td className="p-2 text-center text-emerald-600 font-bold">O(1)</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Delete Tail (with Tail ptr)</td>
                  <td className="p-2 text-center text-emerald-600 font-bold">O(1)</td>
                  <td className="p-2 text-center text-rose-500">O(N)</td>
                  <td className="p-2 text-center text-emerald-600 font-bold bg-blue-50 dark:bg-blue-950/40">O(1) ⭐</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Delete Known Node Pointer</td>
                  <td className="p-2 text-center text-rose-500">O(N)</td>
                  <td className="p-2 text-center text-rose-500">O(N)</td>
                  <td className="p-2 text-center text-emerald-600 font-bold bg-blue-50 dark:bg-blue-950/40">O(1) ⭐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 12: MEMORY OVERHEAD & TRADE-OFFS
  // =========================================================================
  if (isCh12) {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-blue-400 tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>Memory Overhead & Cache Locality Trade-Offs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-xl space-y-1.5">
              <span className="font-bold text-amber-800 dark:text-amber-300 block font-mono">2x Pointer Overhead</span>
              <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                Storing both <code className="text-amber-700">prev</code> and <code className="text-amber-700">next</code> 64-bit pointers requires 16 bytes of metadata per node, quadrupling spatial requirements for small primitive integers.
              </p>
            </div>

            <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-xl space-y-1.5">
              <span className="font-bold text-rose-800 dark:text-rose-300 block font-mono">CPU Cache Misses</span>
              <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                Because nodes are scattered throughout the dynamic heap, traversing a Doubly Linked List incurs higher L1/L2 CPU cache miss rates compared to contiguous memory buffers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
