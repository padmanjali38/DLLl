import React from 'react';
import { ArrowLeft, ArrowRight, GripVertical } from 'lucide-react';

export interface DLLNodeCardProps {
  value: number;
  index?: number;
  prevTarget?: number | 'NULL' | null;
  nextTarget?: number | 'NULL' | null;
  isHead?: boolean;
  isTail?: boolean;
  isDraggable?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isCandidate?: boolean;
  // Specific port highlight ('prev' | 'next' | 'none')
  activePortHighlight?: 'prev' | 'next' | 'none';
  // Error pulse (red shake)
  hasErrorPulse?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onClick?: () => void;
  onPortClick?: (port: 'prev' | 'next') => void;
}

export const DLLNodeCard: React.FC<DLLNodeCardProps> = ({
  value,
  prevTarget,
  nextTarget,
  isHead = false,
  isTail = false,
  isDraggable = false,
  isSelected = false,
  isHighlighted = false,
  isCandidate = false,
  activePortHighlight = 'none',
  hasErrorPulse = false,
  onDragStart,
  onClick,
  onPortClick,
}) => {
  const isEditingPrev = activePortHighlight === 'prev';
  const isEditingNext = activePortHighlight === 'next';

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onClick={onClick}
      role={isDraggable || onClick ? 'button' : undefined}
      tabIndex={isDraggable || onClick ? 0 : undefined}
      className={`relative inline-flex flex-col select-none transition-all duration-200 ${
        isDraggable ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${
        isSelected
          ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 rounded-2xl'
          : ''
      } ${
        hasErrorPulse ? 'animate-shake ring-4 ring-rose-500 rounded-2xl' : ''
      }`}
    >
      {/* Top Label Badge (HEAD / TAIL / NEW NODE) */}
      <div className="flex justify-between items-center px-1 mb-1 text-[10px] font-mono font-bold tracking-wider uppercase h-4">
        {isCandidate ? (
          <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 shadow-xs">
            NEW NODE
          </span>
        ) : (
          <>
            {isHead ? (
              <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-xs">
                HEAD
              </span>
            ) : (
              <span />
            )}
            {isTail ? (
              <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 shadow-xs">
                TAIL
              </span>
            ) : (
              <span />
            )}
          </>
        )}
      </div>

      {/* Main DLL Node Box with Vertical 3-Tier Layout: PREV / DATA / NEXT */}
      <div
        className={`w-24 sm:w-28 flex flex-col rounded-2xl border shadow-sm transition-all overflow-hidden ${
          hasErrorPulse
            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/50 ring-2 ring-rose-400'
            : isHighlighted
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400'
            : isSelected
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        {/* TIER 1: PREV Pointer Compartment */}
        <div
          onClick={(e) => {
            if (onPortClick) {
              e.stopPropagation();
              onPortClick('prev');
            }
          }}
          className={`flex items-center justify-between px-2 py-1.5 border-b transition-all text-[10px] font-mono font-bold ${
            isEditingPrev
              ? 'bg-amber-100 dark:bg-amber-900/70 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400 ring-inset animate-pulse font-extrabold'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
          title={`${value}.prev`}
        >
          <div className="flex items-center gap-1">
            <ArrowLeft className={`w-3 h-3 stroke-[2.5] ${isEditingPrev ? 'text-amber-600 dark:text-amber-400 animate-bounce-x' : ''}`} />
            <span>PREV</span>
          </div>
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
              isEditingPrev
                ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {isEditingPrev
              ? '?'
              : prevTarget !== undefined
              ? prevTarget === null
                ? '...'
                : String(prevTarget)
              : ''}
          </span>
        </div>

        {/* TIER 2: DATA Value Compartment (Prominent Center) */}
        <div className="flex flex-col items-center justify-center py-2.5 px-2 bg-transparent">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            DATA
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white my-0.5">
            {value}
          </span>
        </div>

        {/* TIER 3: NEXT Pointer Compartment */}
        <div
          onClick={(e) => {
            if (onPortClick) {
              e.stopPropagation();
              onPortClick('next');
            }
          }}
          className={`flex items-center justify-between px-2 py-1.5 border-t transition-all text-[10px] font-mono font-bold ${
            isEditingNext
              ? 'bg-amber-100 dark:bg-amber-900/70 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400 ring-inset animate-pulse font-extrabold'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
          title={`${value}.next`}
        >
          <div className="flex items-center gap-1">
            <span>NEXT</span>
            <ArrowRight className={`w-3 h-3 stroke-[2.5] ${isEditingNext ? 'text-amber-600 dark:text-amber-400 animate-bounce-x' : ''}`} />
          </div>
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
              isEditingNext
                ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {isEditingNext
              ? '?'
              : nextTarget !== undefined
              ? nextTarget === null
                ? '...'
                : String(nextTarget)
              : ''}
          </span>
        </div>
      </div>

      {/* Draggable grip indicator */}
      {isDraggable && (
        <div className="absolute top-5 right-1.5 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};

// Bi-directional Pointer Connector representing: [nodeA] ⇄ [nodeB]
interface BiDirectionalArrowProps {
  forwardConnected?: boolean;
  backwardConnected?: boolean;
  isNextActive?: boolean;
  isPrevActive?: boolean;
  isBroken?: boolean;
  isHighlighted?: boolean;
  label?: string;
}

export const BiDirectionalArrow: React.FC<BiDirectionalArrowProps> = ({
  forwardConnected = true,
  backwardConnected = true,
  isNextActive = false,
  isPrevActive = false,
  isBroken = false,
  isHighlighted = false,
  label,
}) => {
  if (isBroken) {
    return (
      <div className="flex flex-col items-center justify-center px-2 py-1 select-none animate-pulse">
        <div className="px-2 py-1 rounded-lg border border-dashed border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold shadow-xs">
          ⚡ BROKEN LINK ⚡
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-1 sm:px-2 select-none">
      {/* Forward link: NEXT (Left to Right) */}
      <div
        className={`flex items-center text-[10px] font-mono font-bold transition-all ${
          isNextActive
            ? 'text-amber-500 dark:text-amber-400 animate-pulse font-extrabold scale-110'
            : !forwardConnected
            ? 'text-slate-300 dark:text-slate-700 border-dashed'
            : isHighlighted
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-slate-500 dark:text-slate-400'
        }`}
        title="Forward link (NEXT: left to right)"
      >
        <span
          className={`h-[2px] w-5 sm:w-7 rounded-full ${
            !forwardConnected ? 'border-b border-dashed border-current bg-transparent' : 'bg-current'
          }`}
        />
        <span className="-ml-1 font-sans text-[11px]">►</span>
      </div>

      {label && (
        <span className="text-[8px] font-mono font-semibold text-slate-400 dark:text-slate-500 my-0.5">
          {label}
        </span>
      )}

      {/* Backward link: PREV (Right to Left) */}
      <div
        className={`flex items-center text-[10px] font-mono font-bold -mt-0.5 transition-all ${
          isPrevActive
            ? 'text-amber-500 dark:text-amber-400 animate-pulse font-extrabold scale-110'
            : !backwardConnected
            ? 'text-slate-300 dark:text-slate-700 border-dashed'
            : isHighlighted
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-slate-500 dark:text-slate-400'
        }`}
        title="Backward link (PREV: right to left)"
      >
        <span className="-mr-1 font-sans text-[11px]">◄</span>
        <span
          className={`h-[2px] w-5 sm:w-7 rounded-full ${
            !backwardConnected ? 'border-b border-dashed border-current bg-transparent' : 'bg-current'
          }`}
        />
      </div>
    </div>
  );
};

// Terminating Null Pointer Badge (for HEAD.prev and TAIL.next)
export const NullPointerBadge: React.FC<{
  direction: 'left' | 'right';
  isHighlighted?: boolean;
  isConnected?: boolean;
  onClick?: () => void;
}> = ({ direction, isHighlighted = false, isConnected = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-1 py-1 select-none ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {direction === 'right' && (
        <div
          className={`flex items-center text-xs transition-colors ${
            isHighlighted
              ? 'text-amber-500 dark:text-amber-400 font-bold scale-110'
              : !isConnected
              ? 'text-slate-300 dark:text-slate-700'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <span
            className={`h-[2px] w-3 sm:w-4 rounded-full ${
              !isConnected ? 'border-b border-dashed border-current bg-transparent' : 'bg-current'
            }`}
          />
          <span className="-ml-1 font-sans text-[10px]">►</span>
        </div>
      )}

      <div
        className={`px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all ${
          isHighlighted
            ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/50 animate-pulse scale-105'
            : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        NULL
      </div>

      {direction === 'left' && (
        <div
          className={`flex items-center text-xs transition-colors ${
            isHighlighted
              ? 'text-amber-500 dark:text-amber-400 font-bold scale-110'
              : !isConnected
              ? 'text-slate-300 dark:text-slate-700'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <span className="-mr-1 font-sans text-[10px]">◄</span>
          <span
            className={`h-[2px] w-3 sm:w-4 rounded-full ${
              !isConnected ? 'border-b border-dashed border-current bg-transparent' : 'bg-current'
            }`}
          />
        </div>
      )}
    </div>
  );
};

