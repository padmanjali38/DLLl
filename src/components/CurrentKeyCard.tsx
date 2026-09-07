import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, Sparkles, Check, HelpCircle, GripVertical } from 'lucide-react';
import { GameState, LevelConfig } from '../types/game';
import { soundManager } from '../utils/audio';

interface CurrentKeyCardProps {
  currentKey: number | null;
  level: LevelConfig;
  gameState: GameState;
  calculatedIndex: number | null;
  targetIndex: number | null;
  isCalculating: boolean;
  onCalculate: () => void;
  onSubmitManualAnswer: (answer: number) => boolean;
  onAutoPlace: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  probeStepNumber?: number;
  probeFormulaStr?: string;
  isProbing?: boolean;
}

export const CurrentKeyCard: React.FC<CurrentKeyCardProps> = ({
  currentKey,
  level,
  gameState,
  calculatedIndex,
  targetIndex,
  isCalculating,
  onCalculate,
  onSubmitManualAnswer,
  onAutoPlace,
  onDragStart,
  onDragEnd,
  probeStepNumber = 0,
  probeFormulaStr = '',
  isProbing = false,
}) => {
  const [manualInput, setManualInput] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    setManualInput('');
    setInputError(null);
    setShowHint(false);
  }, [currentKey, level.id]);

  if (currentKey === null) {
    return (
      <div className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
          Level complete or waiting for next key...
        </p>
      </div>
    );
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const num = parseInt(manualInput.trim(), 10);
    if (isNaN(num)) return;

    const isCorrect = onSubmitManualAnswer(num);
    if (!isCorrect) {
      setInputError(`Incorrect remainder. Calculate: ${currentKey} % ${level.tableSize}`);
    } else {
      setInputError(null);
    }
  };

  const isCalculated = calculatedIndex !== null;

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-200">
        {/* Top bar with level formula indicator */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-[#0B1120] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] dark:bg-blue-400 animate-pulse shadow-xs" />
            Active Key Processor
          </span>
          <span className="bg-white dark:bg-[#111827] px-2.5 py-1 rounded-lg border border-blue-100 dark:border-slate-800 font-mono font-bold text-xs text-[#2563EB] dark:text-blue-300 shadow-2xs">
            Formula: {level.formulaDisplay}
          </span>
        </div>

        <div className="p-5 sm:p-7 flex flex-col items-center gap-5">
          {/* Key Visual Card */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
            {/* Draggable Key Badge with Subtle Depth */}
            <div
              id="active-draggable-key"
              draggable={isCalculated}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              className={`relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 transition-all duration-150 select-none ${
                isCalculated
                  ? 'bg-primary-gradient text-white border-transparent shadow-md shadow-primary-gradient ring-4 ring-blue-100 dark:ring-blue-500/20 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95'
                  : 'bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border-dashed shadow-2xs'
              }`}
            >
              {isCalculated && (
                <div className="absolute top-2.5 right-2.5 text-white/80">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
              <span className={`text-[10px] uppercase tracking-widest font-bold font-mono ${isCalculated ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                Incoming Key
              </span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-inherit">
                {currentKey}
              </span>
              {isCalculated && (
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 mt-1 rounded-md uppercase font-mono tracking-wider backdrop-blur-xs">
                  Drag to slot
                </span>
              )}
            </div>

            {/* Middle Formula / Calculation Area */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5 w-full">
              {!isCalculated ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#2563EB] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40 font-mono shadow-2xs">
                      Step 1: Compute Modulo Index
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{currentKey}</span>
                    <span className="text-[#2563EB] dark:text-blue-400 font-black">%</span>
                    <span>{level.tableSize}</span>
                    <span className="text-slate-400 dark:text-slate-500">=</span>
                    <span className="text-[#2563EB] dark:text-blue-400 font-extrabold">?</span>
                  </div>

                  {/* Manual calculation form or Auto Calculate */}
                  <form onSubmit={handleManualSubmit} className="flex flex-wrap items-center gap-2 mt-1 w-full">
                    <input
                      id="input-modulus-answer"
                      type="number"
                      min="0"
                      max={level.tableSize - 1}
                      placeholder="Remainder"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="w-28 px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-center font-bold text-base focus:border-[#2563EB] dark:focus:border-blue-400 focus:outline-hidden shadow-2xs"
                    />
                    <button
                      id="btn-submit-modulus"
                      type="submit"
                      className="btn-modern-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Check
                    </button>
                    <button
                      id="btn-auto-calculate"
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onCalculate();
                      }}
                      disabled={isCalculating}
                      className="btn-modern-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                      {isCalculating ? 'Computing...' : 'Auto-Compute'}
                    </button>
                  </form>

                  {inputError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{inputError}</p>
                  )}
                </>
              ) : (
                /* Once Calculated */
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/30 flex items-center gap-1.5 font-mono shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" /> Target Hash Computed
                    </span>
                  </div>

                  <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{currentKey} % {level.tableSize}</span>
                    <ArrowRight className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
                    <span className="px-3.5 py-1 bg-primary-gradient text-white font-bold text-lg rounded-xl shadow-xs dark:shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-transparent">
                      Index [{calculatedIndex < 10 ? `0${calculatedIndex}` : calculatedIndex}]
                    </span>
                  </div>

                  {isProbing && probeFormulaStr && (
                    <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 w-full text-xs text-slate-900 dark:text-slate-200 shadow-2xs">
                      <div className="font-bold flex items-center gap-1.5 text-[#2563EB] dark:text-blue-300 uppercase font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        Probe Step #{probeStepNumber}
                      </div>
                      <div className="font-mono text-xs mt-1 font-bold text-slate-800 dark:text-slate-200">{probeFormulaStr}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="btn-auto-place-key"
                      onClick={() => {
                        soundManager.playPrimaryClick();
                        onAutoPlace();
                      }}
                      className="btn-modern-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Place in Slot
                    </button>
                    <button
                      onClick={() => {
                        if (!showHint) soundManager.playPanelOpen();
                        else soundManager.playPanelClose();
                        setShowHint(!showHint);
                      }}
                      className="btn-modern-secondary p-2 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
                      title="Hint"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>

                  {showHint && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0B1120] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      Tip: Click on cell <strong className="text-[#2563EB] dark:text-blue-400 font-mono">[{targetIndex ?? calculatedIndex}]</strong> directly or drag the key into it!
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
