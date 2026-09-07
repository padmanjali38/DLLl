import React from 'react';
import {
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DLLLevelConfig } from '../../data/dllGameLevelsConfig';

export interface DLLChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface DLLRightTaskPanelProps {
  level: DLLLevelConfig;
  checklist: DLLChecklistItem[];
  feedback: { message: string; type: 'success' | 'error' } | null;
  hintStep: number;
  onAdvanceHint: () => void;
  onCheckAnswer: () => void;
  onResetLevel: () => void;
  onStartGuidedSolve: () => void;
  isGuidedActive: boolean;
}

export const DLLRightTaskPanel: React.FC<DLLRightTaskPanelProps> = ({
  level,
  checklist,
  feedback,
  hintStep,
  onAdvanceHint,
  onCheckAnswer,
  onResetLevel,
  onStartGuidedSolve,
  isGuidedActive,
}) => {
  const completedCount = checklist.filter((item) => item.completed).length;
  const totalTasks = checklist.length;
  const allTasksCompleted = totalTasks > 0 && completedCount === totalTasks;

  return (
    <aside
      id="dll-right-task-panel"
      className="flex flex-col gap-5 w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-sm"
    >
      {/* 1. Level Summary Header */}
      <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
            Task {level.level} of 9
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{level.xp} XP</span>
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          {level.cardTitle || level.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {level.goal}
        </p>
      </div>

      {/* 2. Target Verification Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            Target Checklist
          </span>
          <span
            className={`font-bold ${
              allTasksCompleted
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {completedCount} / {totalTasks} Satisfied
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                item.completed
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <span className="leading-snug font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Feedback & Beginner-Friendly Mistake Explainer */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium space-y-1.5 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.type === 'success' ? 'Verification Passed!' : 'Pointer Guidance'}</span>
          </div>
          <p className="leading-relaxed text-[12px]">{feedback.message}</p>
        </div>
      )}

      {/* 4. 3 Progressive Hints System */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Progressive Hints
          </span>
          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
            {hintStep}/3 Revealed
          </span>
        </div>

        {/* Hints Display */}
        {hintStep > 0 && (
          <div className="space-y-2 animate-fade-in">
            {/* Hint 1: Conceptual clue */}
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px] uppercase tracking-wider font-mono">
                Hint 1 • Conceptual Clue
              </span>
              <p className="leading-relaxed">{level.hints[0]}</p>
            </div>

            {/* Hint 2: Pointer relationship clue */}
            {hintStep >= 2 && (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-1 animate-fade-in">
                <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px] uppercase tracking-wider font-mono">
                  Hint 2 • Pointer Relationship
                </span>
                <p className="leading-relaxed">{level.hints[1]}</p>
              </div>
            )}

            {/* Hint 3: Exact operation / pseudocode */}
            {hintStep >= 3 && (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-1 animate-fade-in">
                <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px] uppercase tracking-wider font-mono">
                  Hint 3 • Exact Operation
                </span>
                <p className="leading-relaxed font-mono text-[11px] bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-300/40">
                  {level.hints[2]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hint Reveal Button */}
        {hintStep < 3 ? (
          <button
            onClick={onAdvanceHint}
            className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/70 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Reveal Hint {hintStep + 1} of 3</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono text-slate-400 block text-center italic">
            All 3 hints revealed
          </span>
        )}
      </div>

      {/* 5. Guided Solve Trigger */}
      {!isGuidedActive && (
        <button
          onClick={onStartGuidedSolve}
          className="w-full py-2.5 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Lightbulb className="w-4 h-4 fill-current" />
          <span>💡 Guided Solve (Step-by-Step)</span>
        </button>
      )}

      {/* 6. Primary Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          id="btn-check-answer-main"
          onClick={onCheckAnswer}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-black text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Check Answer</span>
        </button>

        <button
          onClick={onResetLevel}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Level Workspace</span>
        </button>
      </div>
    </aside>
  );
};
