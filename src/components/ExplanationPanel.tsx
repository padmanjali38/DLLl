import React from 'react';
import { GameState, LevelConfig } from '../types/game';
import { Info, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ExplanationPanelProps {
  level: LevelConfig;
  gameState: GameState;
  currentKey: number | null;
  calculatedIndex: number | null;
  targetIndex: number | null;
  probingIndex: number | null;
  isProbing: boolean;
  probeStepNumber: number;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  level,
  gameState,
  currentKey,
  calculatedIndex,
  targetIndex,
  probingIndex,
  isProbing,
  probeStepNumber,
}) => {
  let title = 'STEP 1: COMPUTE TARGET NODE POSITION';
  let message = 'Calculate the node index formula to find the target link position in the Doubly Linked List.';
  let icon = <Info className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />;

  if (gameState === 'INDEX_FOUND' || (calculatedIndex !== null && !isProbing)) {
    title = `Target Found: Node [${calculatedIndex < 10 ? `0${calculatedIndex}` : calculatedIndex}]`;
    message = `Key ${currentKey} maps to Node position ${calculatedIndex}. Drag the node card or click the slot to execute the pointer linkage!`;
    icon = <ArrowRight className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />;
  } else if (gameState === 'COLLISION_PAUSE') {
    title = 'Node Position Occupied!';
    message = `Position ${calculatedIndex} already contains a node. We will rewire the pointers to maintain the chain.`;
    icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
  } else if (isProbing || gameState === 'PROBING_INTERACTION') {
    title = `Pointer Rewiring: ${level.title}`;
    if (level.technique === 'insert_head') {
      message = `Prepend operation: newNode.next = head; head.prev = newNode; head = newNode (O(1)).`;
    } else if (level.technique === 'insert_tail') {
      message = `Append operation: tail.next = newNode; newNode.prev = tail; tail = newNode (O(1)).`;
    } else if (level.technique === 'bidirectional') {
      message = `Bi-directional traversal: Navigate using forward (curr.next) and backward (curr.prev) links.`;
    } else if (level.technique === 'insert_position') {
      message = `4-Pointer Middle Insertion: Rewire newNode.next, newNode.prev, prev.next, and next.prev.`;
    } else if (level.technique === 'delete_node') {
      message = `Bypass Deletion: target.prev.next = target.next; target.next.prev = target.prev.`;
    } else {
      message = `Execute pointer rewiring to update the Doubly Linked List structure safely.`;
    }
    icon = <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />;
  } else if (gameState === 'CHAIN_CONNECTING') {
    title = 'Bi-directional Link Complete';
    message = `Node ${currentKey} successfully linked with updated prev and next pointers in O(1) time.`;
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white mb-0.5">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
