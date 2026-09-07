import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HelpCircle, Lightbulb, X, Bot, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Lock, Trophy } from 'lucide-react';
import { LevelConfig, TaskConfig, HeapNode, GuidedStep } from '../../types/dllGameTypes';
import { RamHeapWorkspace, AddressValidationError } from './RamHeapWorkspace';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TeachingAssistantBanner } from './TeachingAssistantBanner';
import { soundManager } from '../../utils/audio';

interface DLLArenaWorkspaceViewProps {
  level: LevelConfig;
  taskId?: string;
  initialGuidedMode?: boolean;
  completedTaskIds: string[];
  onBackToLevels: () => void;
  onTaskCompleted: (taskId: string, xp: number) => void;
  onSelectTask: (taskId: string) => void;
  onNextLevel?: (nextLevelNumber: number) => void;
}

export const DLLArenaWorkspaceView: React.FC<DLLArenaWorkspaceViewProps> = ({
  level,
  taskId,
  initialGuidedMode = false,
  completedTaskIds,
  onBackToLevels,
  onTaskCompleted,
  onSelectTask,
  onNextLevel,
}) => {
  // Find current active task
  const activeTask: TaskConfig =
    (taskId && level.tasks.find((t) => t.id === taskId)) || level.tasks[0];

  const taskIndex = level.tasks.findIndex((t) => t.id === activeTask.id);
  const isLastTask = taskIndex === level.tasks.length - 1;

  // Workspace RAM State
  const [nodes, setNodes] = useState<HeapNode[]>(() =>
    activeTask.initialNodes ? JSON.parse(JSON.stringify(activeTask.initialNodes)) : []
  );
  const [head, setHead] = useState<number | null>(activeTask.initialHead ?? null);
  const [tail, setTail] = useState<number | null>(activeTask.initialTail ?? null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Address validation feedback state
  const [validationError, setValidationError] = useState<AddressValidationError | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

  // History for Undo / Redo
  const [history, setHistory] = useState<{ nodes: HeapNode[]; head: number | null; tail: number | null }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: HeapNode[]; head: number | null; tail: number | null }[]>([]);

  // Guided Solve Mode State
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(initialGuidedMode);
  const [guidedStepIndex, setGuidedStepIndex] = useState<number>(0);

  // Modals & 3-Tier Hint System
  const [showConcept, setShowConcept] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showTaskSuccessModal, setShowTaskSuccessModal] = useState<boolean>(false);
  const [showLevelSuccessModal, setShowLevelSuccessModal] = useState<boolean>(false);
  const [unlockedHintTier, setUnlockedHintTier] = useState<number>(1); // 1, 2, or 3
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Re-initialize when activeTask changes
  useEffect(() => {
    setNodes(activeTask.initialNodes ? JSON.parse(JSON.stringify(activeTask.initialNodes)) : []);
    setHead(activeTask.initialHead ?? null);
    setTail(activeTask.initialTail ?? null);
    setSelectedNodeId(null);
    setValidationError(null);
    setValidationSuccess(null);
    setHistory([]);
    setRedoStack([]);
    setGuidedStepIndex(0);
    setIsGuidedMode(initialGuidedMode);
    setShowConcept(false);
    setShowHint(false);
    setShowTaskSuccessModal(false);
    setShowLevelSuccessModal(false);
    setUnlockedHintTier(1);
  }, [activeTask.id, initialGuidedMode]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const pushHistory = () => {
    setHistory((prev) => [...prev.slice(-20), { nodes: JSON.parse(JSON.stringify(nodes)), head, tail }]);
    setRedoStack([]);
  };

  // Live Criteria Evaluation
  const criteriaStatuses = (activeTask.targetCriteria || []).map((c) => ({
    id: c.id,
    label: c.label,
    isMet: Boolean(c.validate(nodes, head, tail)),
  }));

  const allCriteriaMet =
    criteriaStatuses.length > 0 && criteriaStatuses.every((c) => c.isMet);

  const isTaskCompleted = completedTaskIds.includes(activeTask.id);

  // Memory Address Updating with Live Feedback (User Prompt Requirement)
  const handleUpdateNodeAddress = (
    nodeId: string,
    field: 'prev' | 'next',
    newAddress: number | null
  ) => {
    pushHistory();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    // Update internal candidate state
    const updated = nodes.map((n) => (n.id === nodeId ? { ...n, [field]: newAddress } : n));
    setNodes(updated);

    // Validation against targetState
    const targetNodeConfig = activeTask.targetState?.nodes?.find(
      (n) => n.address === targetNode.address
    );

    if (targetNodeConfig && targetNodeConfig[field] !== undefined) {
      const expected = targetNodeConfig[field];
      if (newAddress !== expected) {
        soundManager.playError();
        const errObj: AddressValidationError = {
          nodeAddress: targetNode.address,
          field,
          currentValue: newAddress,
          expectedValue: expected,
          message: `Node ${targetNode.address}.${field.toUpperCase()} currently points to ${
            newAddress !== null ? newAddress : 'NULL'
          }. Expected address: ${expected !== null ? expected : 'NULL'}.`,
        };
        setValidationError(errObj);
        setValidationSuccess(null);
        showToast(
          `⚠ Incorrect Pointer: Node ${targetNode.address}.${field.toUpperCase()} points to ${
            newAddress !== null ? newAddress : 'NULL'
          }. Expected: ${expected !== null ? expected : 'NULL'}.`,
          'error'
        );
      } else {
        soundManager.playSuccess();
        setValidationError(null);
        const succMsg = `${targetNode.address}.${field.toUpperCase()} now points to ${
          newAddress !== null ? `Node ${newAddress}` : 'NULL'
        }.`;
        setValidationSuccess(succMsg);
        showToast(`✓ Correct: ${succMsg}`, 'success');
      }
    } else {
      setValidationError(null);
      setValidationSuccess(`Updated Node ${targetNode.address}.${field.toUpperCase()}`);
    }
  };

  // Node Allocation
  const handleCreateNode = () => {
    pushHistory();
    soundManager.playClick();

    // Check if task needs a specific node
    const neededCreate = activeTask.guidedSteps?.find(
      (s) =>
        s.actionType === 'CREATE_NODE' &&
        s.payload?.address !== undefined &&
        !nodes.some((n) => n.address === s.payload?.address)
    );

    let newAddr = 1001;
    let newData = 10;

    if (neededCreate?.payload?.address !== undefined) {
      newAddr = neededCreate.payload.address;
      newData = neededCreate.payload.data ?? 10;
    } else if (activeTask.targetState?.nodes) {
      const missingTargetNode = activeTask.targetState.nodes.find(
        (tn) => !nodes.some((n) => n.address === tn.address)
      );
      if (missingTargetNode) {
        newAddr = missingTargetNode.address;
        newData = Number(missingTargetNode.data) || 10;
      }
    } else {
      const existingAddrs = nodes.map((n) => n.address);
      newAddr = 1001;
      while (existingAddrs.includes(newAddr)) {
        newAddr++;
      }
      newData = (nodes.length + 1) * 10;
    }

    if (nodes.some((n) => n.address === newAddr)) {
      newAddr = Math.max(...nodes.map((n) => n.address)) + 1;
    }

    const newNode: HeapNode = {
      id: `node_${newAddr}_${Date.now()}`,
      address: newAddr,
      data: newData,
      prev: null,
      next: null,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    showToast(`Allocated Node at Heap Address 0x${newAddr} (DATA: ${newData})`, 'info');
  };

  const handleSetHead = (address?: number | null) => {
    pushHistory();
    soundManager.playClick();
    if (address !== undefined) {
      setHead(address);
      showToast(`HEAD set to ${address !== null ? address : 'NULL'}`, 'info');
      return;
    }
    const selected = nodes.find((n) => n.id === selectedNodeId);
    const targetAddr = selected ? selected.address : nodes[0]?.address ?? null;
    setHead(targetAddr);
    showToast(`HEAD pointed to Node ${targetAddr !== null ? targetAddr : 'NULL'}`, 'info');
  };

  const handleSetTail = (address?: number | null) => {
    pushHistory();
    soundManager.playClick();
    if (address !== undefined) {
      setTail(address);
      showToast(`TAIL set to ${address !== null ? address : 'NULL'}`, 'info');
      return;
    }
    const selected = nodes.find((n) => n.id === selectedNodeId);
    const targetAddr = selected ? selected.address : nodes[nodes.length - 1]?.address ?? null;
    setTail(targetAddr);
    showToast(`TAIL pointed to Node ${targetAddr !== null ? targetAddr : 'NULL'}`, 'info');
  };

  const handleDeleteNode = () => {
    let targetNode = nodes.find((n) => n.id === selectedNodeId);
    if (!targetNode) {
      // Check if task calls for deleting a specific node
      const neededDelete = activeTask.guidedSteps?.find(
        (s) => s.actionType === 'DELETE_NODE' && s.payload?.address !== undefined
      );
      if (neededDelete?.payload?.address) {
        targetNode = nodes.find((n) => n.address === neededDelete.payload.address);
      }
    }

    if (!targetNode) {
      soundManager.playError();
      showToast('Select a node in the workspace to delete it from the heap.', 'info');
      return;
    }

    pushHistory();
    soundManager.playClick();
    const deletedAddr = targetNode.address;
    setNodes((prev) => prev.filter((n) => n.id !== targetNode!.id));
    if (head === deletedAddr) setHead(null);
    if (tail === deletedAddr) setTail(null);
    setSelectedNodeId(null);
    showToast(`Deallocated Node 0x${deletedAddr} from RAM Heap.`, 'info');
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    soundManager.playClick();
    const prev = history[history.length - 1];
    setRedoStack((r) => [...r, { nodes: JSON.parse(JSON.stringify(nodes)), head, tail }]);
    setNodes(prev.nodes);
    setHead(prev.head);
    setTail(prev.tail);
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    soundManager.playClick();
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, { nodes: JSON.parse(JSON.stringify(nodes)), head, tail }]);
    setNodes(next.nodes);
    setHead(next.head);
    setTail(next.tail);
    setRedoStack((r) => r.slice(0, -1));
  };

  const handleReset = () => {
    soundManager.playClick();
    pushHistory();
    setNodes(activeTask.initialNodes ? JSON.parse(JSON.stringify(activeTask.initialNodes)) : []);
    setHead(activeTask.initialHead ?? null);
    setTail(activeTask.initialTail ?? null);
    setSelectedNodeId(null);
    setValidationError(null);
    setValidationSuccess(null);
    setGuidedStepIndex(0);
    showToast('Workspace reset to initial task state.', 'info');
  };

  // Guided Step-by-Step (Executes ONLY ONE operation per click!)
  const handleExecuteGuidedNextStep = () => {
    const steps = activeTask.guidedSteps || [];
    if (guidedStepIndex >= steps.length) {
      showToast('All guided steps have been completed! Click Check Answer.', 'info');
      return;
    }

    const step = steps[guidedStepIndex];
    soundManager.playClick();
    pushHistory();

    switch (step.actionType) {
      case 'CREATE_NODE': {
        const addr = step.payload?.address ?? 1001;
        const dataVal = step.payload?.data ?? 10;
        if (!nodes.some((n) => n.address === addr)) {
          const newNode: HeapNode = {
            id: `node_${addr}`,
            address: addr,
            data: dataVal,
            prev: null,
            next: null,
          };
          setNodes((prev) => [...prev, newNode]);
          setSelectedNodeId(newNode.id);
        }
        break;
      }
      case 'CONNECT_NEXT': {
        const fromAddr = step.payload?.fromAddress ?? step.payload?.from;
        const toAddr = step.payload?.toAddress !== undefined ? step.payload.toAddress : step.payload?.to ?? null;
        const backAddr = step.payload?.backAddress;

        setNodes((prev) =>
          prev.map((n) => {
            if (n.address === fromAddr) {
              return { ...n, next: toAddr };
            }
            if (backAddr !== undefined && n.address === toAddr) {
              return { ...n, prev: backAddr };
            }
            return n;
          })
        );
        break;
      }
      case 'CONNECT_PREV': {
        const fromAddr = step.payload?.fromAddress ?? step.payload?.from;
        const toAddr = step.payload?.toAddress !== undefined ? step.payload.toAddress : step.payload?.to ?? null;

        setNodes((prev) =>
          prev.map((n) => (n.address === fromAddr ? { ...n, prev: toAddr } : n))
        );
        break;
      }
      case 'SET_HEAD': {
        const target = step.payload?.address !== undefined ? step.payload.address : step.payload?.head;
        if (target !== undefined) setHead(target);
        if (step.payload?.tail !== undefined) setTail(step.payload.tail);
        break;
      }
      case 'SET_TAIL': {
        const target = step.payload?.address !== undefined ? step.payload.address : step.payload?.tail;
        if (target !== undefined) setTail(target);
        break;
      }
      case 'DELETE_NODE': {
        const addr = step.payload?.address;
        if (addr !== undefined) {
          setNodes((prev) => prev.filter((n) => n.address !== addr));
          if (head === addr) setHead(null);
          if (tail === addr) setTail(null);
        }
        break;
      }
      case 'VERIFY': {
        handleCheckAnswer();
        break;
      }
      default:
        break;
    }

    setGuidedStepIndex((prev) => prev + 1);
    showToast(`Executed: ${step.instruction}`, 'info');
  };

  // Comprehensive DLL Rules Verification Engine (User Prompt Mandate)
  const handleCheckAnswer = () => {
    // 1. Enforce first node: PREV = NULL
    if (head !== null) {
      const headNode = nodes.find((n) => n.address === head);
      if (!headNode) {
        soundManager.playError();
        showToast(`⚠ HEAD points to address 0x${head}, but that node does not exist in RAM!`, 'error');
        return;
      }
      if (headNode.prev !== null) {
        soundManager.playError();
        showToast(
          `⚠ First node (0x${head}) must have PREV = NULL. Currently points to 0x${headNode.prev}.`,
          'error'
        );
        return;
      }
    }

    // 2. Enforce last node: NEXT = NULL
    if (tail !== null) {
      const tailNode = nodes.find((n) => n.address === tail);
      if (!tailNode) {
        soundManager.playError();
        showToast(`⚠ TAIL points to address 0x${tail}, but that node does not exist in RAM!`, 'error');
        return;
      }
      if (tailNode.next !== null) {
        soundManager.playError();
        showToast(
          `⚠ Last node (0x${tail}) must have NEXT = NULL. Currently points to 0x${tailNode.next}.`,
          'error'
        );
        return;
      }
    }

    // 3. Enforce bidirectional consistency: A.NEXT = B AND B.PREV = A
    for (const node of nodes) {
      if (node.next !== null) {
        const dest = nodes.find((n) => n.address === node.next);
        if (!dest) {
          soundManager.playError();
          showToast(
            `⚠ Node ${node.address}.NEXT points to unallocated address 0x${node.next}!`,
            'error'
          );
          return;
        }
        if (dest.prev !== node.address) {
          soundManager.playError();
          showToast(
            `⚠ Bidirectional check failed: Node ${node.address}.NEXT is ${node.next}, but Node ${dest.address}.PREV points to ${dest.prev ?? 'NULL'} instead of ${node.address}!`,
            'error'
          );
          return;
        }
      }
    }

    // 4. Target criteria validation
    const unmet = criteriaStatuses.filter((c) => !c.isMet);
    if (unmet.length > 0) {
      soundManager.playError();
      showToast(`⚠ Requirement not met: ${unmet[0].label}`, 'error');
      return;
    }

    // All DLL rules + task criteria met!
    soundManager.playLevelComplete();
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
    });
    showToast(`🎉 Verified! Task #${activeTask.taskNumber} is 100% correct! +${activeTask.xpReward} XP`, 'success');
    onTaskCompleted(activeTask.id, activeTask.xpReward);

    if (isLastTask) {
      setShowLevelSuccessModal(true);
    } else {
      setShowTaskSuccessModal(true);
    }
  };

  const currentGuidedStep: GuidedStep | null =
    activeTask.guidedSteps && activeTask.guidedSteps[guidedStepIndex]
      ? activeTask.guidedSteps[guidedStepIndex]
      : null;

  // 3-Tier Hints
  const hints = activeTask.hints || [
    'Examine the pointer requirements in the task checklist.',
    'Each forward link (NEXT) requires a corresponding backward link (PREV).',
    `Check the C code equivalent to verify exact pointer assignments.`,
  ];

  return (
    <div id="dll-arena-workspace" className="flex flex-col gap-6 w-full relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center justify-between gap-3 shadow-2xl transition-all animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border border-emerald-500 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/95 border border-rose-500 text-rose-200'
              : 'bg-indigo-950/95 border border-indigo-500 text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-mono font-bold hover:opacity-75 cursor-pointer px-2 py-1 rounded bg-black/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Two-Column Layout: LEFT (RAM HEAP WORKSPACE) and RIGHT (TASK PANEL) */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        {/* LEFT COLUMN: Teaching Assistant Banner + RAM Heap Workspace */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <TeachingAssistantBanner
            task={activeTask}
            isTaskCompleted={isTaskCompleted}
            onNextTask={() => {
              soundManager.playClick();
              if (!isLastTask) {
                const next = level.tasks[taskIndex + 1];
                onSelectTask(next.id);
              } else {
                onBackToLevels();
              }
            }}
            isLastTask={isLastTask}
            totalSteps={activeTask.guidedSteps?.length || 3}
            currentStepIndex={guidedStepIndex}
            onExecuteNextStep={handleExecuteGuidedNextStep}
            onShowHint={() => setShowHint(true)}
          />

          <RamHeapWorkspace
            nodes={nodes}
            head={head}
            tail={tail}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onCreateNode={handleCreateNode}
            onSetHead={handleSetHead}
            onSetTail={handleSetTail}
            onDeleteNode={handleDeleteNode}
            onUpdateNodeAddress={handleUpdateNodeAddress}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onShowHint={() => setShowHint(true)}
            onShowHowToPlay={() => setShowConcept(true)}
            onCheckAnswer={handleCheckAnswer}
            validationError={validationError}
            validationSuccess={validationSuccess}
            isGuidedMode={isGuidedMode}
            onToggleGuidedMode={() => {
              soundManager.playClick();
              setIsGuidedMode((prev) => !prev);
            }}
            currentGuidedStep={currentGuidedStep}
            currentGuidedStepIndex={guidedStepIndex}
            totalGuidedSteps={activeTask.guidedSteps?.length || 0}
            onExecuteGuidedNextStep={handleExecuteGuidedNextStep}
            canUndo={history.length > 0}
            canRedo={redoStack.length > 0}
          />
        </div>

        {/* RIGHT COLUMN: Task Detail Panel */}
        <TaskDetailPanel
          task={activeTask}
          criteriaStatuses={criteriaStatuses}
          onCheckAnswer={handleCheckAnswer}
          onShowConcept={() => setShowConcept(true)}
          onShowHint={() => setShowHint(true)}
          isTaskCompleted={isTaskCompleted}
          onNextTask={() => {
            soundManager.playClick();
            if (!isLastTask) {
              const next = level.tasks[taskIndex + 1];
              onSelectTask(next.id);
            }
          }}
          onBackToTasks={onBackToLevels}
          isLastTask={isLastTask}
          isGuidedMode={isGuidedMode}
          onToggleGuidedMode={() => {
            soundManager.playClick();
            setIsGuidedMode((prev) => !prev);
          }}
          currentGuidedStepIndex={guidedStepIndex}
          onExecuteGuidedNextStep={handleExecuteGuidedNextStep}
          selectedNode={nodes.find((n) => n.id === selectedNodeId) || null}
        />
      </div>

      {/* Floating Robot Mascot in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center select-none">
        <button
          id="btn-floating-mascot-assistant"
          onClick={() => {
            soundManager.playClick();
            if (activeTask.guidedSteps && activeTask.guidedSteps[guidedStepIndex]) {
              showToast(`DLL Assistant: ${activeTask.guidedSteps[guidedStepIndex].instruction}`, 'info');
            } else {
              showToast('DLL Assistant: Remember, every forward link must have a matching backward link!', 'info');
            }
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 ring-4 ring-blue-400/30 hover:ring-blue-400/60 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="DLL Assistant Mascot"
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* 3-Tier Progressive Hint Modal (Prompt Specified) */}
      {showHint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black font-mono text-sm uppercase">
                <Lightbulb className="w-5 h-5" />
                <span>3-Level Progressive Hint System</span>
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hint Tier 1: Conceptual Clue */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                <span>LEVEL 1: CONCEPTUAL CLUE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">Unlocked</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {hints[0]}
              </p>
            </div>

            {/* Hint Tier 2: Pointer / Address Relationship */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                unlockedHintTier >= 2
                  ? 'bg-slate-50 dark:bg-[#090E1A] border-slate-200 dark:border-slate-800 space-y-1.5'
                  : 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                <span>LEVEL 2: POINTER RELATIONSHIP</span>
                {unlockedHintTier >= 2 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">Unlocked</span>
                ) : (
                  <button
                    onClick={() => setUnlockedHintTier(2)}
                    className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Unlock Hint 2</span>
                  </button>
                )}
              </div>
              {unlockedHintTier >= 2 ? (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {hints[1]}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Reveals the address link relationship between nodes.
                </p>
              )}
            </div>

            {/* Hint Tier 3: Exact Address Operation */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                unlockedHintTier >= 3
                  ? 'bg-slate-50 dark:bg-[#090E1A] border-amber-300 dark:border-amber-500/40 space-y-1.5'
                  : 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                <span>LEVEL 3: EXACT ADDRESS OPERATION</span>
                {unlockedHintTier >= 3 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">Unlocked</span>
                ) : (
                  <button
                    onClick={() => setUnlockedHintTier(3)}
                    disabled={unlockedHintTier < 2}
                    className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Unlock Exact Solution Hint</span>
                  </button>
                )}
              </div>
              {unlockedHintTier >= 3 ? (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
                  {hints[2]}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Provides the exact address assignments required to complete this task.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowHint(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Close Hints & Return to Workspace
            </button>
          </div>
        </div>
      )}

      {/* Concept Explainer Modal */}
      {showConcept && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold font-mono text-sm uppercase">
                <HelpCircle className="w-5 h-5" />
                <span>Concept: {activeTask.concept || activeTask.title}</span>
              </div>
              <button
                onClick={() => setShowConcept(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeTask.description}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                Memory Representation:
              </div>
              <div className="text-sky-600 dark:text-sky-400">Node Struct: [ PREV (8B) | DATA (4B) | NEXT (8B) ]</div>
              <div className="text-emerald-600 dark:text-emerald-400">Address Space: Direct 16-bit simulated heap pointers</div>
              <div className="text-slate-500 dark:text-slate-400">Boundary: Head node PREV = NULL; Tail node NEXT = NULL</div>
            </div>

            <button
              onClick={() => setShowConcept(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Got it, return to workspace
            </button>
          </div>
        </div>
      )}

      {/* Task Finished Modal */}
      {showTaskSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-emerald-300 dark:border-emerald-500/40 shadow-2xl space-y-5 text-center text-slate-800 dark:text-slate-100 relative">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ✓ Task Finished!
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mt-1.5">
                Excellent! Your pointer relationships are correct.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                +{activeTask.xpReward} XP earned • Addresses verified in RAM Heap
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                id="btn-continue-next-task"
                onClick={() => {
                  setShowTaskSuccessModal(false);
                  if (!isLastTask) {
                    const nextTask = level.tasks[taskIndex + 1];
                    onSelectTask(nextTask.id);
                  }
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-mono text-sm font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Continue to Next Task</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                id="btn-review-task-workspace"
                onClick={() => setShowTaskSuccessModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Review Workspace State
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      {showLevelSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-indigo-300 dark:border-indigo-500/40 shadow-2xl space-y-5 text-center text-slate-800 dark:text-slate-100 relative">
            <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/20">
              <Trophy className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                LEVEL COMPLETE!
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {level.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All tasks verified with strict Doubly Linked List rules.
              </p>
            </div>

            {/* Stats Grid: Tasks Completed, XP Earned, Accuracy */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 text-left">
              <div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Tasks Completed</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {level.tasks.length} / {level.tasks.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">XP Earned</div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-300 mt-0.5">
                  +{level.totalXp} XP
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Accuracy</div>
                <div className="text-base font-black text-amber-600 dark:text-amber-300 mt-0.5">
                  100%
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {level.id < 8 && onNextLevel ? (
                <button
                  id="btn-modal-next-level"
                  onClick={() => {
                    setShowLevelSuccessModal(false);
                    onNextLevel(level.id + 1);
                  }}
                  className="w-full flex-1 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-mono text-sm font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Next Level ({`L0${level.id + 1}`})</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              ) : (
                <button
                  id="btn-modal-all-levels-complete"
                  onClick={() => {
                    setShowLevelSuccessModal(false);
                    onBackToLevels();
                  }}
                  className="w-full flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-mono text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>All 8 Levels Complete!</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}

              <button
                id="btn-modal-review-workspace"
                onClick={() => setShowLevelSuccessModal(false)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Review Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
