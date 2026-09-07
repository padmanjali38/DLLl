import React from 'react';
import {
  Trophy,
  Star,
  CheckCircle2,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { soundManager } from '../utils/audio';

interface QuestCompletionViewProps {
  onReplayLevel: (levelId: number) => void;
  onOpenTheory: () => void;
  onOpenSandbox: () => void;
  onOpenQuiz: () => void;
  onOpenProgress: () => void;
}

export const QuestCompletionView: React.FC<QuestCompletionViewProps> = ({
  onReplayLevel,
  onOpenTheory,
  onOpenSandbox,
  onOpenQuiz,
  onOpenProgress,
}) => {
  const pState = progressManager.getState();
  const stats = progressManager.getStats();

  const masteredAlgorithms = [
    {
      id: 1,
      code: '01',
      title: 'Head Insertion (Prepend)',
      desc: 'Rewire newNode.next to old head and set head.prev in O(1) time.',
      tag: 'BOUNDARY OP',
    },
    {
      id: 2,
      code: '02',
      title: 'Tail Insertion (Append)',
      desc: 'Link tail.next to newNode and advance tail reference in O(1) time.',
      tag: 'BOUNDARY OP',
    },
    {
      id: 3,
      code: '03',
      title: 'Bi-directional Traversal',
      desc: 'Step forward via curr.next and backwards via curr.prev seamlessly.',
      tag: 'NAVIGATION',
    },
    {
      id: 4,
      code: '04',
      title: 'Insertion at Middle Position',
      desc: 'Execute the 4-pointer interlocking rewire safely without losing links.',
      tag: 'INTERIOR OP',
    },
    {
      id: 5,
      code: '05',
      title: 'Middle Node Deletion',
      desc: 'Bypass target node in 2 pointer assignments: target.prev.next = target.next.',
      tag: 'BYPASS OP',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4 font-sans animate-page-enter space-y-6">
      {/* 1. Header Certificate Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 font-mono">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-200 dark:border-amber-500/30">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Game Level 05 // Completion Milestone</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Status: 5 of 5 Operations Mastered
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight animate-heading-enter">
              Doubly Linked List Completed!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              Congratulations! You have completed all foundational and advanced pointer rewiring levels. You have verified how bi-directional linking enables instant <code className="font-bold text-[#2563EB] dark:text-cyan-400 font-mono">O(1)</code> insertions, deletions, and dual-direction traversals.
            </p>
          </div>

          {/* Quick Mastery Status Card */}
          <div className="lg:col-span-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-slate-800 rounded-2xl p-5 text-center shadow-2xs space-y-2">
            <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-300 uppercase font-mono tracking-widest block">
              Quest Mastery
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-mono text-[#2563EB] dark:text-cyan-300">
              5 / 5 <span className="text-xl">Levels</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 pt-2 border-t border-blue-200 dark:border-slate-800 font-mono">
              Accuracy Streak: {pState.streak ?? 0} Keys
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mastered Algorithm Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span>5 Completed Algorithm Modules</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Click any level to replay</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masteredAlgorithms.map((algo) => (
            <div
              key={algo.id}
              onClick={() => {
                soundManager.playSelect();
                onReplayLevel(algo.id);
              }}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/40 transition-all cursor-pointer flex flex-col justify-between group select-none"
            >
              <div>
                <div className="flex items-center justify-between mb-3 font-mono">
                  <span className="px-2.5 py-1 bg-[#2563EB] dark:bg-blue-600 text-white rounded-md text-xs font-bold shadow-xs">
                    Lvl {algo.code}
                  </span>
                  <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-300 uppercase tracking-wider">
                    {algo.tag}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight mb-1.5 group-hover:text-[#2563EB] dark:group-hover:text-cyan-300 transition-colors">
                  {algo.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {algo.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#2563EB] dark:text-blue-400 font-mono">
                <span>Replay Level {algo.code}</span>
                <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform" />
              </div>
            </div>
          ))}

          {/* 6th Card: Interactive Lab Sandbox */}
          <div
            onClick={() => {
              soundManager.playSelect();
              onOpenSandbox();
            }}
            className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition-all cursor-pointer flex flex-col justify-between group select-none"
          >
            <div>
              <div className="flex items-center justify-between mb-3 font-mono">
                <span className="px-2.5 py-1 bg-[#2563EB] dark:bg-blue-600 text-white rounded-md text-xs font-bold">
                  Sandbox
                </span>
                <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-200 uppercase tracking-wider">
                  Unlimited Keys
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight mb-1.5 group-hover:text-[#2563EB] dark:group-hover:text-cyan-300 transition-colors">
                Interactive Lab
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Experiment freely with arbitrary keys, custom table capacities, and instant step-by-step resolution vectors.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#2563EB] dark:text-blue-400 font-mono">
              <span>Open Sandbox Lab</span>
              <Layers className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Next Steps & Certification Actions */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 uppercase font-mono tracking-widest block">
            Next Recommended Milestones
          </span>
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Test your knowledge with the Quiz Exam or view your complete Progress Audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-completion-open-lab"
            onClick={() => {
              soundManager.playSelect();
              onOpenSandbox();
            }}
            className="btn-modern-secondary px-4 sm:px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer select-none"
          >
            <Layers className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span>Open Lab</span>
          </button>

          <button
            id="btn-completion-open-quiz"
            onClick={() => {
              soundManager.playPrimaryClick();
              onOpenQuiz();
            }}
            className="btn-modern-primary px-4 sm:px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer select-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Take Quiz Exam</span>
          </button>

          <button
            id="btn-completion-open-progress"
            onClick={() => {
              soundManager.playSecondaryClick();
              onOpenProgress();
            }}
            className="btn-modern-secondary px-4 sm:px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer select-none"
          >
            <Award className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span>View Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
