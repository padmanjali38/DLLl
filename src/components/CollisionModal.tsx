import React from 'react';
import { ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CollisionModalProps {
  incomingKey: number;
  existingKey: number;
  index: number;
  tableSize: number;
  onProceedToResolution: () => void;
}

export const CollisionModal: React.FC<CollisionModalProps> = ({
  incomingKey,
  existingKey,
  index,
  tableSize,
  onProceedToResolution,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-editorial-fade font-sans">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-[0_0_30px_rgba(244,63,94,0.25)] overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Collision Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[2]" />
        </div>

        <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-md border border-rose-200 dark:border-rose-500/30 mb-2">
          Collision Encountered
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-1">
          Slot [{index < 10 ? `0${index}` : index}] is Occupied!
        </h3>

        {/* Visual Clash Breakdown */}
        <div className="flex items-center justify-center gap-3 my-4 w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Stored Key</span>
            <div className="w-14 h-14 rounded-xl bg-slate-900 dark:bg-[#1E293B] text-white dark:text-[#F8FAFC] border border-transparent dark:border-slate-700 flex items-center justify-center font-mono font-bold text-2xl shadow-xs mt-1">
              {existingKey}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold mt-1.5">{existingKey} % {tableSize} = {index}</span>
          </div>

          <div className="text-rose-600 dark:text-rose-400 font-black text-sm px-1 font-mono">VS</div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-[#2563EB] dark:text-blue-400 font-mono">New Key</span>
            <div className="w-14 h-14 rounded-xl bg-[#2563EB] dark:bg-[#2563EB] text-white flex items-center justify-center font-mono font-bold text-2xl shadow-xs mt-1 shadow-blue-200 dark:shadow-[0_0_14px_rgba(37,99,235,0.4)]">
              {incomingKey}
            </div>
            <span className="text-[10px] text-[#2563EB] dark:text-blue-400 font-mono font-bold mt-1.5">{incomingKey} % {tableSize} = {index}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-sans">
          Both keys hash to index <strong className="text-slate-900 dark:text-white font-mono">[{index}]</strong>. In basic arrays, only one element can occupy a single cell. Let's learn how collision resolution algorithms solve this!
        </p>

        {/* Action Button */}
        <button
          id="btn-learn-how-to-solve"
          onClick={() => {
            soundManager.playPrimaryClick();
            onProceedToResolution();
          }}
          className="w-full btn-modern-primary py-3 px-6 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>Proceed to Resolution Techniques</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
