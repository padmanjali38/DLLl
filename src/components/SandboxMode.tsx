import React, { useState } from 'react';
import { TableSlot, TechniqueType } from '../types/game';
import { calculateBaseHash, calculateH2 } from '../utils/hashAlgorithms';
import { soundManager } from '../utils/audio';
import { HashCell } from './HashCell';
import { ArrowRight, Plus, Shuffle, Search, Trash2, BookOpen } from 'lucide-react';
import { progressManager } from '../utils/progressManager';

interface SandboxModeProps {
  onExit: () => void;
  onOpenTheory?: () => void;
  initialTechnique?: TechniqueType;
  initialTableSize?: number;
}

export const SandboxMode: React.FC<SandboxModeProps> = ({
  onExit,
  onOpenTheory,
  initialTechnique = 'linear',
  initialTableSize = 10,
}) => {
  const [tableSize, setTableSize] = useState<number>(initialTableSize);
  const [technique, setTechnique] = useState<TechniqueType>(initialTechnique);
  const [slots, setSlots] = useState<TableSlot[]>(() =>
    Array.from({ length: initialTableSize }, (_, i) => ({
      index: i,
      items: [],
      status: 'idle',
    }))
  );
  const [inputKey, setInputKey] = useState<string>('');
  const [searchKey, setSearchKey] = useState<string>('');
  const [logMessages, setLogMessages] = useState<string[]>([
    'Sandbox initialized. Insert any integer or click "Random Key" to observe probing.',
  ]);
  const [searchPath, setSearchPath] = useState<number[]>([]);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);

  const resetTableWithSize = (size: number | string) => {
    soundManager.playReset();
    const parsed = Number(size);
    const safeSize = Math.max(3, Math.min(30, Number.isFinite(parsed) ? Math.floor(parsed) : 10));
    setTableSize(safeSize);
    setSlots(
      Array.from({ length: safeSize }, (_, i) => ({
        index: i,
        items: [],
        status: 'idle',
      }))
    );
    setSearchPath([]);
    setActiveHighlightIndex(null);
    setLogMessages([`Table reset with capacity m = ${safeSize}.`]);
  };

  const totalKeys = slots.reduce((acc, s) => acc + s.items.length, 0);
  const currentCapacity = Math.max(3, Math.min(30, Number.isFinite(Number(tableSize)) ? Math.floor(Number(tableSize)) : 10));
  const loadFactor = (totalKeys / currentCapacity).toFixed(2);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [msg, ...prev.slice(0, 7)]);
  };

  const handleInsert = (keyToInsert?: number | string) => {
    if (keyToInsert === undefined && (inputKey === '' || inputKey.trim() === '')) return;
    const rawVal = keyToInsert !== undefined ? Number(keyToInsert) : Number(inputKey.trim());
    if (!Number.isFinite(rawVal) || isNaN(rawVal) || Math.abs(rawVal) > 999999) return;
    const val = Math.floor(rawVal);
    const numericTableSize = Number(tableSize);
    const m = Number.isFinite(numericTableSize) && numericTableSize > 0 ? Math.floor(numericTableSize) : slots.length;

    progressManager.recordSandboxOp();

    const baseHash = calculateBaseHash(val, m);
    const newSlots = [...slots.map((s) => ({ ...s, items: [...s.items] }))];

    if (technique === 'chaining') {
      newSlots[baseHash].items.push({ id: `${val}-${Date.now()}`, value: val });
      setSlots(newSlots);
      setActiveHighlightIndex(baseHash);
      setSearchPath([]);
      soundManager.playChain();
      addLog(`Inserted key ${val} into Bucket [${baseHash}] via formula: ${val} % ${m} = ${baseHash} (Chain depth: ${newSlots[baseHash].items.length})`);
    } else if (technique === 'linear') {
      let inserted = false;
      for (let i = 0; i < m; i++) {
        const target = (baseHash + i) % m;
        if (newSlots[target].items.length === 0) {
          newSlots[target].items.push({ id: `${val}-${Date.now()}`, value: val, probesCount: i });
          inserted = true;
          setSlots(newSlots);
          setActiveHighlightIndex(target);
          setSearchPath([]);
          soundManager.playInsert();
          addLog(i === 0 
            ? `Inserted key ${val} at initial Index [${target}] via: ${val} % ${m} = ${target}`
            : `Inserted key ${val} at Index [${target}] after ${i} probe(s) via: (${baseHash} + ${i}) % ${m} = ${target}`
          );
          break;
        }
      }
      if (!inserted) {
        soundManager.playError();
        addLog(`Table capacity (${m}) saturated! Could not insert key ${val}.`);
      }
    } else if (technique === 'quadratic') {
      let inserted = false;
      for (let i = 0; i < m; i++) {
        const jump = i * i;
        const target = (baseHash + jump) % m;
        if (newSlots[target].items.length === 0) {
          newSlots[target].items.push({ id: `${val}-${Date.now()}`, value: val, probesCount: i });
          inserted = true;
          setSlots(newSlots);
          setActiveHighlightIndex(target);
          setSearchPath([]);
          soundManager.playInsert();
          addLog(i === 0
            ? `Inserted key ${val} at initial Index [${target}] via: ${val} % ${m} = ${target}`
            : `Inserted key ${val} at Index [${target}] after ${i} quadratic jump(s) via: (${baseHash} + ${i}²) % ${m} = (${baseHash} + ${jump}) % ${m} = ${target}`
          );
          break;
        }
      }
      if (!inserted) {
        soundManager.playError();
        addLog(`Could not find open slot via quadratic probing for key ${val} in table of size ${m}.`);
      }
    } else if (technique === 'double_hashing') {
      const h2 = calculateH2(val, undefined, m);
      let inserted = false;
      for (let i = 0; i < m; i++) {
        const target = (baseHash + i * h2) % m;
        if (newSlots[target].items.length === 0) {
          newSlots[target].items.push({ id: `${val}-${Date.now()}`, value: val, probesCount: i });
          inserted = true;
          setSlots(newSlots);
          setActiveHighlightIndex(target);
          setSearchPath([]);
          soundManager.playInsert();
          addLog(i === 0
            ? `Inserted key ${val} at initial Index [${target}] via: h1(${val}) = ${val} % ${m} = ${target}`
            : `Inserted key ${val} at Index [${target}] after ${i} step(s) with h2=${h2} via: (${baseHash} + ${i} × ${h2}) % ${m} = ${target}`
          );
          break;
        }
      }
      if (!inserted) {
        soundManager.playError();
        addLog(`Could not insert key ${val} via double hashing in table of size ${m}.`);
      }
    }

    setInputKey('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKey === '' || searchKey.trim() === '') return;
    const rawVal = Number(searchKey.trim());
    if (!Number.isFinite(rawVal) || isNaN(rawVal) || Math.abs(rawVal) > 999999) return;
    const val = Math.floor(rawVal);
    const numericTableSize = Number(tableSize);
    const m = Number.isFinite(numericTableSize) && numericTableSize > 0 ? Math.floor(numericTableSize) : slots.length;

    soundManager.playSearch();
    progressManager.recordSandboxOp();

    const baseHash = calculateBaseHash(val, m);
    const path: number[] = [];

    if (technique === 'chaining') {
      path.push(baseHash);
      const found = slots[baseHash].items.some((it) => it.value === val);
      setSearchPath(path);
      setActiveHighlightIndex(baseHash);
      if (found) {
        soundManager.playSearchSuccess();
        addLog(`Key ${val} FOUND in Bucket [${baseHash}] chain (${val} % ${m} = ${baseHash})!`);
      } else {
        soundManager.playSearchFailure();
        addLog(`Key ${val} NOT FOUND in Bucket [${baseHash}] (${val} % ${m} = ${baseHash}).`);
      }
    } else {
      let found = false;
      const h2 = calculateH2(val, undefined, m);
      for (let i = 0; i < m; i++) {
        let target = baseHash;
        if (technique === 'linear') target = (baseHash + i) % m;
        else if (technique === 'quadratic') target = (baseHash + i * i) % m;
        else if (technique === 'double_hashing') target = (baseHash + i * h2) % m;

        path.push(target);
        if (slots[target].items.some((it) => it.value === val)) {
          found = true;
          setActiveHighlightIndex(target);
          soundManager.playSearchSuccess();
          addLog(`Key ${val} FOUND at Index [${target}] after ${i} probe(s) using table size ${m}!`);
          break;
        }
        if (slots[target].items.length === 0) {
          break;
        }
      }
      setSearchPath(path);
      if (!found) {
        soundManager.playSearchFailure();
        addLog(`Key ${val} NOT FOUND in table of size ${m}. Checked path: [${path.join(' → ')}].`);
      }
    }
  };


  const handleRandomInsert = () => {
    soundManager.playRandom();
    const rand = Math.floor(Math.random() * 90) + 10;
    handleInsert(rand);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900 dark:text-white animate-page-enter">
      {/* Header & Controls in Modern Dashboard Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter break-words">
                Hash Table Experimentation Lab
              </h2>
              <span className="text-xs uppercase font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-slate-800 text-[#2563EB] dark:text-blue-300 rounded-lg font-mono shadow-2xs">
                Interactive Lab
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 break-words">
              Experiment freely with custom table capacities, resolution algorithms, search paths, and load factor thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTheory && (
              <button
                id="btn-sandbox-theory"
                onClick={() => {
                  soundManager.playSecondaryClick();
                  onOpenTheory();
                }}
                className="btn-modern-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                <span>Theory Guide</span>
              </button>
            )}
            <button
              id="btn-sandbox-exit"
              onClick={() => {
                soundManager.playPrimaryClick();
                onExit();
              }}
              className="btn-modern-primary px-3.5 py-2 text-xs font-semibold cursor-pointer shadow-xs"
            >
              ← Return to Quest
            </button>
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Table Size */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono">Table Size (m):</label>
            <select
              id="select-sandbox-tablesize"
              value={tableSize}
              onChange={(e) => {
                soundManager.playSelect();
                resetTableWithSize(Number(e.target.value));
              }}
              className="w-full p-2.5 bg-slate-50/80 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:border-[#2563EB] dark:focus:border-blue-400 focus:outline-hidden cursor-pointer font-mono shadow-2xs"
            >
              <option value={5}>5 (Prime)</option>
              <option value={7}>7 (Prime)</option>
              <option value={8}>8 (Even / 2³)</option>
              <option value={10}>10 (Standard)</option>
              <option value={11}>11 (Prime)</option>
              <option value={13}>13 (Prime)</option>
              <option value={17}>17 (Prime)</option>
              <option value={19}>19 (Prime)</option>
            </select>
          </div>

          {/* Algorithm Strategy */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono">Collision Resolution:</label>
            <select
              id="select-sandbox-technique"
              value={technique}
              onChange={(e) => {
                soundManager.playSelect();
                setTechnique(e.target.value as TechniqueType);
              }}
              className="w-full p-2.5 bg-slate-50/80 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:border-[#2563EB] dark:focus:border-blue-400 focus:outline-hidden cursor-pointer shadow-2xs"
            >
              <option value="chaining">Separate Chaining</option>
              <option value="linear">Linear Probing (+1)</option>
              <option value="quadratic">Quadratic Probing (+i²)</option>
              <option value="double_hashing">Double Hashing (Dual Hash)</option>
            </select>
          </div>

          {/* Load Factor Stats */}
          <div className="p-3 bg-slate-50/80 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between shadow-2xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono">Load Factor (α = n/m)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-[#2563EB] dark:text-cyan-400 font-mono">{loadFactor}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-medium">({totalKeys}/{tableSize} items)</span>
            </div>
          </div>

          {/* Quick Clear */}
          <div className="flex items-end">
            <button
              onClick={() => {
                soundManager.playClear();
                resetTableWithSize(tableSize);
              }}
              className="w-full p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase font-mono shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Table
            </button>
          </div>
        </div>

        {/* Dynamic Formula Display Bar */}
        <div className="mt-3.5 p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-2xs">
          <span className="text-slate-600 dark:text-slate-400 font-semibold uppercase text-[11px]">Active Formula (m = {tableSize}):</span>
          <span className="font-bold text-[#2563EB] dark:text-cyan-300 bg-white dark:bg-[#0B1120] px-2.5 py-1 rounded-lg border border-blue-100 dark:border-slate-800 shadow-2xs">
            {technique === 'chaining' && `h(k) = k mod ${tableSize}`}
            {technique === 'linear' && `h(k, i) = (k mod ${tableSize} + i) mod ${tableSize}`}
            {technique === 'quadratic' && `h(k, i) = (k mod ${tableSize} + i²) mod ${tableSize}`}
            {technique === 'double_hashing' && `h(k, i) = (k mod ${tableSize} + i × h₂(k)) mod ${tableSize}`}
          </span>
        </div>

        {/* Input & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Key (e.g. 42)"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
              className="w-32 px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-[#2563EB] dark:focus:border-blue-400 focus:outline-hidden shadow-2xs"
            />
            <button
              id="btn-sandbox-insert"
              onClick={() => handleInsert()}
              className="btn-modern-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Insert
            </button>
            <button
              id="btn-sandbox-random"
              onClick={handleRandomInsert}
              className="btn-modern-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" /> Random
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 ml-auto">
            <input
              type="number"
              placeholder="Search Key"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-32 px-3 py-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-[#2563EB] dark:focus:border-blue-400 focus:outline-hidden shadow-2xs"
            />
            <button
              id="btn-sandbox-search"
              type="submit"
              className="btn-modern-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Search
            </button>
          </form>
        </div>
      </div>

      {/* Hash Table Visual Row */}
      <div className="bg-white dark:bg-[#111827] border-2 border-blue-100/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-md shadow-blue-900/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase font-mono">
            Hash Table Array (Load = {loadFactor})
          </span>
          {searchPath.length > 0 && (
            <span className="text-xs font-semibold text-[#2563EB] dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-100 dark:border-slate-800 font-mono shadow-2xs">
              Search Path: [{searchPath.join(' → ')}]
            </span>
          )}
        </div>

        <div className="w-full bg-slate-50/70 dark:bg-transparent border border-slate-200/70 dark:border-transparent rounded-xl p-2.5 sm:p-3.5 overflow-x-auto pb-4 pt-3">
          <div className="flex items-start justify-center gap-2.5 min-w-max px-1">
            {slots.map((slot) => {
              const isSearched = searchPath.includes(slot.index);
              const isActiveFound = activeHighlightIndex === slot.index;

              return (
                <HashCell
                  key={slot.index}
                  slot={slot}
                  technique={technique}
                  isTarget={isActiveFound}
                  isProbingTarget={isSearched}
                  isCollided={false}
                  incomingKey={null}
                  onCellClick={() => {}}
                  onDropKey={() => {}}
                />
              );
            })}
          </div>
        </div>

        {/* Chained Linked List Overview for Sandbox */}
        {technique === 'chaining' && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase font-mono">Separate Chaining Buckets:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {slots
                .filter((s) => s.items.length > 0)
                .map((s) => (
                  <div
                    key={s.index}
                    className="flex items-center gap-2 p-2.5 bg-slate-50/80 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl text-xs overflow-x-auto shadow-2xs"
                  >
                    <span className="font-bold text-white bg-[#2563EB] dark:bg-blue-600 px-2 py-0.5 rounded-md shrink-0 font-mono shadow-xs">
                      [{s.index < 10 ? `0${s.index}` : s.index}]
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 shrink-0">:</span>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono">
                      {s.items.map((item, idx) => (
                        <React.Fragment key={item.id || idx}>
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-[#2563EB] dark:text-cyan-400 shrink-0" />}
                          <span className="px-2.5 py-0.5 bg-white dark:bg-black border border-blue-200/80 dark:border-slate-800 rounded-md font-bold text-slate-900 dark:text-white shadow-2xs">
                            {item.value}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-xs">
        <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-between font-mono">
          <span>Execution Log Audit Trail</span>
          <span className="text-[10px] text-[#2563EB] dark:text-cyan-300 font-bold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-slate-800 shadow-2xs">
            Live Stream
          </span>
        </div>
        <div className="space-y-1.5 font-mono">
          {logMessages.map((msg, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#2563EB] dark:text-blue-400 font-bold select-none">&gt;</span>
              <span className={i === 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}>{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
