import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Target,
  Database,
  Layers,
  Zap,
  Folder,
  Globe,
  Lightbulb,
  BookOpen,
  Star,
  Link as LinkIcon,
  Activity,
  Cpu,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface HomePageProps {
  onContinueLearning: () => void;
  onExploreTopics: () => void;
  onNavigateToTab: (
    tab: 'THEORY' | 'VIDEO' | 'GAME' | 'QUEST' | 'LAB' | 'QUIZ' | 'PROGRESS',
    targetOption?: string | number
  ) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onExploreTopics,
  onNavigateToTab,
}) => {
  // Hook for smooth reveal animation on scroll
  useScrollReveal();

  const handleStartLearning = () => {
    soundManager.playPrimaryClick();
    onExploreTopics();
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-7 font-sans text-slate-900 dark:text-slate-100 animate-page-enter pb-10 select-text">
      {/* =========================================================================
          SECTION 01: HERO SECTION & DOUBLY LINKED LIST DIAGRAM BESIDE TITLE
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Title & Curriculum Description */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <div className="flex items-center">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#2563EB] dark:text-blue-400 uppercase">
                THEORY CURRICULUM • MODULE 01 • CHAPTER 01
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.18]">
              Doubly Linked List &amp; Pointer Mastery
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Master the bi-directional linear data structure: learn how prev and next pointers connect nodes in heap memory, execute O(1) head and tail operations, and build industrial LRU caches.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-100 dark:border-blue-900/40">
                Node [ prev | data | next ]
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                O(1) Head &amp; Tail Ops
              </span>
            </div>
          </div>

          {/* Right Column: DLL Diagram Beside Title with Simple Theme Color Background, Blue Only, No Outline Box, Zero Horizontal Scroll */}
          <div className="lg:col-span-7 w-full">
            <div className="w-full bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-4 sm:p-5">
              {/* Diagram Node Chain */}
              <div className="w-full flex items-center justify-between gap-1 sm:gap-2 pt-4 pb-2">
                {/* Left Sentinel NULL */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="px-2 py-1 bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 rounded-lg text-[10px] sm:text-xs font-mono font-extrabold shadow-2xs border border-blue-100 dark:border-blue-900/40">
                    NULL
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400 dark:text-blue-500">←</span>
                </div>

                {/* Node 1 (Head: 0x100) */}
                <div className="relative flex-1 min-w-[68px] max-w-[125px] bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-blue-200/80 dark:border-blue-800/60">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none">
                    <span className="bg-[#2563EB] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-xs">
                      HEAD
                    </span>
                  </div>
                  <div className="bg-[#2563EB] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 text-center rounded-t-[11px]">
                    0x100
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-blue-50 dark:divide-slate-800 text-center font-mono text-[9px]">
                    <div className="p-1 text-slate-400">∅</div>
                    <div className="p-1 font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">10</div>
                    <div className="p-1 text-[#2563EB] dark:text-blue-400 font-bold">0x240</div>
                  </div>
                </div>

                {/* Bi-directional arrows */}
                <div className="flex flex-col items-center justify-center font-mono font-bold text-[10px] text-[#2563EB] dark:text-blue-400 shrink-0 select-none">
                  <span>─►</span>
                  <span className="mt-0.5">◄─</span>
                </div>

                {/* Node 2 (0x240) */}
                <div className="relative flex-1 min-w-[68px] max-w-[125px] bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-blue-200/80 dark:border-blue-800/60">
                  <div className="bg-blue-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 text-center rounded-t-[11px]">
                    0x240
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-blue-50 dark:divide-slate-800 text-center font-mono text-[9px]">
                    <div className="p-1 text-[#2563EB] dark:text-blue-400 font-bold">0x100</div>
                    <div className="p-1 font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">25</div>
                    <div className="p-1 text-[#2563EB] dark:text-blue-400 font-bold">0x380</div>
                  </div>
                </div>

                {/* Bi-directional arrows */}
                <div className="flex flex-col items-center justify-center font-mono font-bold text-[10px] text-[#2563EB] dark:text-blue-400 shrink-0 select-none">
                  <span>─►</span>
                  <span className="mt-0.5">◄─</span>
                </div>

                {/* Node 3 (Tail: 0x380) */}
                <div className="relative flex-1 min-w-[68px] max-w-[125px] bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-blue-200/80 dark:border-blue-800/60">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none">
                    <span className="bg-[#2563EB] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-xs">
                      TAIL
                    </span>
                  </div>
                  <div className="bg-[#2563EB] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 text-center rounded-t-[11px]">
                    0x380
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-blue-50 dark:divide-slate-800 text-center font-mono text-[9px]">
                    <div className="p-1 text-[#2563EB] dark:text-blue-400 font-bold">0x240</div>
                    <div className="p-1 font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">42</div>
                    <div className="p-1 text-slate-400">∅</div>
                  </div>
                </div>

                {/* Right Sentinel NULL */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs font-mono font-bold text-blue-400 dark:text-blue-500">→</span>
                  <div className="px-2 py-1 bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 rounded-lg text-[10px] sm:text-xs font-mono font-extrabold shadow-2xs border border-blue-100 dark:border-blue-900/40">
                    NULL
                  </div>
                </div>
              </div>

              {/* Bottom Invariant Note (Strictly Blue Theme) */}
              <div className="text-center text-[11px] font-mono text-blue-700 dark:text-blue-300 pt-2 font-semibold">
                Bi-directional Invariant: head.prev = NULL ⇄ tail.next = NULL
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 02: THREE CONCEPT CARDS
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          {/* Card 1: Core Idea */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/40 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-300 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Core Idea</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Nodes hold 2 pointers: prev to predecessor and next to successor.
              </p>
            </div>
          </div>

          {/* Card 2: Key Formula */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/40 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-300 shrink-0 font-serif font-bold text-xl">
              <span>⇄</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Boundary Invariant</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">head.prev = null</span> <br />
                <span className="font-mono text-slate-500 dark:text-slate-400">tail.next = null</span>
              </p>
            </div>
          </div>

          {/* Card 3: Main Challenge */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/40 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-300 shrink-0">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Main Challenge</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Rewire 4 pointers seamlessly without losing references or leaking memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03: 1. THE MAIN IDEA
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-9 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
            1. The Main Idea
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Question & Explanation */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#2563EB] dark:text-blue-300 leading-snug">
              Why navigate in two directions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Doubly Linked Lists enable instant backward traversal, O(1) end insertions, and direct node deletion without searching for predecessor nodes.
            </p>
          </div>

          {/* Right Column: Horizontal Flow (Data -> Prev* -> Next* -> Node Linked) */}
          <div className="lg:col-span-8 bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 items-start sm:flex sm:flex-nowrap sm:items-center sm:justify-between sm:gap-2">
              {/* Step 1: Payload Data */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[85px]">
                <div className="w-13 h-13 rounded-full bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">Data</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Payload value</span>
              </div>

              {/* Arrow 1 */}
              <ArrowRight className="w-4 h-4 text-blue-400 dark:text-blue-400 shrink-0 hidden sm:block" />

              {/* Step 2: Prev Pointer */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[85px]">
                <div className="w-13 h-13 rounded-full bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center shadow-2xs text-white">
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">Prev*</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Link to Predecessor</span>
              </div>

              {/* Arrow 2 */}
              <ArrowRight className="w-4 h-4 text-blue-400 dark:text-blue-400 shrink-0 hidden sm:block" />

              {/* Step 3: Next Pointer */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[85px]">
                <div className="w-13 h-13 rounded-full bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center shadow-2xs text-white">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">Next*</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Link to Successor</span>
              </div>

              {/* Arrow 3 */}
              <ArrowRight className="w-4 h-4 text-blue-400 dark:text-blue-400 shrink-0 hidden sm:block" />

              {/* Step 4: Heap Node */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[85px]">
                <div className="w-13 h-13 rounded-full bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">Heap Node</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Dynamic Allocation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04: 2. CONCEPT ROADMAP
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-9 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
            2. Concept Roadmap
          </h2>
        </div>

        {/* 5-Stage Progression */}
        <div className="relative">
          {/* Connected Dashed Line Across the 5 Steps (desktop) */}
          <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-blue-200 dark:border-blue-900/40 z-0" />

          <div className="flex flex-col items-center md:grid md:grid-cols-5 md:gap-4 md:items-start relative z-10">
            {/* Stage 01: Node Structure */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'what-is-dll');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-xs mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                01
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50/60 dark:bg-[#1E293B] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mb-2.5 shadow-2xs group-hover:border-blue-400 transition-all font-mono font-bold text-lg">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white leading-snug">
                Node <br className="hidden md:inline" /> Structure
              </h3>
            </div>

            {/* Mobile Connector Line: 01 -> 02 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-blue-200 dark:border-blue-900/40 my-2" />

            {/* Stage 02: Head & Tail */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'head-tail-pointers');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-xs mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                02
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50/60 dark:bg-[#1E293B] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mb-2.5 shadow-2xs group-hover:border-blue-300 transition-all">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white leading-snug">
                Head &amp; <br className="hidden md:inline" /> Tail Bounds
              </h3>
            </div>

            {/* Mobile Connector Line: 02 -> 03 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-blue-200 dark:border-blue-900/40 my-2" />

            {/* Stage 03: Bi-directional Traversal */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'bidirectional-traversal');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-xs mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                03
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50/60 dark:bg-[#1E293B] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#06B6D4] dark:text-cyan-400 mb-2.5 shadow-2xs group-hover:border-cyan-400 transition-all">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white leading-snug">
                Two-Way <br className="hidden md:inline" /> Traversal
              </h3>
            </div>

            {/* Mobile Connector Line: 03 -> 04 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-blue-200 dark:border-blue-900/40 my-2" />

            {/* Stage 04: Head & Tail Operations */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'insert-head');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-xs mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                04
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FFFBEB] dark:bg-[#1E293B] border border-[#FDE68A] dark:border-amber-500/30 flex items-center justify-center text-[#F59E0B] dark:text-amber-400 mb-2.5 shadow-2xs group-hover:border-amber-400 transition-all">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white leading-snug">
                Boundary <br className="hidden md:inline" /> Ops (O(1))
              </h3>
            </div>

            {/* Mobile Connector Line: 04 -> 05 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-blue-200 dark:border-blue-900/40 my-2" />

            {/* Stage 05: 4-Pointer Middle Ops */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'insert-position');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-xs mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                05
              </div>
              <div className="w-12 h-12 rounded-full bg-[#F0FDF4] dark:bg-[#1E293B] border border-[#BBF7D0] dark:border-emerald-500/30 flex items-center justify-center text-[#10B981] dark:text-emerald-400 mb-2.5 shadow-2xs group-hover:border-emerald-400 transition-all">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white leading-snug">
                4-Pointer <br className="hidden md:inline" /> Middle Ops
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05: 3. WHY THIS TOPIC MATTERS
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-9 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
            <Star className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
            3. Why This Topic Matters
          </h2>
        </div>

        {/* 3 Value Cards Matching Exact References */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Fast O(1) End Operations */}
          <div className="bg-blue-50/30 dark:bg-[#0B1120] border border-blue-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="w-11 h-11 rounded-full bg-primary-gradient text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-1.5">O(1) End Operations</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Prepend, append, and remove nodes at both head and tail in guaranteed constant O(1) time.
              </p>
            </div>
          </div>

          {/* Card 2: Bi-directional Flexibility */}
          <div className="bg-[#F0FDF4] dark:bg-[#0B1120] border border-[#DCFCE7] dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="w-11 h-11 rounded-full bg-primary-gradient text-white flex items-center justify-center shadow-xs">
              <Folder className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-1.5">Bi-directional Traversal</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Step backwards or forwards freely without needing to restart traversal from the beginning.
              </p>
            </div>
          </div>

          {/* Card 3: Real-World Use */}
          <div className="bg-blue-50/40 dark:bg-[#0B1120] border border-blue-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="w-11 h-11 rounded-full bg-primary-gradient text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-1.5">Real-World Architecture</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Used in Browser History (Back/Forward), Music Playlists, Text Editor Undo/Redo, and LRU Cache systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06: 4. READY TO START?
          ========================================================================= */}
      <section className="reveal-on-scroll bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/40 dark:from-[#111827] dark:via-[#17223A] dark:to-[#111827] border border-blue-100 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Side: Educational Visual & Supporting Text */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* 3D Launch Rocket Image (Picture 1) */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden border border-blue-200/80 dark:border-blue-800/50 shadow-md shadow-blue-950/20 flex items-center justify-center group bg-[#0B1120]">
              <img
                src="/rocket-launch.svg"
                alt="Rocket Launch"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title & Description */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white">
                4. Ready to Start?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                Begin with the fundamental anatomy of a Doubly Linked List node and its bi-directional pointers.
              </p>
            </div>
          </div>

          {/* Right Side: Action Button */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              id="btn-home-start-learning"
              onClick={handleStartLearning}
              className="w-full sm:w-auto px-6 py-3.5 bg-primary-gradient text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-primary-gradient transition-all flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
