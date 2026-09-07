import React, { useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Sparkles,
  Printer,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  X,
  BookOpen,
  Gamepad2,
  Sliders,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { progressManager } from '../utils/progressManager';

interface CompletionCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToQuest?: () => void;
  onNavigateToLab?: () => void;
  onNavigateToProgress?: () => void;
}

export const CompletionCelebrationModal: React.FC<CompletionCelebrationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToQuest,
  onNavigateToLab,
  onNavigateToProgress,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.play100PercentFanfare();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = progressManager.getStats();
  const state = progressManager.getState();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const competencies = [
    { code: 'FN-01', title: 'What is a Doubly Linked List? & Node Anatomy', status: 'Mastered' },
    { code: 'FN-02', title: 'Node Structure & Heap Memory Allocation', status: 'Mastered' },
    { code: 'FN-03', title: 'Head & Tail Sentinel Pointer Bounds', status: 'Mastered' },
    { code: 'FN-04', title: 'Bi-directional Traversal Pipeline', status: 'Mastered' },
    { code: 'FN-05', title: 'Insertion at Head (Prepend) in O(1)', status: 'Mastered' },
    { code: 'FN-06', title: 'Insertion at Tail (Append) in O(1)', status: 'Mastered' },
    { code: 'FN-07', title: '4-Pointer Middle Position Insertion', status: 'Mastered' },
    { code: 'FN-08', title: 'Boundary Deletions (Head & Tail)', status: 'Mastered' },
    { code: 'FN-09', title: '2-Line Bypass Wiring for Middle Node Deletion', status: 'Mastered' },
    { code: 'FN-10', title: 'Real-World LRU Cache & Browser History', status: 'Mastered' },
    { code: 'FN-11', title: 'Asymptotic Complexity & Core Advantages', status: 'Mastered' },
    { code: 'FN-12', title: 'Pointer Memory Overhead & Cache Miss Analysis', status: 'Mastered' },
  ];

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div
      id="completion-celebration-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-editorial-fade overflow-y-auto font-sans"
      onClick={onClose}
    >
      <div
        id="completion-celebration-modal"
        className="relative w-full max-w-3xl my-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl dark:shadow-[0_0_35px_rgba(37,99,235,0.3)] p-6 sm:p-8 text-slate-900 dark:text-white animate-editorial-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-celebration"
          onClick={() => {
            soundManager.playModalClose();
            onClose();
          }}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header Badge */}
        <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono uppercase tracking-widest mb-3 rounded-lg border border-amber-200 dark:border-amber-500/30 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>100% Curriculum Mastery Achieved</span>
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Congratulations on Completion!
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed font-normal">
            You have successfully completed every Field Note module, conquered all 5 interactive Quest levels, mastered collision resolution strategies, and passed the official examination.
          </p>
        </div>

        {/* Certificate Card Body */}
        <div className="my-6 p-5 sm:p-6 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] dark:text-blue-400 uppercase font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Official DSA Certification</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Doubly Linked List Data Structure Specialist
              </div>
            </div>

            {/* Official Seal */}
            <div className="shrink-0 flex items-center gap-3 px-3.5 py-2 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold font-mono text-sm shadow-xs shadow-primary-gradient">
                100%
              </div>
              <div className="text-[11px] leading-tight font-semibold">
                <div className="text-slate-900 dark:text-white font-bold">CERTIFIED</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono">{currentDate}</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">MODULES</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">10 / 10</div>
            </div>
            <div className="p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">QUEST LEVELS</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">5 / 5 WON</div>
            </div>
            <div className="p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">MASTERY</div>
              <div className="text-lg font-bold text-[#2563EB] dark:text-blue-400 font-mono">100% COMPLETE</div>
            </div>
            <div className="p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">STATUS</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">MASTER</div>
            </div>
          </div>

          {/* Mastered Competencies Checklist */}
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 mb-2 uppercase font-mono flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>Verified Competencies:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {competencies.map((comp) => (
                <div
                  key={comp.code}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{comp.code}:</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate">
                      {comp.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold font-mono uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0 ml-2 border border-emerald-200/50 dark:border-emerald-500/30">
                    {comp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="btn-print-certificate"
            onClick={handlePrint}
            className="w-full sm:w-auto btn-modern-secondary px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span>Print / Save Certificate</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigateToLab && (
              <button
                id="btn-celebration-goto-lab"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                  onNavigateToLab();
                }}
                className="flex-1 sm:flex-initial btn-modern-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                <span>Sandbox Lab</span>
              </button>
            )}

            {onNavigateToProgress && (
              <button
                id="btn-celebration-goto-progress"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                  onNavigateToProgress();
                }}
                className="flex-1 sm:flex-initial btn-modern-primary px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Progress Ledger</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
