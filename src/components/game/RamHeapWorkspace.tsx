import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  RotateCcw,
  Undo,
  Redo,
  Lightbulb,
  Zap,
  HelpCircle,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Check,
} from 'lucide-react';
import { HeapNode, GuidedStep } from '../../types/dllGameTypes';

export interface AddressValidationError {
  nodeAddress: number;
  field: 'prev' | 'next';
  currentValue: number | null;
  expectedValue: number | null;
  message: string;
}

interface RamHeapWorkspaceProps {
  nodes: HeapNode[];
  head: number | null;
  tail: number | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onCreateNode: () => void;
  onSetHead: (address?: number | null) => void;
  onSetTail: (address?: number | null) => void;
  onDeleteNode: () => void;
  onUpdateNodeAddress: (nodeId: string, field: 'prev' | 'next', newAddress: number | null) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onShowHint: () => void;
  onShowHowToPlay?: () => void;
  onCheckAnswer: () => void;
  validationError: AddressValidationError | null;
  validationSuccess: string | null;
  isGuidedMode: boolean;
  onToggleGuidedMode: () => void;
  currentGuidedStep: GuidedStep | null;
  currentGuidedStepIndex: number;
  totalGuidedSteps: number;
  onExecuteGuidedNextStep: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// Sub-component for an editable address input field
interface AddressInputProps {
  id: string;
  nodeAddress: number;
  field: 'prev' | 'next';
  value: number | null;
  availableAddresses: number[];
  isError: boolean;
  isCorrect: boolean;
  onChange: (val: number | null) => void;
}

const AddressInputField: React.FC<AddressInputProps> = ({
  id,
  value,
  availableAddresses,
  isError,
  isCorrect,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textVal, setTextVal] = useState(value === null ? 'NULL' : String(value));
  const [showDropdown, setShowDropdown] = useState(false);

  // Keep in sync with prop updates
  React.useEffect(() => {
    setTextVal(value === null ? 'NULL' : String(value));
  }, [value]);

  const handleCommit = (valStr: string) => {
    const trimmed = valStr.trim();
    if (
      trimmed === '' ||
      trimmed.toUpperCase() === 'NULL' ||
      trimmed === '0' ||
      trimmed.toUpperCase() === 'NIL'
    ) {
      onChange(null);
      setTextVal('NULL');
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) {
        onChange(num);
        setTextVal(String(num));
      } else {
        // Revert if completely invalid string
        setTextVal(value === null ? 'NULL' : String(value));
      }
    }
    setIsEditing(false);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 border transition-all ${
          isError
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 text-rose-700 dark:text-rose-300'
            : isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-slate-50 dark:bg-[#060B18] border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 text-slate-900 dark:text-slate-200'
        }`}
      >
        <input
          id={id}
          type="text"
          value={isEditing ? textVal : value === null ? 'NULL' : value}
          onFocus={() => {
            setIsEditing(true);
            setShowDropdown(true);
          }}
          onBlur={(e) => {
            // Delay blur slightly so clicking dropdown item works
            setTimeout(() => {
              handleCommit(e.target.value);
            }, 180);
          }}
          onChange={(e) => setTextVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommit(textVal);
            }
          }}
          className={`w-20 bg-transparent font-mono font-bold text-xs outline-none ${
            value === null
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : isError
              ? 'text-rose-600 dark:text-rose-300 font-extrabold'
              : isCorrect
              ? 'text-emerald-600 dark:text-emerald-300 font-extrabold'
              : 'text-sky-600 dark:text-sky-300 font-bold'
          }`}
          placeholder="e.g. 1002"
        />

        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Select target address"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Pick Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-[#0A1024] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 font-mono text-xs">
          <div className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5">
            Assign Address
          </div>
          <button
            type="button"
            onMouseDown={() => handleCommit('NULL')}
            className={`w-full text-left px-2 py-1 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              value === null
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>NULL (0x0000)</span>
            {value === null && <Check className="w-3 h-3 text-rose-500 dark:text-rose-400" />}
          </button>

          {availableAddresses.map((addr) => (
            <button
              key={addr}
              type="button"
              onMouseDown={() => handleCommit(String(addr))}
              className={`w-full text-left px-2 py-1 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                value === addr
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Address {addr}</span>
              {value === addr && <Check className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const RamHeapWorkspace: React.FC<RamHeapWorkspaceProps> = ({
  nodes,
  head,
  tail,
  selectedNodeId,
  onSelectNode,
  onCreateNode,
  onSetHead,
  onSetTail,
  onDeleteNode,
  onUpdateNodeAddress,
  onUndo,
  onRedo,
  onReset,
  onShowHint,
  onShowHowToPlay,
  onCheckAnswer,
  validationError,
  validationSuccess,
  isGuidedMode,
  onToggleGuidedMode,
  currentGuidedStep,
  currentGuidedStepIndex,
  totalGuidedSteps,
  onExecuteGuidedNextStep,
  canUndo,
  canRedo,
}) => {
  const allAddresses = nodes.map((n) => n.address);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      id="ram-heap-workspace"
      className="flex-1 flex flex-col bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-2xl relative"
    >
      {/* 1. TOP HEADER: RAM HEAP WORKSPACE + HEAD / TAIL REGISTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-mono font-black tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                RAM HEAP WORKSPACE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold">
                {nodes.length} {nodes.length === 1 ? 'Node' : 'Nodes'} in RAM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Direct pointer registers • Edit PREV/NEXT fields to link memory nodes
            </p>
          </div>
        </div>

        {/* Right: HEAD and TAIL status with quick address select */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* HEAD Register */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shadow-xs shadow-sky-400 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400 font-bold">HEAD:</span>
            <select
              id="select-head-address"
              value={head ?? 'NULL'}
              onChange={(e) => {
                const val = e.target.value === 'NULL' ? null : parseInt(e.target.value, 10);
                onSetHead(val);
              }}
              className="bg-transparent font-mono font-extrabold text-xs text-sky-600 dark:text-sky-400 outline-none cursor-pointer"
            >
              <option value="NULL" className="bg-white dark:bg-slate-900 text-rose-500 dark:text-rose-400">
                NULL
              </option>
              {allAddresses.map((addr) => (
                <option key={addr} value={addr} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                  {addr}
                </option>
              ))}
            </select>
          </div>

          {/* TAIL Register */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shadow-xs shadow-amber-400 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400 font-bold">TAIL:</span>
            <select
              id="select-tail-address"
              value={tail ?? 'NULL'}
              onChange={(e) => {
                const val = e.target.value === 'NULL' ? null : parseInt(e.target.value, 10);
                onSetTail(val);
              }}
              className="bg-transparent font-mono font-extrabold text-xs text-amber-600 dark:text-amber-400 outline-none cursor-pointer"
            >
              <option value="NULL" className="bg-white dark:bg-slate-900 text-rose-500 dark:text-rose-400">
                NULL
              </option>
              {allAddresses.map((addr) => (
                <option key={addr} value={addr} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                  {addr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. POINTER TOOLS (Matching Prompt Specification) */}
      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
              POINTER TOOLS
            </span>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              (Allocate nodes, position HEAD/TAIL, edit address fields directly)
            </span>
          </div>
          {selectedNode && (
            <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30">
              Selected: Node {selectedNode.address}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* + Create Node */}
          <button
            id="btn-create-node"
            onClick={onCreateNode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create Node</span>
          </button>

          {/* HEAD pointer */}
          <button
            id="btn-tool-head"
            onClick={() => onSetHead(selectedNode ? selectedNode.address : undefined)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 border border-sky-300 dark:border-cyan-500/40 text-sky-800 dark:text-cyan-300 text-xs font-bold active:scale-95 transition-all cursor-pointer"
            title={selectedNode ? `Set HEAD to Node ${selectedNode.address}` : 'Set HEAD'}
          >
            <ArrowDown className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 stroke-[2.5]" />
            <span>HEAD {selectedNode ? `→ ${selectedNode.address}` : ''}</span>
          </button>

          {/* TAIL pointer */}
          <button
            id="btn-tool-tail"
            onClick={() => onSetTail(selectedNode ? selectedNode.address : undefined)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold active:scale-95 transition-all cursor-pointer"
            title={selectedNode ? `Set TAIL to Node ${selectedNode.address}` : 'Set TAIL'}
          >
            <ArrowUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
            <span>TAIL {selectedNode ? `→ ${selectedNode.address}` : ''}</span>
          </button>

          {/* NEXT pointer helper */}
          <button
            id="btn-tool-next"
            onClick={() => {
              if (selectedNode) {
                // Find next sequential address or next node
                const otherAddresses = allAddresses.filter((a) => a !== selectedNode.address);
                if (otherAddresses.length > 0) {
                  const currentIdx = otherAddresses.indexOf(selectedNode.next ?? -1);
                  const nextTarget = otherAddresses[(currentIdx + 1) % otherAddresses.length];
                  onUpdateNodeAddress(selectedNode.id, 'next', nextTarget);
                }
              }
            }}
            disabled={!selectedNodeId}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300 text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={selectedNodeId ? `Cycle NEXT pointer for Node ${selectedNode?.address}` : 'Select a node first to set NEXT'}
          >
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
            <span>NEXT {selectedNode?.next ? `→ ${selectedNode.next}` : ''}</span>
          </button>

          {/* Delete Node */}
          <button
            id="btn-delete-node"
            onClick={onDeleteNode}
            disabled={!selectedNodeId}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={selectedNodeId ? 'Delete selected node from RAM' : 'Select a node first to delete'}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Delete Node</span>
          </button>

          {/* Reset */}
          <button
            id="btn-reset-workspace"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            title="Reset to task initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Hint */}
          <button
            id="btn-tool-hint"
            onClick={onShowHint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Hint</span>
          </button>

          {/* Check Answer: Prominent Emerald Button */}
          <button
            id="btn-check-answer-workspace"
            onClick={onCheckAnswer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer ml-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check Answer</span>
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC ADDRESS VALIDATION FEEDBACK BANNER (Prompt Specified) */}
      {validationError && (
        <div
          id="address-validation-error-banner"
          className="mt-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/80 shadow-lg text-xs font-mono flex items-start gap-3 animate-fade-in"
        >
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="font-extrabold text-rose-400 uppercase tracking-wide flex items-center gap-2">
              <span>⚠ Incorrect Pointer</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/40 text-rose-300">
                Fix needed on Node {validationError.nodeAddress}.{validationError.field.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed font-sans text-xs">
              {validationError.message}
            </p>
          </div>
        </div>
      )}

      {validationSuccess && !validationError && (
        <div
          id="address-validation-success-banner"
          className="mt-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/80 shadow-lg text-xs font-mono flex items-center gap-3 animate-fade-in"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-emerald-400 uppercase tracking-wide">
              ✓ Correct Pointer Link
            </div>
            <p className="text-slate-200 font-sans text-xs">{validationSuccess}</p>
          </div>
        </div>
      )}

      {/* 4. CANVAS / HEAP VIEWPORT WITH STRUCT NODES & ADDRESS CONNECTIONS */}
      <div className="mt-4 flex-1 min-h-[340px] flex items-center justify-center p-6 bg-slate-50/60 dark:bg-[#070D1E] border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-x-auto">
        {nodes.length === 0 ? (
          /* Empty RAM State */
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl max-w-md w-full bg-white/70 dark:bg-[#090F22]/70">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Linked List is Currently Empty <span className="text-sky-600 dark:text-sky-400">(HEAD == NULL)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
              Click{' '}
              <button
                type="button"
                onClick={onCreateNode}
                className="font-bold text-blue-600 dark:text-blue-400 cursor-pointer underline hover:text-blue-500 inline"
              >
                + Create Node
              </button>{' '}
              above to allocate a new memory node on the RAM heap.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 py-4 min-w-max">
            {/* Left Terminal NULL for HEAD */}
            <div className="flex flex-col items-center shrink-0">
              <div className="px-3 py-2 bg-white dark:bg-[#090F22] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-500 shadow-xs">
                NULL
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                {head !== null ? `(prev of ${head})` : 'unlinked'}
              </span>
            </div>

            {/* Left Arrow from NULL to first node */}
            <div className="flex items-center text-slate-400 dark:text-slate-600 font-mono text-sm px-1">
              <span>◄──►</span>
            </div>

            {/* Nodes Render Loop with Prompt Layout */}
            {nodes.map((node, index) => {
              const isHead = head === node.address;
              const isTail = tail === node.address;
              const isSelected = selectedNodeId === node.id;

              const isPrevError =
                validationError?.nodeAddress === node.address &&
                validationError?.field === 'prev';
              const isNextError =
                validationError?.nodeAddress === node.address &&
                validationError?.field === 'next';

              const isPrevCorrect =
                node.prev !== null &&
                nodes.some((n) => n.address === node.prev) &&
                !isPrevError;
              const isNextCorrect =
                node.next !== null &&
                nodes.some((n) => n.address === node.next) &&
                !isNextError;

              // Check reciprocal connection for visual highlight
              const nextTargetNode = nodes.find((n) => n.address === node.next);
              const isBidirectionalForward =
                nextTargetNode && nextTargetNode.prev === node.address;

              return (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col items-center">
                    {/* Node Card Component Matching Prompt */}
                    <div
                      id={`node-ram-${node.address}`}
                      onClick={() => onSelectNode(isSelected ? null : node.id)}
                      className={`w-52 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col shadow-lg animate-fade-in ${
                        isSelected
                          ? 'border-2 border-indigo-500 ring-4 ring-indigo-500/20 scale-105 bg-indigo-50/50 dark:bg-[#121D3A]'
                          : isTail
                          ? 'border-2 border-amber-500/90 bg-amber-50/40 dark:bg-[#101933] hover:border-amber-400'
                          : isHead
                          ? 'border-2 border-sky-500/90 bg-sky-50/40 dark:bg-[#101933] hover:border-sky-400'
                          : 'border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0F172A] hover:border-slate-400 dark:hover:border-slate-500'
                      }`}
                    >
                      {/* Node Header: "NODE" (left) | "ADDR: 1001" (right) */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 dark:bg-[#192447] border-b border-slate-200 dark:border-slate-700/80">
                        <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                          NODE
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-mono text-[11px] font-black">
                          ADDR:{node.address}
                        </span>
                      </div>

                      {/* Node Body Fields: PREV, DATA, NEXT (Editable) */}
                      <div className="p-3 space-y-2 font-mono text-xs">
                        {/* PREV Field (Editable) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            <span>PREV:</span>
                            {isPrevError ? (
                              <span className="text-rose-600 dark:text-rose-400 font-extrabold animate-pulse">
                                ⚠ Mismatch
                              </span>
                            ) : (
                              node.prev !== null && (
                                <span className="text-purple-600 dark:text-purple-300 text-[10px]">
                                  → {node.prev}
                                </span>
                              )
                            )}
                          </div>
                          <AddressInputField
                            id={`input-prev-${node.address}`}
                            nodeAddress={node.address}
                            field="prev"
                            value={node.prev}
                            availableAddresses={allAddresses.filter((a) => a !== node.address)}
                            isError={isPrevError}
                            isCorrect={isPrevCorrect}
                            onChange={(val) => onUpdateNodeAddress(node.id, 'prev', val)}
                          />
                        </div>

                        {/* DATA Field */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                            DATA:
                          </span>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                            {node.data}
                          </span>
                        </div>

                        {/* NEXT Field (Editable) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-sky-600 dark:text-sky-400">
                            <span>NEXT:</span>
                            {isNextError ? (
                              <span className="text-rose-600 dark:text-rose-400 font-extrabold animate-pulse">
                                ⚠ Mismatch
                              </span>
                            ) : (
                              node.next !== null && (
                                <span className="text-sky-600 dark:text-sky-300 text-[10px]">
                                  → {node.next}
                                </span>
                              )
                            )}
                          </div>
                          <AddressInputField
                            id={`input-next-${node.address}`}
                            nodeAddress={node.address}
                            field="next"
                            value={node.next}
                            availableAddresses={allAddresses.filter((a) => a !== node.address)}
                            isError={isNextError}
                            isCorrect={isNextCorrect}
                            onChange={(val) => onUpdateNodeAddress(node.id, 'next', val)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Attached HEAD / TAIL Badge Beneath Node (Matching Photo) */}
                    <div className="mt-2 flex items-center gap-1.5">
                      {isHead && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-500 text-slate-950 text-[10px] font-mono font-black shadow-md shadow-sky-500/30 animate-fade-in">
                          <ArrowDown className="w-3 h-3 stroke-[3]" />
                          <span>HEAD</span>
                        </div>
                      )}
                      {isTail && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-mono font-black shadow-md shadow-amber-500/30 animate-fade-in">
                          <ArrowUp className="w-3 h-3 stroke-[3]" />
                          <span>TAIL</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Connection Line Generated from Address Values */}
                  {index < nodes.length - 1 && (
                    <div className="flex flex-col items-center justify-center px-2 shrink-0">
                      {isBidirectionalForward ? (
                        <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/40 px-2.5 py-1 rounded-xl shadow-xs animate-pulse">
                          <span className="text-[10px] font-mono font-bold tracking-tight">
                            {node.address} ⇄ {node.next}
                          </span>
                          <span className="text-xs tracking-tighter font-mono">◄─────►</span>
                        </div>
                      ) : node.next !== null && nextTargetNode ? (
                        <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 px-2 py-1 rounded-xl">
                          <span className="text-[9px] font-mono">NEXT → {node.next}</span>
                          <span className="text-xs tracking-tighter font-mono">─────►</span>
                          <span className="text-[8px] font-mono text-amber-600 dark:text-amber-400/90">
                            {nextTargetNode.prev !== node.address ? 'missing prev' : ''}
                          </span>
                        </div>
                      ) : node.next !== null && !nextTargetNode ? (
                        /* Dangling unallocated address */
                        <div className="flex flex-col items-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-500/50 px-2 py-1 rounded-xl">
                          <span className="text-[9px] font-mono">Dangling: 0x{node.next}</span>
                          <span className="text-xs tracking-tighter font-mono">-- - -►</span>
                        </div>
                      ) : (
                        /* Disconnected */
                        <div className="flex flex-col items-center text-slate-400 dark:text-slate-600 px-1 font-mono text-xs">
                          <span>⋯⋯⋯</span>
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Right Arrow to Terminal NULL */}
            <div className="flex items-center text-slate-400 dark:text-slate-600 font-mono text-sm px-1">
              <span>◄──►</span>
            </div>

            {/* Terminal NULL for TAIL */}
            <div className="flex flex-col items-center shrink-0">
              <div className="px-3 py-2 bg-white dark:bg-[#090F22] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-500 shadow-xs">
                NULL
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                {tail !== null ? `(next of ${tail})` : 'unlinked'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM WORKSPACE CONTROLS */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Guided Step Button */}
        {isGuidedMode && currentGuidedStep ? (
          <button
            id="btn-perform-step"
            onClick={onExecuteGuidedNextStep}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>
              Perform Step {Math.min(currentGuidedStepIndex + 1, totalGuidedSteps || 1)} of{' '}
              {totalGuidedSteps}
            </span>
          </button>
        ) : (
          <button
            id="btn-start-guided"
            onClick={onToggleGuidedMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Enable Guided Steps</span>
          </button>
        )}

        {/* Undo, Redo, Reset, How to play */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            id="btn-undo"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Undo pointer edit"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            id="btn-redo"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Redo pointer edit"
          >
            <Redo className="w-4 h-4" />
          </button>

          {onShowHowToPlay && (
            <button
              id="btn-how-to-play"
              onClick={onShowHowToPlay}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>How to Play</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
