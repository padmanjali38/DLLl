import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  confirmationMessage?: string;
  cancelText?: string;
  confirmText?: string;
}

export const ResetProgressModal: React.FC<ResetProgressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'RESET PROGRESS?',
  confirmationMessage = 'Are you sure you want to reset your learning progress? All completed theory chapters, watched videos, completed game levels, quiz progress, and mastery progress will be reset.',
  cancelText = 'EXIT',
  confirmText = 'RESET',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundManager.playModalClose();
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.9)] text-center animate-scale-enter font-sans">
        {/* Warning Icon inside a red/pink rounded icon container */}
        <div className="w-13 h-13 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
          <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h2
          id="reset-modal-title"
          className="text-xl sm:text-2xl font-black font-sans text-slate-900 dark:text-white tracking-tight uppercase mb-3"
        >
          {title}
        </h2>

        {/* Body Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
          {confirmationMessage}
        </p>

        {/* Action Buttons: [ EXIT ] [ RESET ] */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* EXIT Button: Close modal, make no changes */}
          <button
            id="btn-modal-exit-reset"
            type="button"
            onClick={() => {
              soundManager.playModalClose();
              onClose();
            }}
            className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {cancelText}
          </button>

          {/* RESET Button: Reset all learning and game progress */}
          <button
            id="btn-modal-confirm-reset"
            type="button"
            onClick={() => {
              soundManager.playReset();
              onConfirm();
              onClose();
            }}
            className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
