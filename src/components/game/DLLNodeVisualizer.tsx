import React from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight } from 'lucide-react';

export interface VisualDLLNode {
  id: string;
  data: string | number;
  prevVal?: string | null;
  nextVal?: string | null;
  address?: string;
  isHead?: boolean;
  isTail?: boolean;
  highlight?: boolean;
  highlightColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue';
  isFading?: boolean;
  isNew?: boolean;
}

interface DLLNodeVisualizerProps {
  nodes: VisualDLLNode[];
  showHeadTail?: boolean;
  showNullBoundaries?: boolean;
  highlightedPointer?: string | null; // e.g. "10.next", "20.prev"
  activeNodeId?: string | null;
}

export const DLLNodeVisualizer: React.FC<DLLNodeVisualizerProps> = ({
  nodes,
  showHeadTail = true,
  showNullBoundaries = true,
  highlightedPointer = null,
  activeNodeId = null,
}) => {
  return (
    <div className="w-full flex items-center justify-center overflow-x-auto py-8 px-4">
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Left NULL Boundary */}
        {showNullBoundaries && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              NULL
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-sm">
              ⇄
            </span>
          </div>
        )}

        {/* Nodes Sequence */}
        {nodes.map((node, index) => {
          const isActive = activeNodeId === node.id || node.highlight;
          const isFirst = index === 0;
          const isLast = index === nodes.length - 1;

          return (
            <React.Fragment key={node.id}>
              {/* The DLL Node Box */}
              <div
                className={`relative flex flex-col items-center transition-all duration-300 ${
                  node.isFading ? 'opacity-30 scale-95 line-through' : ''
                } ${node.isNew ? 'animate-bounce' : ''}`}
              >
                {/* HEAD Indicator (Above) */}
                {showHeadTail && (node.isHead || isFirst) && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-sm">
                      HEAD
                    </span>
                    <span className="text-indigo-600 text-[10px] leading-none">▼</span>
                  </div>
                )}

                {/* TAIL Indicator (Above/Below) */}
                {showHeadTail && (node.isTail || isLast) && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-emerald-600 text-[10px] leading-none">▲</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-sm">
                      TAIL
                    </span>
                  </div>
                )}

                {/* The 3-field Box: [ PREV | DATA | NEXT ] */}
                <div
                  className={`flex items-stretch rounded-xl border-2 transition-all duration-300 shadow-sm overflow-hidden ${
                    isActive
                      ? 'border-indigo-600 ring-4 ring-indigo-500/20 shadow-lg scale-105 bg-white dark:bg-slate-900'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {/* PREV Section */}
                  <div
                    className={`px-2.5 py-3 border-r flex flex-col items-center justify-center transition-colors ${
                      highlightedPointer === `${node.id}.prev`
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      PREV
                    </span>
                    <span className="text-[11px] font-mono font-bold mt-0.5 text-indigo-600 dark:text-indigo-400">
                      {node.prevVal !== undefined ? (node.prevVal === null ? 'NULL' : node.prevVal) : '•'}
                    </span>
                  </div>

                  {/* DATA Section */}
                  <div className="px-4 py-3 min-w-[56px] flex flex-col items-center justify-center bg-indigo-50/40 dark:bg-indigo-950/20">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      DATA
                    </span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">
                      {node.data}
                    </span>
                  </div>

                  {/* NEXT Section */}
                  <div
                    className={`px-2.5 py-3 border-l flex flex-col items-center justify-center transition-colors ${
                      highlightedPointer === `${node.id}.next`
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      NEXT
                    </span>
                    <span className="text-[11px] font-mono font-bold mt-0.5 text-indigo-600 dark:text-indigo-400">
                      {node.nextVal !== undefined ? (node.nextVal === null ? 'NULL' : node.nextVal) : '•'}
                    </span>
                  </div>
                </div>

                {/* Node Address tag */}
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                  {node.address || `0x${node.data}00`}
                </span>
              </div>

              {/* Bidirectional Connector between nodes */}
              {index < nodes.length - 1 && (
                <div className="flex flex-col items-center justify-center px-1 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                    <span className="text-xs">⇄</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Right NULL Boundary */}
        {showNullBoundaries && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 dark:text-slate-500 font-mono text-sm">
              ⇄
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              NULL
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
