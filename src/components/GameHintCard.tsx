import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { GameState, LevelConfig, ProbeStep } from '../types/game';
import { soundManager } from '../utils/audio';

interface GameHintCardProps {
  level: LevelConfig;
  gameState: GameState;
  currentKey: number | null;
  calculatedIndex: number | null;
  targetIndex: number | null;
  isProbing: boolean;
  probeStepNumber: number;
  currentProbeStep?: ProbeStep;
}

export const GameHintCard: React.FC<GameHintCardProps> = ({
  level,
  gameState,
  currentKey,
  calculatedIndex,
  targetIndex,
  isProbing,
  probeStepNumber,
  currentProbeStep,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (currentKey === null) return null;

  // Determine dynamic contextual guidance based on exact game state
  const getContextualHint = (): { stage: string; instruction: string; formulaTip?: string } => {
    // Stage 1: Key has appeared, hash not yet calculated
    if (calculatedIndex === null || gameState === 'KEY_APPEARS' || gameState === 'CALCULATING') {
      return {
        stage: 'STEP 1: COMPUTE HASH INDEX',
        instruction: `First divide key ${currentKey} by table size ${level.tableSize}. Find the integer remainder (${currentKey} % ${level.tableSize}) to determine which bucket to check.`,
        formulaTip: `h(${currentKey}) = ${currentKey} mod ${level.tableSize}`,
      };
    }

    // Stage 2: Probing active (Collision resolution in progress)
    if (isProbing) {
      if (level.technique === 'linear') {
        return {
          stage: 'STEP 2: LINEAR PROBING RESOLUTION',
          instruction: `The bucket is occupied. Check the immediately adjacent slot (+1). If that slot is also occupied, advance sequentially until an empty slot is located.`,
          formulaTip: `Next Index = (${calculatedIndex} + ${probeStepNumber}) mod ${level.tableSize}`,
        };
      }
      if (level.technique === 'quadratic') {
        const jump = probeStepNumber * probeStepNumber;
        return {
          stage: 'STEP 2: QUADRATIC PROBING RESOLUTION',
          instruction: `The bucket is occupied. Quadratic probing leaps over crowded clusters using square numbers (+1, +4, +9...). Compute the next squared offset.`,
          formulaTip: `Next Index = (${calculatedIndex} + ${probeStepNumber}²) mod ${level.tableSize} [jump = +${jump}]`,
        };
      }
      if (level.technique === 'double_hashing') {
        return {
          stage: 'STEP 2: DOUBLE HASHING RESOLUTION',
          instruction: `The bucket is occupied. Use the secondary hash function h₂(key) to calculate your individualized jump step size, then leap by that stride.`,
          formulaTip: `Next Index = (h₁(${currentKey}) + ${probeStepNumber} × h₂(${currentKey})) mod ${level.tableSize}`,
        };
      }
      if (level.technique === 'chaining') {
        return {
          stage: 'STEP 2: SEPARATE CHAINING RESOLUTION',
          instruction: `The home bucket [${calculatedIndex}] is already occupied. In separate chaining, do not search other buckets—simply attach ${currentKey} as a linked node to this bucket's chain.`,
          formulaTip: `Bucket[${calculatedIndex}] → [Existing Node] → [${currentKey}] → NULL`,
        };
      }
    }

    // Stage 3: Index calculated, checking bucket
    if (gameState === 'INDEX_FOUND' || gameState === 'DRAGGING_KEY' || gameState === 'CHECKING_SLOT') {
      return {
        stage: 'STEP 2: INSPECT TARGET BUCKET',
        instruction: `The hash function produced index [${calculatedIndex}]. Click bucket [${calculatedIndex}] or drag key ${currentKey} to it. If empty, the key is placed directly.`,
        formulaTip: `Target Slot = [${calculatedIndex}]`,
      };
    }

    // Default guidance
    return {
      stage: 'GUIDANCE',
      instruction: `Follow the formula and inspect the target bucket. If a collision occurs, apply the ${level.technique} resolution method.`,
    };
  };

  const hint = getContextualHint();

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden transition-all">
        {/* Hint Header / Toggle Button */}
        <button
          type="button"
          onClick={() => {
            if (!isExpanded) soundManager.playPanelOpen();
            else soundManager.playPanelClose();
            setIsExpanded(!isExpanded);
          }}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-100/70 dark:hover:bg-[#1E293B] transition-colors cursor-pointer text-left select-none"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Lightbulb className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
              Field Hint // What should I do next?
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono">
            <span className="hidden sm:inline text-[11px] uppercase">
              {isExpanded ? 'Hide Hint' : 'Show Hint'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </div>
        </button>

        {/* Expandable Hint Body */}
        {isExpanded && (
          <div className="p-4 space-y-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111827] animate-chapter-switch">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-300 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded-md border border-blue-100 dark:border-blue-900/40">
                {hint.stage}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Level {level.id} Assistant</span>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {hint.instruction}
            </p>

            {hint.formulaTip && (
              <div className="bg-[#F8FAFC] dark:bg-[#0B1120] text-[#111827] dark:text-blue-300 px-3 py-2 rounded-xl text-xs font-mono font-bold border border-[#E5E7EB] dark:border-slate-800 border-l-4 border-l-[#2563EB] dark:border-l-blue-500 overflow-x-auto">
                <code>{hint.formulaTip}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
