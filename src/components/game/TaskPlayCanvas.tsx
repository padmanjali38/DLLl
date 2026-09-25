import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  ArrowRight,
  Lightbulb,
  Check,
  Cpu,
  ArrowDown,
  ArrowUp,
  Code2,
  Copy,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { TaskSpec, LevelSpec, HeapNodeDef, AtomicStepDef } from './gameData';
import { soundManager } from '../../utils/audio';

interface TaskPlayCanvasProps {
  level: LevelSpec;
  task: TaskSpec;
  currentTaskIndex: number;
  isTaskAlreadyCompleted: boolean;
  onBackToLevels: () => void;
  onNextTask: () => void;
  onSelectTaskIndex: (index: number) => void;
  onTaskSolved: (taskId: string) => void;
}

export const TaskPlayCanvas: React.FC<TaskPlayCanvasProps> = ({
  level,
  task,
  currentTaskIndex,
  onBackToLevels,
  onNextTask,
  onSelectTaskIndex,
  onTaskSolved,
}) => {
  // Heap RAM nodes state
  const [heapNodes, setHeapNodes] = useState<HeapNodeDef[]>(() =>
    task.initialHeapNodes.map((n) => ({ ...n }))
  );
  const [head, setHead] = useState<number | null>(() => task.initialHeadAddress);
  const [tail, setTail] = useState<number | null>(() => task.initialTailAddress);
  const [curr, setCurr] = useState<number | null>(null);
  const [temp, setTemp] = useState<number | null>(null);
  const [verifiedBoundary, setVerifiedBoundary] = useState<boolean>(false);
  const [completedStepNumbers, setCompletedStepNumbers] = useState<number[]>([]);

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);

  // Validation feedback
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<'c' | 'cpp' | 'java' | 'python'>('c');

  // Active connector dropdown on individual node card
  const [openDropdown, setOpenDropdown] = useState<{
    nodeAddress: number;
    field: 'next' | 'prev';
  } | null>(null);

  // Reset state whenever task changes
  useEffect(() => {
    resetTask();
  }, [task.id]);

  const resetTask = () => {
    setHeapNodes(task.initialHeapNodes.map((n) => ({ ...n })));
    setHead(task.initialHeadAddress);
    setTail(task.initialTailAddress);
    setCurr(null);
    setTemp(null);
    setVerifiedBoundary(false);
    setCompletedStepNumbers([]);
    setSelectedAddress(null);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setShowHint(false);
    setIsSuccess(false);
    setOpenDropdown(null);
  };

  // List of all node addresses currently in heap RAM
  const allAddresses = useMemo(() => heapNodes.map((n) => n.address), [heapNodes]);

  // =========================================================================
  // DATA-DRIVEN ATOMIC STEP EVALUATION
  // Evaluates every step purely based on task.atomicSteps and current RAM state
  // =========================================================================
  const stepStatuses = useMemo(() => {
    return task.atomicSteps.map((step) => {
      // 1. Explicitly completed through sequential player action
      if (completedStepNumbers.includes(step.stepNumber)) {
        return { ...step, isMet: true };
      }

      // 2. Data-driven dynamic condition verification
      let isMet = false;

      switch (step.actionType) {
        case 'create_node': {
          if (step.targetAddress) {
            isMet = heapNodes.some((n) => n.address === step.targetAddress);
          }
          break;
        }

        case 'set_data': {
          if (step.targetAddress) {
            const node = heapNodes.find((n) => n.address === step.targetAddress);
            isMet = node !== undefined && (step.targetValue === undefined || node.data === step.targetValue);
          }
          break;
        }

        case 'set_head': {
          const expected = step.targetAddress ?? null;
          isMet = head === expected;
          break;
        }

        case 'set_tail': {
          const expected = step.targetAddress ?? null;
          isMet = tail === expected;
          break;
        }

        case 'set_curr': {
          const expected = step.targetAddress ?? null;
          isMet = curr === expected;
          break;
        }

        case 'set_temp': {
          const expected = step.targetAddress ?? null;
          isMet = temp === expected;
          break;
        }

        case 'set_next': {
          if (step.fromAddress) {
            const node = heapNodes.find((n) => n.address === step.fromAddress);
            const expected = step.targetAddress ?? null;
            isMet = node !== undefined && node.next === expected;
          }
          break;
        }

        case 'set_prev': {
          if (step.fromAddress) {
            const node = heapNodes.find((n) => n.address === step.fromAddress);
            const expected = step.targetAddress ?? null;
            isMet = node !== undefined && node.prev === expected;
          }
          break;
        }

        case 'delete_node': {
          if (step.targetAddress) {
            isMet = !heapNodes.some((n) => n.address === step.targetAddress);
          }
          break;
        }

        case 'traverse_next':
        case 'traverse_prev': {
          isMet = curr === step.targetAddress;
          break;
        }

        case 'verify': {
          isMet = verifiedBoundary || (curr !== null && heapNodes.find((n) => n.address === curr)?.next === null);
          break;
        }

        case 'select_node': {
          isMet = selectedAddress === step.targetAddress;
          break;
        }

        default:
          isMet = false;
          break;
      }

      return {
        ...step,
        isMet,
      };
    });
  }, [task.atomicSteps, completedStepNumbers, heapNodes, head, tail, curr, temp, verifiedBoundary, selectedAddress]);

  // Determine active step index (first uncompleted step)
  const activeStepIndex = useMemo(() => {
    const firstUnmet = stepStatuses.findIndex((s) => !s.isMet);
    return firstUnmet === -1 ? stepStatuses.length - 1 : firstUnmet;
  }, [stepStatuses]);

  const activeStep = stepStatuses[activeStepIndex];
  const allStepsCompleted = stepStatuses.every((s) => s.isMet);

  // Helper to mark a step number as completed
  const markStepDone = (stepNum: number) => {
    setCompletedStepNumbers((prev) => (prev.includes(stepNum) ? prev : [...prev, stepNum]));
  };

  // Detect unlinked nodes in heap RAM
  const unlinkedInfo = useMemo(() => {
    if (heapNodes.length === 0) return { count: 0, addresses: [] };

    const visited = new Set<number>();
    let iterator = head;
    let safeguard = 0;

    while (iterator !== null && safeguard < 20) {
      visited.add(iterator);
      const node = heapNodes.find((n) => n.address === iterator);
      if (!node || node.next === null || visited.has(node.next)) break;
      iterator = node.next;
      safeguard++;
    }

    const unlinkedAddresses = heapNodes
      .filter((n) => !visited.has(n.address))
      .map((n) => n.address);

    return {
      count: unlinkedAddresses.length,
      addresses: unlinkedAddresses,
    };
  }, [heapNodes, head]);

  // Trigger task success when all steps are completed
  useEffect(() => {
    if (allStepsCompleted && !isSuccess) {
      setIsSuccess(true);
      setFeedbackSuccess(task.successMessage);
      setFeedbackError(null);
      soundManager.playSuccess();
      onTaskSolved(task.id);

      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#2563EB', '#10B981', '#6366F1', '#F59E0B'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [allStepsCompleted, isSuccess, onTaskSolved, task.id, task.successMessage]);

  // =========================================================================
  // ATOMIC ACTION HANDLERS
  // =========================================================================

  // 1. Create Node on Heap
  const handleCreateNode = (customAddr?: number, customData?: number) => {
    soundManager.playClick();
    const targetAddr = customAddr ?? task.newNodeToAllocate?.address;
    const targetData = customData ?? task.newNodeToAllocate?.data ?? 42;

    if (!targetAddr) {
      setFeedbackError('No additional nodes need to be allocated for this task.');
      return;
    }

    if (heapNodes.some((n) => n.address === targetAddr)) {
      setFeedbackError(`Node ${targetAddr} already exists on the heap.`);
      return;
    }

    const created: HeapNodeDef = {
      address: targetAddr,
      data: targetData,
      prev: null,
      next: null,
    };

    setHeapNodes((prev) => [...prev, created]);
    setSelectedAddress(targetAddr);
    setFeedbackError(null);
    setFeedbackSuccess(`Node [${targetData}] allocated at address 0x${targetAddr} in RAM.`);

    if (activeStep && activeStep.actionType === 'create_node') {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 2. Set HEAD Pointer
  const handleSetHead = (targetAddress?: number | null) => {
    soundManager.playClick();
    const addr = targetAddress !== undefined ? targetAddress : selectedAddress;

    setHead(addr);
    setFeedbackError(null);
    setFeedbackSuccess(
      addr === null ? 'HEAD pointer set to NULL.' : `HEAD register updated to point to Node ${addr}.`
    );

    if (activeStep && activeStep.actionType === 'set_head') {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 3. Set TAIL Pointer
  const handleSetTail = (targetAddress?: number | null) => {
    soundManager.playClick();
    const addr = targetAddress !== undefined ? targetAddress : selectedAddress;

    setTail(addr);
    setFeedbackError(null);
    setFeedbackSuccess(
      addr === null ? 'TAIL pointer set to NULL.' : `TAIL register updated to point to Node ${addr}.`
    );

    if (activeStep && activeStep.actionType === 'set_tail') {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 4. Set CURR Pointer
  const handleSetCurr = (targetAddress?: number | null) => {
    soundManager.playClick();
    const addr = targetAddress !== undefined ? targetAddress : selectedAddress;

    setCurr(addr);
    setFeedbackError(null);
    setFeedbackSuccess(
      addr === null ? 'CURR pointer set to NULL.' : `CURR register set to Node ${addr}.`
    );

    if (activeStep && (activeStep.actionType === 'set_curr' || activeStep.actionType === 'select_node')) {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 5. Set TEMP Pointer
  const handleSetTemp = (targetAddress?: number | null) => {
    soundManager.playClick();
    const addr = targetAddress !== undefined ? targetAddress : selectedAddress;

    setTemp(addr);
    setFeedbackError(null);
    setFeedbackSuccess(
      addr === null ? 'TEMP pointer cleared (NULL).' : `TEMP register set to Node ${addr}.`
    );

    if (activeStep && activeStep.actionType === 'set_temp') {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 6. Update Node Pointer (NEXT or PREV)
  const handleUpdateNodePointer = (
    nodeAddress: number,
    field: 'next' | 'prev',
    target: number | null
  ) => {
    soundManager.playClick();
    setOpenDropdown(null);

    setHeapNodes((prev) =>
      prev.map((n) => {
        if (n.address === nodeAddress) {
          return { ...n, [field]: target };
        }
        return n;
      })
    );

    setFeedbackError(null);
    setFeedbackSuccess(
      `Node ${nodeAddress}.${field.toUpperCase()} pointer linked to ${
        target === null ? 'NULL' : `Node ${target}`
      }.`
    );

    if (activeStep) {
      if (
        (field === 'next' && activeStep.actionType === 'set_next') ||
        (field === 'prev' && activeStep.actionType === 'set_prev')
      ) {
        if (activeStep.fromAddress === nodeAddress) {
          markStepDone(activeStep.stepNumber);
        }
      }
    }
  };

  // 7. Update Node DATA Value
  const handleUpdateNodeData = (nodeAddress: number, newData: number) => {
    soundManager.playClick();
    setHeapNodes((prev) =>
      prev.map((n) => (n.address === nodeAddress ? { ...n, data: newData } : n))
    );
    setFeedbackSuccess(`Node ${nodeAddress} data set to ${newData}.`);

    if (activeStep && activeStep.actionType === 'set_data' && activeStep.targetAddress === nodeAddress) {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 8. Traverse Forward (curr = curr->next)
  const handleTraverseNext = () => {
    soundManager.playClick();
    if (curr === null) {
      if (head !== null) {
        setCurr(head);
        setFeedbackSuccess(`Traversed to HEAD: Node ${head}.`);
      } else {
        setFeedbackError('List is empty (HEAD == NULL).');
      }
      return;
    }

    const currentNode = heapNodes.find((n) => n.address === curr);
    if (!currentNode) {
      setFeedbackError('Current node not found in RAM.');
      return;
    }

    if (currentNode.next !== null) {
      setCurr(currentNode.next);
      setFeedbackSuccess(`Traversed forward to Node ${currentNode.next} (curr = curr->next).`);
      if (activeStep && activeStep.actionType === 'traverse_next') {
        markStepDone(activeStep.stepNumber);
      }
    } else {
      setFeedbackSuccess('Reached end of list (curr->next == NULL).');
      setVerifiedBoundary(true);
      if (activeStep && activeStep.actionType === 'verify') {
        markStepDone(activeStep.stepNumber);
      }
    }
  };

  // 9. Traverse Backward (curr = curr->prev)
  const handleTraversePrev = () => {
    soundManager.playClick();
    if (curr === null) {
      if (tail !== null) {
        setCurr(tail);
        setFeedbackSuccess(`Started reverse traversal from TAIL: Node ${tail}.`);
      } else {
        setFeedbackError('List is empty (TAIL == NULL).');
      }
      return;
    }

    const currentNode = heapNodes.find((n) => n.address === curr);
    if (!currentNode) {
      setFeedbackError('Current node not found in RAM.');
      return;
    }

    if (currentNode.prev !== null) {
      setCurr(currentNode.prev);
      setFeedbackSuccess(`Traversed backward to Node ${currentNode.prev} (curr = curr->prev).`);
      if (activeStep && activeStep.actionType === 'traverse_prev') {
        markStepDone(activeStep.stepNumber);
      }
    } else {
      setFeedbackSuccess('Reached head of list in reverse (curr->prev == NULL).');
      if (activeStep && activeStep.actionType === 'traverse_prev') {
        markStepDone(activeStep.stepNumber);
      }
    }
  };

  // 10. Verify Boundary Condition
  const handleVerifyBoundary = () => {
    soundManager.playClick();
    setVerifiedBoundary(true);
    setFeedbackSuccess('Verified: Boundary condition confirmed (curr->next == NULL).');
    if (activeStep && activeStep.actionType === 'verify') {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 11. Delete Node from Heap RAM
  const handleDeleteNode = (targetAddress?: number) => {
    soundManager.playClick();
    const addr = targetAddress ?? selectedAddress ?? temp;

    if (!addr) {
      setFeedbackError('Select the node you wish to free from RAM first.');
      return;
    }

    // Remove node from heap
    setHeapNodes((prev) => prev.filter((n) => n.address !== addr));

    // Clear any links pointing to this deleted node
    setHeapNodes((prev) =>
      prev.map((n) => ({
        ...n,
        next: n.next === addr ? null : n.next,
        prev: n.prev === addr ? null : n.prev,
      }))
    );

    if (head === addr) setHead(null);
    if (tail === addr) setTail(null);
    if (curr === addr) setCurr(null);
    if (temp === addr) setTemp(null);
    if (selectedAddress === addr) setSelectedAddress(null);

    setFeedbackError(null);
    setFeedbackSuccess(`Node 0x${addr} freed from RAM heap: free(target).`);

    if (activeStep && activeStep.actionType === 'delete_node') {
      markStepDone(activeStep.stepNumber);
    }
  };

  // 12. Guided Step Execution ("Perform Step X Automatically")
  const handleExecuteNextGuidedStep = () => {
    if (!activeStep || activeStep.isMet) return;

    soundManager.playClick();

    switch (activeStep.actionType) {
      case 'create_node': {
        const addr = activeStep.targetAddress ?? task.newNodeToAllocate?.address;
        const val = activeStep.targetValue ?? task.newNodeToAllocate?.data ?? 42;
        if (addr) handleCreateNode(addr, val);
        break;
      }

      case 'set_data': {
        if (activeStep.targetAddress && activeStep.targetValue !== undefined) {
          handleUpdateNodeData(activeStep.targetAddress, activeStep.targetValue);
        }
        break;
      }

      case 'set_head': {
        handleSetHead(activeStep.targetAddress ?? null);
        break;
      }

      case 'set_tail': {
        handleSetTail(activeStep.targetAddress ?? null);
        break;
      }

      case 'set_curr': {
        handleSetCurr(activeStep.targetAddress ?? null);
        break;
      }

      case 'set_temp': {
        handleSetTemp(activeStep.targetAddress ?? null);
        break;
      }

      case 'set_next': {
        if (activeStep.fromAddress) {
          handleUpdateNodePointer(
            activeStep.fromAddress,
            'next',
            activeStep.targetAddress ?? null
          );
        }
        break;
      }

      case 'set_prev': {
        if (activeStep.fromAddress) {
          handleUpdateNodePointer(
            activeStep.fromAddress,
            'prev',
            activeStep.targetAddress ?? null
          );
        }
        break;
      }

      case 'delete_node': {
        if (activeStep.targetAddress) {
          handleDeleteNode(activeStep.targetAddress);
        }
        break;
      }

      case 'traverse_next': {
        if (activeStep.targetAddress) {
          setCurr(activeStep.targetAddress);
          setFeedbackSuccess(`Advanced curr pointer to Node ${activeStep.targetAddress}.`);
          markStepDone(activeStep.stepNumber);
        }
        break;
      }

      case 'traverse_prev': {
        if (activeStep.targetAddress) {
          setCurr(activeStep.targetAddress);
          setFeedbackSuccess(`Traversed curr pointer back to Node ${activeStep.targetAddress}.`);
          markStepDone(activeStep.stepNumber);
        }
        break;
      }

      case 'verify': {
        handleVerifyBoundary();
        break;
      }

      case 'select_node': {
        if (activeStep.targetAddress) {
          setSelectedAddress(activeStep.targetAddress);
          markStepDone(activeStep.stepNumber);
        }
        break;
      }

      default:
        break;
    }

    markStepDone(activeStep.stepNumber);
  };

  // 13. Manual Check Answer Click
  const handleCheckAnswer = () => {
    soundManager.playClick();
    if (allStepsCompleted) {
      setFeedbackSuccess(task.successMessage);
      setFeedbackError(null);
    } else {
      const nextNeeded = stepStatuses.find((s) => !s.isMet);
      setFeedbackError(
        nextNeeded ? `Pending Step ${nextNeeded.stepNumber}: ${nextNeeded.label}` : 'Not all criteria are met.'
      );
    }
  };

  const getCodeSnippetForLanguage = (cCode: string, lang: 'c' | 'cpp' | 'java' | 'python') => {
    if (!cCode) return '// Operation completed';
    if (lang === 'c') {
      return cCode;
    }
    if (lang === 'cpp') {
      return cCode
        .replace(/struct Node\*/g, 'Node*')
        .replace(/NULL/g, 'nullptr')
        .replace(/free\((.*?)\);/g, 'delete $1;');
    }
    if (lang === 'java') {
      return cCode
        .replace(/struct Node\*/g, 'Node ')
        .replace(/Node\*/g, 'Node ')
        .replace(/->/g, '.')
        .replace(/NULL/g, 'null')
        .replace(/free\((.*?)\);/g, '$1 = null; // Eligible for garbage collection');
    }
    if (lang === 'python') {
      return cCode
        .replace(/struct Node\*\s+/g, '')
        .replace(/Node\*\s+/g, '')
        .replace(/->/g, '.')
        .replace(/NULL/g, 'None')
        .replace(/;/g, '')
        .replace(/free\((.*?)\)/g, 'del $1');
    }
    return cCode;
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    const rawCode = activeStep?.cCodeSnippet || task.atomicSteps.map((s) => s.cCodeSnippet).join('\n\n');
    const codeToCopy = getCodeSnippetForLanguage(rawCode, selectedLang);
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div id="task-play-canvas" className="w-full space-y-4 animate-fade-in select-none">
      {/* 1. TOP HEADER & TASK NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-levels"
            type="button"
            onClick={onBackToLevels}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Levels</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:border-slate-800" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {level.title}
              </span>
              <span className="text-xs font-mono text-slate-400">•</span>
              <span className="text-xs font-mono text-amber-500 font-bold">
                {task.difficulty}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Task {task.taskNumber}: {task.title}
            </h1>
          </div>
        </div>

        {/* Task Switcher Tabs (Task 1, Task 2, Task 3) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            {level.tasks.map((t, idx) => {
              const isCurrent = idx === currentTaskIndex;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTaskIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Task {t.taskNumber}
                </button>
              );
            })}
          </div>

          <button
            id="btn-toggle-hint"
            type="button"
            onClick={() => setShowHint(!showHint)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              showHint
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Hint</span>
          </button>

          <button
            id="btn-reset-task"
            type="button"
            onClick={resetTask}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Expandable Hint Callout */}
      {showHint && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs font-sans text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-fade-in shadow-sm">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold font-mono uppercase tracking-wider text-[11px]">
              Task Guidance:
            </span>
            <p className="leading-relaxed">{task.hint}</p>
          </div>
        </div>
      )}

      {/* 2. MAIN SPLIT: RAM HEAP WORKSPACE (Left/Center) + TASK PROGRESS PANEL (Right) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* ============================================================== */}
        {/* CENTER: RAM HEAP WORKSPACE                                     */}
        {/* ============================================================== */}
        <div
          id="ram-heap-workspace"
          className="flex-1 w-full flex flex-col bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden"
        >
          {/* Top Bar: RAM HEAP WORKSPACE header + POINTER REGISTERS */}
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
                    {heapNodes.length} {heapNodes.length === 1 ? 'Node' : 'Nodes'} in RAM
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Direct Pointer Registers • Edit NEXT & PREV fields to wire doubly linked list nodes
                </p>
              </div>
            </div>

            {/* Pointer Registers: HEAD, TAIL, CURR, TEMP */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {/* HEAD Register */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
                <span className="text-slate-600 dark:text-slate-400 font-bold">HEAD:</span>
                <select
                  id="select-head-register"
                  value={head ?? 'NULL'}
                  onChange={(e) => {
                    const val = e.target.value === 'NULL' ? null : parseInt(e.target.value, 10);
                    handleSetHead(val);
                  }}
                  className="bg-transparent font-mono font-extrabold text-xs text-sky-600 dark:text-sky-400 outline-none cursor-pointer"
                >
                  <option value="NULL" className="bg-white dark:bg-slate-900 text-rose-500">
                    NULL
                  </option>
                  {allAddresses.map((addr) => (
                    <option key={addr} value={addr} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                      Node {addr}
                    </option>
                  ))}
                </select>
              </div>

              {/* TAIL Register */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                <span className="text-slate-600 dark:text-slate-400 font-bold">TAIL:</span>
                <select
                  id="select-tail-register"
                  value={tail ?? 'NULL'}
                  onChange={(e) => {
                    const val = e.target.value === 'NULL' ? null : parseInt(e.target.value, 10);
                    handleSetTail(val);
                  }}
                  className="bg-transparent font-mono font-extrabold text-xs text-amber-600 dark:text-amber-400 outline-none cursor-pointer"
                >
                  <option value="NULL" className="bg-white dark:bg-slate-900 text-rose-500">
                    NULL
                  </option>
                  {allAddresses.map((addr) => (
                    <option key={addr} value={addr} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                      Node {addr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pointer Action Tools Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-100/90 dark:bg-[#070D1E] border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
                Pointer Tools:
              </span>

              {/* + Create / Allocate Node */}
              {task.newNodeToAllocate && (
                <button
                  id="btn-create-node"
                  type="button"
                  onClick={() => handleCreateNode()}
                  disabled={heapNodes.some((n) => n.address === task.newNodeToAllocate?.address)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    !heapNodes.some((n) => n.address === task.newNodeToAllocate?.address)
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/40 animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Allocate Node [{task.newNodeToAllocate.data}]</span>
                </button>
              )}

              {/* HEAD Tool */}
              <button
                id="btn-tool-head"
                type="button"
                onClick={() => handleSetHead()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedAddress !== null
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-700 dark:text-sky-300 hover:bg-sky-100'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Set HEAD to selected node"
              >
                <ArrowDown className="w-3 h-3 text-sky-500" />
                <span>HEAD</span>
              </button>

              {/* TAIL Tool */}
              <button
                id="btn-tool-tail"
                type="button"
                onClick={() => handleSetTail()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedAddress !== null
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Set TAIL to selected node"
              >
                <ArrowUp className="w-3 h-3 text-amber-500" />
                <span>TAIL</span>
              </button>

              {/* Delete Node Tool */}
              <button
                id="btn-tool-delete"
                type="button"
                onClick={() => handleDeleteNode()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedAddress !== null || temp !== null
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Free selected node from RAM"
              >
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span>Free Node</span>
              </button>
            </div>

            <button
              id="btn-check-answer-tools"
              type="button"
              onClick={handleCheckAnswer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-xs cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check Answer</span>
            </button>
          </div>

          {/* Unlinked Nodes State Warning Banner */}
          <div className="mt-3">
            {unlinkedInfo.count > 0 ? (
              <div
                id="unlinked-nodes-warning"
                className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-mono flex items-center gap-2.5 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-extrabold uppercase tracking-wide">
                    ⚠ UNLINKED NODES IN HEAP RAM ({unlinkedInfo.count}):
                  </span>{' '}
                  <span className="font-sans">
                    {unlinkedInfo.addresses.map((a) => `Node 0x${a}`).join(', ')}{' '}
                    {task.actionType === 'deletion'
                      ? 'orphaned from list! Use Free Node to deallocate.'
                      : 'waiting to be linked via NEXT/PREV or designated as HEAD/TAIL.'}
                  </span>
                </div>
              </div>
            ) : (
              <div
                id="continuous-chain-status"
                className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>✓ ALL ACTIVE HEAP NODES LINKED IN CONTINUOUS CHAIN</span>
              </div>
            )}
          </div>

          {/* Feedback Success or Error Banners */}
          {feedbackError && (
            <div className="mt-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-mono flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-sans">{feedbackError}</span>
            </div>
          )}

          {feedbackSuccess && !feedbackError && (
            <div className="mt-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-sans">{feedbackSuccess}</span>
            </div>
          )}

          {/* Canvas / Heap Viewport with Memory Box Nodes & Interactive Connectors */}
          <div className="mt-4 flex-1 min-h-[340px] flex items-center justify-center p-6 bg-slate-50/60 dark:bg-[#070D1E] border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-x-auto">
            {heapNodes.length === 0 ? (
              /* Empty RAM State */
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl max-w-md w-full bg-white/70 dark:bg-[#090F22]/70">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Linked List is Currently Empty <span className="text-sky-600 dark:text-sky-400">(HEAD == NULL)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Click{' '}
                  <button
                    type="button"
                    onClick={() => handleCreateNode()}
                    className="font-bold text-blue-600 dark:text-blue-400 cursor-pointer underline hover:text-blue-500 inline"
                  >
                    + Allocate Node
                  </button>{' '}
                  above to allocate memory on the RAM heap.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-4 min-w-max">
                {/* Left Terminal NULL for HEAD */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="px-3 py-2 bg-white dark:bg-[#090F22] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-500 shadow-xs">
                    NULL
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                    {head !== null ? `(prev of 0x${head})` : 'unlinked'}
                  </span>
                </div>

                {/* Left connector arrow */}
                <div className="text-slate-400 dark:text-slate-600 font-mono text-xs px-1">
                  ◄──►
                </div>

                {/* Memory Nodes Render */}
                {heapNodes.map((node) => {
                  const isHead = head === node.address;
                  const isTail = tail === node.address;
                  const isCurr = curr === node.address;
                  const isTemp = temp === node.address;
                  const isSelected = selectedAddress === node.address;
                  const isNextOpen =
                    openDropdown?.nodeAddress === node.address && openDropdown.field === 'next';
                  const isPrevOpen =
                    openDropdown?.nodeAddress === node.address && openDropdown.field === 'prev';

                  return (
                    <React.Fragment key={node.address}>
                      {/* Node Memory Card */}
                      <div className="flex flex-col items-center">
                        <div
                          onClick={() => {
                            const newSelected = isSelected ? null : node.address;
                            setSelectedAddress(newSelected);
                            if (newSelected !== null) {
                              soundManager.playClick();
                              if (activeStep) {
                                if (
                                  activeStep.actionType === 'select_node' ||
                                  activeStep.actionType === 'set_curr' ||
                                  activeStep.actionType === 'set_temp' ||
                                  activeStep.actionType === 'traverse_next' ||
                                  activeStep.actionType === 'traverse_prev'
                                ) {
                                  if (!activeStep.targetAddress || activeStep.targetAddress === node.address) {
                                    setFeedbackSuccess(`Selected Node 0x${node.address}.`);
                                    markStepDone(activeStep.stepNumber);
                                  }
                                } else if (activeStep.actionType === 'verify') {
                                  setFeedbackSuccess(`Verified boundary at Node 0x${node.address}.`);
                                  markStepDone(activeStep.stepNumber);
                                }
                              }
                            }
                          }}
                          className={`w-44 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#0B1428] shadow-sm relative cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md shadow-indigo-500/15'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {/* Node Header: RAM Address & Delete Button */}
                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-[#070D1E]/70 rounded-t-2xl">
                            <span className="text-[11px] font-mono font-black text-slate-700 dark:text-slate-300">
                              0x{node.address}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNode(node.address);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title={`Free Node 0x${node.address}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Node Body Fields: PREV, DATA, NEXT */}
                          <div className="p-3 space-y-2 font-mono text-xs">
                            {/* PREV Field */}
                            <div className="space-y-1 relative">
                              <div className="flex items-center justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                <span>PREV:</span>
                                <span>{node.prev !== null ? `→ 0x${node.prev}` : 'NULL'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(
                                    isPrevOpen
                                      ? null
                                      : { nodeAddress: node.address, field: 'prev' }
                                  );
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs hover:border-purple-400 transition-colors"
                              >
                                <span
                                  className={
                                    node.prev === null
                                      ? 'text-rose-500 font-bold'
                                      : 'text-purple-600 dark:text-purple-300 font-bold'
                                  }
                                >
                                  {node.prev === null ? 'NULL (0x0)' : `0x${node.prev}`}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              </button>

                              {/* PREV Dropdown Menu */}
                              {isPrevOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute left-0 right-0 top-full mt-1 z-40 bg-white dark:bg-[#0A1024] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 space-y-1 text-xs"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateNodePointer(node.address, 'prev', null)}
                                    className="w-full text-left px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-between"
                                  >
                                    <span>NULL</span>
                                    {node.prev === null && <Check className="w-3 h-3" />}
                                  </button>
                                  {allAddresses
                                    .filter((a) => a !== node.address)
                                    .map((addr) => (
                                      <button
                                        key={addr}
                                        type="button"
                                        onClick={() => handleUpdateNodePointer(node.address, 'prev', addr)}
                                        className="w-full text-left px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                                      >
                                        <span>Node 0x{addr}</span>
                                        {node.prev === addr && <Check className="w-3 h-3" />}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>

                            {/* DATA Field */}
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                DATA:
                              </span>
                              <span className="font-mono font-black text-sm text-slate-900 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {node.data}
                              </span>
                            </div>

                            {/* NEXT Field */}
                            <div className="space-y-1 relative">
                              <div className="flex items-center justify-between text-[10px] font-bold text-sky-600 dark:text-sky-400">
                                <span>NEXT:</span>
                                <span>{node.next !== null ? `→ 0x${node.next}` : 'NULL'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(
                                    isNextOpen
                                      ? null
                                      : { nodeAddress: node.address, field: 'next' }
                                  );
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs hover:border-sky-400 transition-colors"
                              >
                                <span
                                  className={
                                    node.next === null
                                      ? 'text-rose-500 font-bold'
                                      : 'text-sky-600 dark:text-sky-300 font-bold'
                                  }
                                >
                                  {node.next === null ? 'NULL (0x0)' : `0x${node.next}`}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              </button>

                              {/* NEXT Dropdown Menu */}
                              {isNextOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute left-0 right-0 top-full mt-1 z-40 bg-white dark:bg-[#0A1024] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 space-y-1 text-xs"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateNodePointer(node.address, 'next', null)}
                                    className="w-full text-left px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-between"
                                  >
                                    <span>NULL</span>
                                    {node.next === null && <Check className="w-3 h-3" />}
                                  </button>
                                  {allAddresses
                                    .filter((a) => a !== node.address)
                                    .map((addr) => (
                                      <button
                                        key={addr}
                                        type="button"
                                        onClick={() => handleUpdateNodePointer(node.address, 'next', addr)}
                                        className="w-full text-left px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                                      >
                                        <span>Node 0x{addr}</span>
                                        {node.next === addr && <Check className="w-3 h-3" />}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Attached Pointer Badges (HEAD, TAIL) */}
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1 max-w-[176px]">
                          {isHead && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500 text-slate-950 text-[10px] font-mono font-black shadow-xs">
                              <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                              <span>HEAD</span>
                            </div>
                          )}
                          {isTail && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-mono font-black shadow-xs">
                              <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                              <span>TAIL</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bidirectional Arrow between nodes */}
                      <div className="flex items-center text-slate-400 dark:text-slate-600 font-mono text-xs px-1">
                        <span>◄──►</span>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Right Terminal NULL for TAIL */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="px-3 py-2 bg-white dark:bg-[#090F22] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-500 shadow-xs">
                    NULL
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                    {tail !== null ? `(next of 0x${tail})` : 'unlinked'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT: STEP-BY-STEP PROGRESS PANEL + C/C++ EQUIVALENT BOX      */}
        {/* ============================================================== */}
        <div
          id="task-progress-panel"
          className="w-full lg:w-[420px] shrink-0 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            {/* Panel Header: Badges & Steps Completed Counter */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-black">
                Task #{task.taskNumber}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                {stepStatuses.filter((s) => s.isMet).length} / {stepStatuses.length} Steps
              </span>
            </div>

            {/* Task Title & Objective */}
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {task.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-sans">
                {task.hint}
              </p>
            </div>

            {/* Dynamic Step-by-Step Checklist */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">
                <span>STEP-BY-STEP TASK PROGRESS</span>
                {allStepsCompleted && (
                  <span className="text-emerald-500 font-bold">ALL 6 STEPS MET</span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 space-y-3">
                {stepStatuses.map((step, idx) => {
                  const isActive = idx === activeStepIndex && !allStepsCompleted;

                  return (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-xl transition-all border ${
                        step.isMet
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                          : isActive
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-500/60 ring-2 ring-indigo-400/20 shadow-xs'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Dynamic Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border text-xs font-bold transition-all ${
                            step.isMet
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                              : isActive
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs animate-pulse'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {step.isMet ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <span>{step.stepNumber}</span>
                          )}
                        </div>

                        {/* Step Description */}
                        <div className="flex-1">
                          <div
                            className={`text-xs font-bold leading-snug ${
                              step.isMet
                                ? 'text-emerald-700 dark:text-emerald-300 line-through opacity-80'
                                : isActive
                                ? 'text-indigo-900 dark:text-indigo-200'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {step.label}
                          </div>
                          {isActive && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans leading-relaxed">
                              {step.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* "Perform Next Step" Guided Action Button */}
                {!allStepsCompleted && (
                  <button
                    id="btn-perform-next-guided-step"
                    type="button"
                    onClick={handleExecuteNextGuidedStep}
                    className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-mono font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Perform Step {activeStep?.stepNumber || 1} Automatically</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>

            {/* Code Implementation Box with C | C++ | Java | Python Tabs */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Code Implementation</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Copy code snippet"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Language Selector: C | C++ | Java | Python */}
              <div className="flex items-center gap-1 mb-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(['c', 'cpp', 'java', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLang(lang)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Python'}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#060B18] text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed font-medium shadow-inner">
                <div className="text-[10px] text-slate-500 font-mono mb-1">
                  // Step {activeStep?.stepNumber || 1} [{selectedLang.toUpperCase()}]:
                </div>
                <pre className="whitespace-pre-wrap">
                  <code>{getCodeSnippetForLanguage(activeStep?.cCodeSnippet || '// All operations executed', selectedLang)}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Bottom Action Button: Next Task or Check Answer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {allStepsCompleted ? (
              <button
                id="btn-next-task-completed"
                type="button"
                onClick={onNextTask}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-black shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>Proceed to Next Task</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-bottom-check-answer"
                type="button"
                onClick={handleCheckAnswer}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Pointer Integrity</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
