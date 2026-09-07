import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Scissors,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Globe,
  Layers,
  Link as LinkIcon,
  Square,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { TaskConfig } from '../../types/dllGameTypes';

interface DLLArenaInteractiveViewProps {
  levelNumber: number;
  task: TaskConfig;
  isGuidedMode: boolean;
  onToggleGuidedMode: () => void;
  onTaskCompleted: (taskId: string, xp: number) => void;
  onBackToLevels: () => void;
}

export const DLLArenaInteractiveView: React.FC<DLLArenaInteractiveViewProps> = ({
  levelNumber,
  task,
  isGuidedMode,
  onToggleGuidedMode,
  onTaskCompleted,
  onBackToLevels,
}) => {
  // Common state
  const [guidedStepIdx, setGuidedStepIdx] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // =========================================================================
  // LEVEL 1: THE TRAIN LINKER STATE
  // =========================================================================
  const [trainConnections, setTrainConnections] = useState<{
    aNext: boolean;
    bPrev: boolean;
    bNext: boolean;
    cPrev: boolean;
  }>({
    aNext: false,
    bPrev: false,
    bNext: false,
    cPrev: false,
  });
  const [activeTrainPort, setActiveTrainPort] = useState<string | null>(null);
  const [isTestingSignal, setIsTestingSignal] = useState<boolean>(false);
  const [signalPosition, setSignalPosition] = useState<'none' | 'A' | 'B' | 'C' | 'returnB' | 'returnA'>('none');

  // =========================================================================
  // LEVEL 2: MEMORY ARCHITECT STATE
  // =========================================================================
  const [memorySlots, setMemorySlots] = useState<{
    left_slot: string | null;
    center_slot: string | null;
    right_slot: string | null;
  }>({
    left_slot: null,
    center_slot: null,
    right_slot: null,
  });
  const [distractorAlert, setDistractorAlert] = useState<string | null>(null);

  // =========================================================================
  // LEVEL 3: THE BOUNDARY GUARD STATE
  // =========================================================================
  const [headBadgeNode, setHeadBadgeNode] = useState<string | null>(null);
  const [tailBadgeNode, setTailBadgeNode] = useState<string | null>(null);
  const [node10PrevTerminated, setNode10PrevTerminated] = useState<boolean>(false);
  const [node30NextTerminated, setNode30NextTerminated] = useState<boolean>(false);

  // =========================================================================
  // LEVEL 4: TWO-WAY HIGHWAY STATE
  // =========================================================================
  const [traversalIndex, setTraversalIndex] = useState<number>(0);
  const [collectedGems, setCollectedGems] = useState<number[]>([1]);
  const [hasVisitedTail, setHasVisitedTail] = useState<boolean>(false);
  const [nullViolationWarning, setNullViolationWarning] = useState<boolean>(false);
  const [highwayCompleted, setHighwayCompleted] = useState<boolean>(false);

  // =========================================================================
  // LEVEL 5: LEAD THE CHARGE STATE (Insert at Head)
  // =========================================================================
  const [l5Wire5Next, setL5Wire5Next] = useState<boolean>(false);
  const [l5Wire5PrevNull, setL5Wire5PrevNull] = useState<boolean>(false);
  const [l5Wire10Prev5, setL5Wire10Prev5] = useState<boolean>(false);
  const [l5HeadBadge, setL5HeadBadge] = useState<string>('node_10');

  // =========================================================================
  // LEVEL 6: CATCH THE CABOOSE STATE (Insert at Tail)
  // =========================================================================
  const [l6Wire40Prev30, setL6Wire40Prev30] = useState<boolean>(false);
  const [l6Wire40NextNull, setL6Wire40NextNull] = useState<boolean>(false);
  const [l6Wire30Next40, setL6Wire30Next40] = useState<boolean>(false);
  const [l6TailBadge, setL6TailBadge] = useState<string>('node_30');

  // =========================================================================
  // LEVEL 7: MIDDLE SPLICING STATE (Insert at Position)
  // =========================================================================
  const [l7OldLinkSevered, setL7OldLinkSevered] = useState<boolean>(false);
  const [l7Wire15Next20, setL7Wire15Next20] = useState<boolean>(false);
  const [l7Wire15Prev10, setL7Wire15Prev10] = useState<boolean>(false);
  const [l7Wire10Next15, setL7Wire10Next15] = useState<boolean>(false);
  const [l7Wire20Prev15, setL7Wire20Prev15] = useState<boolean>(false);
  const [scissorActive, setScissorActive] = useState<boolean>(false);

  // =========================================================================
  // LEVEL 8: PRUNE THE ENDS STATE (Delete Head & Tail)
  // =========================================================================
  const [l8HeadBadge, setL8HeadBadge] = useState<string>('node_5');
  const [l8TailBadge, setL8TailBadge] = useState<string>('node_30');
  const [l8Node10PrevNull, setL8Node10PrevNull] = useState<boolean>(false);
  const [l8Node20NextNull, setL8Node20NextNull] = useState<boolean>(false);
  const [l8Node5Deallocated, setL8Node5Deallocated] = useState<boolean>(false);
  const [l8Node30Deallocated, setL8Node30Deallocated] = useState<boolean>(false);

  // =========================================================================
  // LEVEL 9: BROWSER HISTORY & MIDDLE DELETION STATE
  // =========================================================================
  const [l9GoogleNextGithub, setL9GoogleNextGithub] = useState<boolean>(false);
  const [l9GithubPrevGoogle, setL9GithubPrevGoogle] = useState<boolean>(false);
  const [l9MalwareDeallocated, setL9MalwareDeallocated] = useState<boolean>(false);
  const [l9CurrentPage, setL9CurrentPage] = useState<'google' | 'malware' | 'github'>('google');
  const [l9BrowserValidated, setL9BrowserValidated] = useState<boolean>(false);

  // Check Win Conditions
  useEffect(() => {
    if (isCompleted) return;

    let satisfied = false;

    if (levelNumber === 1) {
      if (
        trainConnections.aNext &&
        trainConnections.bPrev &&
        trainConnections.bNext &&
        trainConnections.cPrev
      ) {
        satisfied = true;
      }
    } else if (levelNumber === 2) {
      if (
        memorySlots.left_slot === 'item_prev' &&
        memorySlots.center_slot === 'item_data' &&
        memorySlots.right_slot === 'item_next'
      ) {
        satisfied = true;
      }
    } else if (levelNumber === 3) {
      if (
        headBadgeNode === 'node_10' &&
        tailBadgeNode === 'node_30' &&
        node10PrevTerminated &&
        node30NextTerminated
      ) {
        satisfied = true;
      }
    } else if (levelNumber === 4) {
      if (highwayCompleted) {
        satisfied = true;
      }
    } else if (levelNumber === 5) {
      if (
        l5Wire5Next &&
        l5Wire5PrevNull &&
        l5Wire10Prev5 &&
        l5HeadBadge === 'node_5'
      ) {
        satisfied = true;
      }
    } else if (levelNumber === 6) {
      if (
        l6Wire40Prev30 &&
        l6Wire40NextNull &&
        l6Wire30Next40 &&
        l6TailBadge === 'node_40'
      ) {
        satisfied = true;
      }
    } else if (levelNumber === 7) {
      if (
        l7OldLinkSevered &&
        l7Wire10Next15 &&
        l7Wire15Prev10 &&
        l7Wire15Next20 &&
        l7Wire20Prev15
      ) {
        satisfied = true;
      }
    } else if (levelNumber === 8) {
      if (
        l8HeadBadge === 'node_10' &&
        l8TailBadge === 'node_20' &&
        l8Node10PrevNull &&
        l8Node20NextNull &&
        l8Node5Deallocated &&
        l8Node30Deallocated
      ) {
        satisfied = true;
      }
    } else if (levelNumber === 9) {
      if (
        l9GoogleNextGithub &&
        l9GithubPrevGoogle &&
        l9MalwareDeallocated &&
        l9BrowserValidated
      ) {
        satisfied = true;
      }
    }

    if (satisfied) {
      setIsCompleted(true);
      soundManager.playLevelComplete();
      showToast('🎉 Outstanding! Level Win Condition Complete!', 'success');
      onTaskCompleted(task.id, task.xpReward);
    }
  }, [
    levelNumber,
    trainConnections,
    memorySlots,
    headBadgeNode,
    tailBadgeNode,
    node10PrevTerminated,
    node30NextTerminated,
    highwayCompleted,
    l5Wire5Next,
    l5Wire5PrevNull,
    l5Wire10Prev5,
    l5HeadBadge,
    l6Wire40Prev30,
    l6Wire40NextNull,
    l6Wire30Next40,
    l6TailBadge,
    l7OldLinkSevered,
    l7Wire10Next15,
    l7Wire15Prev10,
    l7Wire15Next20,
    l7Wire20Prev15,
    l8HeadBadge,
    l8TailBadge,
    l8Node10PrevNull,
    l8Node20NextNull,
    l8Node5Deallocated,
    l8Node30Deallocated,
    l9GoogleNextGithub,
    l9GithubPrevGoogle,
    l9MalwareDeallocated,
    l9BrowserValidated,
    isCompleted,
    onTaskCompleted,
    task.id,
    task.xpReward,
  ]);

  // Reset current level
  const handleResetLevel = () => {
    soundManager.playClick();
    setGuidedStepIdx(0);
    setIsCompleted(false);

    if (levelNumber === 1) {
      setTrainConnections({ aNext: false, bPrev: false, bNext: false, cPrev: false });
      setActiveTrainPort(null);
      setIsTestingSignal(false);
      setSignalPosition('none');
    } else if (levelNumber === 2) {
      setMemorySlots({ left_slot: null, center_slot: null, right_slot: null });
      setDistractorAlert(null);
    } else if (levelNumber === 3) {
      setHeadBadgeNode(null);
      setTailBadgeNode(null);
      setNode10PrevTerminated(false);
      setNode30NextTerminated(false);
    } else if (levelNumber === 4) {
      setTraversalIndex(0);
      setCollectedGems([1]);
      setHasVisitedTail(false);
      setNullViolationWarning(false);
      setHighwayCompleted(false);
    } else if (levelNumber === 5) {
      setL5Wire5Next(false);
      setL5Wire5PrevNull(false);
      setL5Wire10Prev5(false);
      setL5HeadBadge('node_10');
    } else if (levelNumber === 6) {
      setL6Wire40Prev30(false);
      setL6Wire40NextNull(false);
      setL6Wire30Next40(false);
      setL6TailBadge('node_30');
    } else if (levelNumber === 7) {
      setL7OldLinkSevered(false);
      setL7Wire15Next20(false);
      setL7Wire15Prev10(false);
      setL7Wire10Next15(false);
      setL7Wire20Prev15(false);
      setScissorActive(false);
    } else if (levelNumber === 8) {
      setL8HeadBadge('node_5');
      setL8TailBadge('node_30');
      setL8Node10PrevNull(false);
      setL8Node20NextNull(false);
      setL8Node5Deallocated(false);
      setL8Node30Deallocated(false);
    } else if (levelNumber === 9) {
      setL9GoogleNextGithub(false);
      setL9GithubPrevGoogle(false);
      setL9MalwareDeallocated(false);
      setL9CurrentPage('google');
      setL9BrowserValidated(false);
    }

    showToast('Level reset to initial state.', 'info');
  };

  // =========================================================================
  // GUIDED SOLVE NEXT STEP EXECUTOR
  // =========================================================================
  const handleExecuteGuidedNextStep = () => {
    soundManager.playClick();

    if (levelNumber === 1) {
      if (!trainConnections.aNext) {
        setTrainConnections((prev) => ({ ...prev, aNext: true }));
        setGuidedStepIdx(1);
        showToast('Step 1: Linked Node A.next -> Node B', 'info');
      } else if (!trainConnections.bNext) {
        setTrainConnections((prev) => ({ ...prev, bNext: true }));
        setGuidedStepIdx(2);
        showToast('Step 2: Linked Node B.next -> Node C', 'info');
      } else if (!trainConnections.cPrev) {
        setTrainConnections((prev) => ({ ...prev, cPrev: true }));
        setGuidedStepIdx(3);
        showToast('Step 3: Linked Node C.prev -> Node B', 'info');
      } else if (!trainConnections.bPrev) {
        setTrainConnections((prev) => ({ ...prev, bPrev: true }));
        setGuidedStepIdx(4);
        showToast('Step 4: Linked Node B.prev -> Node A', 'info');
      }
    } else if (levelNumber === 2) {
      if (!memorySlots.left_slot) {
        setMemorySlots((prev) => ({ ...prev, left_slot: 'item_prev' }));
        setGuidedStepIdx(1);
        showToast('Step 1: Slotted prev pointer (*Node) into Left Slot', 'info');
      } else if (!memorySlots.center_slot) {
        setMemorySlots((prev) => ({ ...prev, center_slot: 'item_data' }));
        setGuidedStepIdx(2);
        showToast('Step 2: Slotted data payload (int 42) into Center Slot', 'info');
      } else if (!memorySlots.right_slot) {
        setMemorySlots((prev) => ({ ...prev, right_slot: 'item_next' }));
        setGuidedStepIdx(3);
        showToast('Step 3: Slotted next pointer (*Node) into Right Slot', 'info');
      }
    } else if (levelNumber === 3) {
      if (!headBadgeNode) {
        setHeadBadgeNode('node_10');
        setGuidedStepIdx(1);
        showToast('Step 1: Assigned HEAD badge to node [10]', 'info');
      } else if (!tailBadgeNode) {
        setTailBadgeNode('node_30');
        setGuidedStepIdx(2);
        showToast('Step 2: Assigned TAIL badge to node [30]', 'info');
      } else if (!node10PrevTerminated) {
        setNode10PrevTerminated(true);
        setGuidedStepIdx(3);
        showToast('Step 3: Terminated node [10].prev into left NULL terminal', 'info');
      } else if (!node30NextTerminated) {
        setNode30NextTerminated(true);
        setGuidedStepIdx(4);
        showToast('Step 4: Terminated node [30].next into right NULL terminal', 'info');
      }
    } else if (levelNumber === 4) {
      if (traversalIndex < 4) {
        const nextIdx = traversalIndex + 1;
        setTraversalIndex(nextIdx);
        setCollectedGems((prev) => [...new Set([...prev, nextIdx + 1])]);
        if (nextIdx === 4) setHasVisitedTail(true);
        showToast(`Advanced forward to node [${nextIdx + 1}]`, 'info');
      } else if (traversalIndex > 0) {
        const prevIdx = traversalIndex - 1;
        setTraversalIndex(prevIdx);
        if (prevIdx === 0 && hasVisitedTail) {
          setHighwayCompleted(true);
        }
        showToast(`Retreated backward to node [${prevIdx + 1}]`, 'info');
      }
    } else if (levelNumber === 5) {
      if (!l5Wire5Next) {
        setL5Wire5Next(true);
        setGuidedStepIdx(1);
        showToast('Step 1: [5]->next = [10]', 'info');
      } else if (!l5Wire5PrevNull) {
        setL5Wire5PrevNull(true);
        setGuidedStepIdx(2);
        showToast('Step 2: [5]->prev = NULL', 'info');
      } else if (!l5Wire10Prev5) {
        setL5Wire10Prev5(true);
        setGuidedStepIdx(3);
        showToast('Step 3: [10]->prev = [5]', 'info');
      } else if (l5HeadBadge !== 'node_5') {
        setL5HeadBadge('node_5');
        setGuidedStepIdx(4);
        showToast('Step 4: HEAD = [5]', 'info');
      }
    } else if (levelNumber === 6) {
      if (!l6Wire40Prev30) {
        setL6Wire40Prev30(true);
        setGuidedStepIdx(1);
        showToast('Step 1: [40]->prev = [30]', 'info');
      } else if (!l6Wire40NextNull) {
        setL6Wire40NextNull(true);
        setGuidedStepIdx(2);
        showToast('Step 2: [40]->next = NULL', 'info');
      } else if (!l6Wire30Next40) {
        setL6Wire30Next40(true);
        setGuidedStepIdx(3);
        showToast('Step 3: [30]->next = [40]', 'info');
      } else if (l6TailBadge !== 'node_40') {
        setL6TailBadge('node_40');
        setGuidedStepIdx(4);
        showToast('Step 4: TAIL = [40]', 'info');
      }
    } else if (levelNumber === 7) {
      if (!l7Wire15Next20) {
        setL7Wire15Next20(true);
        setGuidedStepIdx(1);
        showToast('Step 1: [15]->next = [20]', 'info');
      } else if (!l7Wire15Prev10) {
        setL7Wire15Prev10(true);
        setGuidedStepIdx(2);
        showToast('Step 2: [15]->prev = [10]', 'info');
      } else if (!l7OldLinkSevered) {
        setL7OldLinkSevered(true);
        setGuidedStepIdx(3);
        showToast('Step 3: Severed old link between [10] and [20]', 'info');
      } else if (!l7Wire10Next15) {
        setL7Wire10Next15(true);
        setGuidedStepIdx(4);
        showToast('Step 4: [10]->next = [15]', 'info');
      } else if (!l7Wire20Prev15) {
        setL7Wire20Prev15(true);
        setGuidedStepIdx(5);
        showToast('Step 5: [20]->prev = [15]', 'info');
      }
    } else if (levelNumber === 8) {
      if (l8HeadBadge !== 'node_10') {
        setL8HeadBadge('node_10');
        setGuidedStepIdx(1);
        showToast('Step 1: HEAD = [10]', 'info');
      } else if (!l8Node10PrevNull) {
        setL8Node10PrevNull(true);
        setGuidedStepIdx(2);
        showToast('Step 2: [10]->prev = NULL', 'info');
      } else if (!l8Node5Deallocated) {
        setL8Node5Deallocated(true);
        setGuidedStepIdx(3);
        showToast('Step 3: free([5]) into Trash Can', 'info');
      } else if (l8TailBadge !== 'node_20') {
        setL8TailBadge('node_20');
        setGuidedStepIdx(4);
        showToast('Step 4: TAIL = [20]', 'info');
      } else if (!l8Node20NextNull) {
        setL8Node20NextNull(true);
        setGuidedStepIdx(5);
        showToast('Step 5: [20]->next = NULL', 'info');
      } else if (!l8Node30Deallocated) {
        setL8Node30Deallocated(true);
        setGuidedStepIdx(6);
        showToast('Step 6: free([30]) into Trash Can', 'info');
      }
    } else if (levelNumber === 9) {
      if (!l9GoogleNextGithub) {
        setL9GoogleNextGithub(true);
        setGuidedStepIdx(1);
        showToast('Step 1: google.next = github', 'info');
      } else if (!l9GithubPrevGoogle) {
        setL9GithubPrevGoogle(true);
        setGuidedStepIdx(2);
        showToast('Step 2: github.prev = google', 'info');
      } else if (!l9MalwareDeallocated) {
        setL9MalwareDeallocated(true);
        setGuidedStepIdx(3);
        showToast('Step 3: free(malware) into Trash Can', 'info');
      } else if (!l9BrowserValidated) {
        setL9BrowserValidated(true);
        setL9CurrentPage('github');
        setGuidedStepIdx(4);
        showToast('Step 4: Browser navigation validated between google and github!', 'info');
      }
    }
  };

  // Run Test Signal (Level 1)
  const handleRunTestSignal = () => {
    if (
      !trainConnections.aNext ||
      !trainConnections.bPrev ||
      !trainConnections.bNext ||
      !trainConnections.cPrev
    ) {
      soundManager.playError();
      showToast('Incomplete links! Connect all 4 bidirectional cables before pulsing signal.', 'error');
      return;
    }

    soundManager.playClick();
    setIsTestingSignal(true);
    setSignalPosition('A');

    setTimeout(() => setSignalPosition('B'), 400);
    setTimeout(() => setSignalPosition('C'), 800);
    setTimeout(() => setSignalPosition('returnB'), 1200);
    setTimeout(() => {
      setSignalPosition('returnA');
      soundManager.playSuccess();
      showToast('⚡ Bi-directional Signal Test Passed! Full round-trip verified.', 'success');
      setTimeout(() => {
        setIsTestingSignal(false);
        setSignalPosition('none');
      }, 500);
    }, 1600);
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Toast notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl font-mono text-xs font-bold shadow-xl border flex items-center gap-2 animate-bounce-short ${
            toastMsg.type === 'success'
              ? 'bg-[#0B132B] border-[#2563EB] text-blue-400'
              : toastMsg.type === 'error'
              ? 'bg-rose-950/90 border-rose-600 text-rose-300'
              : 'bg-[#0B132B] border-slate-700 text-slate-200'
          }`}
        >
          {toastMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          {toastMsg.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* TOP ARENA HEADER */}
      <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLevels}
            className="w-10 h-10 rounded-2xl bg-[#141f38] border border-[#213459] text-blue-400 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-blue-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              LEVEL {levelNumber.toString().padStart(2, '0')} INTERACTIVE ARENA • {task.concept}
            </div>
            <h2 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
              <span>{task.title}</span>
              {isCompleted && (
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-900/60 border border-blue-600 text-blue-400 text-xs font-mono font-bold">
                  ✓ Completed (+{task.xpReward} XP)
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Guided Solve Toggle */}
          <button
            onClick={onToggleGuidedMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
              isGuidedMode
                ? 'bg-[#2563EB] text-white border-blue-500 shadow-lg shadow-blue-600/30'
                : 'bg-[#141f38] text-blue-400 border-[#213459] hover:bg-[#1a284a]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGuidedMode ? 'Guided Solve: ACTIVE' : 'Turn On Guided Solve'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetLevel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141f38] border border-[#213459] text-slate-300 hover:text-white hover:bg-[#1b2a4b] text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* GUIDED SOLVE BAR (WHEN ACTIVE) */}
      {isGuidedMode && (
        <div className="bg-[#0B132B] border border-[#2563EB] rounded-2xl p-4 shadow-lg shadow-blue-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                  Guided Solve Mode
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#141f38] border border-blue-800 text-blue-300">
                  Step {guidedStepIdx + 1} of {task.guidedSteps.length}
                </span>
              </div>
              <p className="text-sm text-slate-200 mt-1">
                {task.guidedSteps[guidedStepIdx]?.instruction || 'All steps successfully completed!'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {task.guidedSteps[guidedStepIdx]?.explanation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {guidedStepIdx < task.guidedSteps.length && (
              <button
                onClick={handleExecuteGuidedNextStep}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-mono font-bold shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Next Step</span>
              </button>
            )}
            <button
              onClick={onToggleGuidedMode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141f38] border border-[#213459] text-slate-300 hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-rose-400" />
              <span>Stop Guided Solve</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 1 INTERACTIVE BOARD: THE TRAIN LINKER
      ====================================================================== */}
      {levelNumber === 1 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#18243d]">
            <div>
              <h3 className="text-lg font-black text-white">Railway Track Node Coupling Area</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click ports or buttons to couple NEXT (forward) and PREV (backward) couplers between train cars.
              </p>
            </div>
            <button
              onClick={handleRunTestSignal}
              disabled={isTestingSignal}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold shadow-md transition-all cursor-pointer ${
                trainConnections.aNext &&
                trainConnections.bPrev &&
                trainConnections.bNext &&
                trainConnections.cPrev
                  ? 'bg-[#2563EB] hover:bg-blue-600 text-white shadow-blue-600/30 active:scale-95'
                  : 'bg-[#141f38] text-slate-500 border border-[#213459] cursor-not-allowed'
              }`}
            >
              <Zap className={`w-4 h-4 ${isTestingSignal ? 'animate-spin' : 'fill-white'}`} />
              <span>{isTestingSignal ? 'Pulsing Signal...' : 'Test Signal Button'}</span>
            </button>
          </div>

          {/* Train Tracks Layout */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] overflow-x-auto">
            {/* Background Railway Tracks */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-4 flex items-center justify-between pointer-events-none opacity-20">
              <div className="w-full h-1 bg-slate-600 border-y border-dashed border-slate-400" />
            </div>

            <div className="flex items-center justify-around min-w-[620px] gap-6 relative z-10">
              {/* TRAIN CAR A */}
              <div
                className={`w-44 p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  signalPosition === 'A' || signalPosition === 'returnA'
                    ? 'bg-[#15254d] border-[#2563EB] ring-4 ring-blue-500/40'
                    : 'bg-[#0e172e] border-[#1d2d50]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                  TRAIN CAR A (0x1001)
                </div>
                <div className="my-4 text-center">
                  <span className="text-2xl font-black text-white">Car A</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1a2948]">
                  <span className="text-[10px] font-mono text-slate-500">prev: NULL</span>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setTrainConnections((p) => ({ ...p, aNext: !p.aNext }));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      trainConnections.aNext
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#162445] text-blue-400 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    next: {trainConnections.aNext ? '0x1002' : '∅ Connect'}
                  </button>
                </div>
              </div>

              {/* COUPLERS A <=> B */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setTrainConnections((p) => ({ ...p, aNext: !p.aNext }));
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    trainConnections.aNext
                      ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#0f1b36] border-[#1c2e55] text-slate-400 hover:text-white'
                  }`}
                >
                  A.next ──►
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setTrainConnections((p) => ({ ...p, bPrev: !p.bPrev }));
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    trainConnections.bPrev
                      ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#0f1b36] border-[#1c2e55] text-slate-400 hover:text-white'
                  }`}
                >
                  ◄── B.prev
                </button>
              </div>

              {/* TRAIN CAR B */}
              <div
                className={`w-44 p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  signalPosition === 'B' || signalPosition === 'returnB'
                    ? 'bg-[#15254d] border-[#2563EB] ring-4 ring-blue-500/40'
                    : 'bg-[#0e172e] border-[#1d2d50]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                  TRAIN CAR B (0x1002)
                </div>
                <div className="my-4 text-center">
                  <span className="text-2xl font-black text-white">Car B</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1a2948]">
                  <span className="text-[10px] font-mono text-slate-400">
                    {trainConnections.bPrev ? 'prev: A' : 'prev: ∅'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {trainConnections.bNext ? 'next: C' : 'next: ∅'}
                  </span>
                </div>
              </div>

              {/* COUPLERS B <=> C */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setTrainConnections((p) => ({ ...p, bNext: !p.bNext }));
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    trainConnections.bNext
                      ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#0f1b36] border-[#1c2e55] text-slate-400 hover:text-white'
                  }`}
                >
                  B.next ──►
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setTrainConnections((p) => ({ ...p, cPrev: !p.cPrev }));
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    trainConnections.cPrev
                      ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#0f1b36] border-[#1c2e55] text-slate-400 hover:text-white'
                  }`}
                >
                  ◄── C.prev
                </button>
              </div>

              {/* TRAIN CAR C */}
              <div
                className={`w-44 p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  signalPosition === 'C'
                    ? 'bg-[#15254d] border-[#2563EB] ring-4 ring-blue-500/40'
                    : 'bg-[#0e172e] border-[#1d2d50]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                  TRAIN CAR C (0x1003)
                </div>
                <div className="my-4 text-center">
                  <span className="text-2xl font-black text-white">Car C</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1a2948]">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setTrainConnections((p) => ({ ...p, cPrev: !p.cPrev }));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      trainConnections.cPrev
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#162445] text-blue-400 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    prev: {trainConnections.cPrev ? '0x1002' : '∅ Connect'}
                  </button>
                  <span className="text-[10px] font-mono text-slate-500">next: NULL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 2 INTERACTIVE BOARD: MEMORY ARCHITECT
      ====================================================================== */}
      {levelNumber === 2 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div>
            <h3 className="text-lg font-black text-white">struct Node 3-Field Memory Blueprint</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click items from the Component Warehouse to slot into the Node memory container. Distractors will be rejected!
            </p>
          </div>

          {/* Distractor alert banner */}
          {distractorAlert && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-300 text-xs font-mono flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{distractorAlert}</span>
            </div>
          )}

          {/* 3-Section Container */}
          <div className="p-6 rounded-2xl bg-[#070d1d] border border-[#162238] space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
              TARGET HEAP MEMORY BLOCK (sizeof(struct Node) = 24 bytes)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Slot */}
              <div
                onClick={() => {
                  if (memorySlots.left_slot) {
                    soundManager.playClick();
                    setMemorySlots((p) => ({ ...p, left_slot: null }));
                  }
                }}
                className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[130px] transition-all cursor-pointer ${
                  memorySlots.left_slot
                    ? 'bg-[#101e42] border-[#2563EB] text-blue-300'
                    : 'bg-[#0b1328] border-slate-700 text-slate-500 hover:border-blue-400'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  OFFSET +0: LEFT SLOT (8 Bytes)
                </span>
                <span className="text-sm font-bold mt-2 text-center text-white">
                  {memorySlots.left_slot ? 'Pointer: prev (*Node)' : '+ Empty: Drop "prev" Pointer'}
                </span>
                {memorySlots.left_slot && (
                  <span className="text-[10px] font-mono text-blue-400 mt-1">Click to unslot</span>
                )}
              </div>

              {/* Center Slot */}
              <div
                onClick={() => {
                  if (memorySlots.center_slot) {
                    soundManager.playClick();
                    setMemorySlots((p) => ({ ...p, center_slot: null }));
                  }
                }}
                className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[130px] transition-all cursor-pointer ${
                  memorySlots.center_slot
                    ? 'bg-[#101e42] border-[#2563EB] text-blue-300'
                    : 'bg-[#0b1328] border-slate-700 text-slate-500 hover:border-blue-400'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  OFFSET +8: CENTER SLOT (4 Bytes)
                </span>
                <span className="text-sm font-bold mt-2 text-center text-white">
                  {memorySlots.center_slot ? 'Data Payload (int 42)' : '+ Empty: Drop Data Payload'}
                </span>
                {memorySlots.center_slot && (
                  <span className="text-[10px] font-mono text-blue-400 mt-1">Click to unslot</span>
                )}
              </div>

              {/* Right Slot */}
              <div
                onClick={() => {
                  if (memorySlots.right_slot) {
                    soundManager.playClick();
                    setMemorySlots((p) => ({ ...p, right_slot: null }));
                  }
                }}
                className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[130px] transition-all cursor-pointer ${
                  memorySlots.right_slot
                    ? 'bg-[#101e42] border-[#2563EB] text-blue-300'
                    : 'bg-[#0b1328] border-slate-700 text-slate-500 hover:border-blue-400'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  OFFSET +16: RIGHT SLOT (8 Bytes)
                </span>
                <span className="text-sm font-bold mt-2 text-center text-white">
                  {memorySlots.right_slot ? 'Pointer: next (*Node)' : '+ Empty: Drop "next" Pointer'}
                </span>
                {memorySlots.right_slot && (
                  <span className="text-[10px] font-mono text-blue-400 mt-1">Click to unslot</span>
                )}
              </div>
            </div>
          </div>

          {/* Component Warehouse Inventory */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
              COMPONENT WAREHOUSE (Click item to slot into matching container slot)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Item Prev */}
              <button
                disabled={memorySlots.left_slot !== null}
                onClick={() => {
                  soundManager.playClick();
                  setDistractorAlert(null);
                  setMemorySlots((p) => ({ ...p, left_slot: 'item_prev' }));
                  showToast('Slotted Pointer: prev (*Node) into Left Slot', 'info');
                }}
                className={`p-4 rounded-xl border font-mono text-xs font-bold text-left transition-all cursor-pointer ${
                  memorySlots.left_slot
                    ? 'bg-[#0b1224] border-[#16233d] text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-[#141f38] border-[#213459] text-blue-400 hover:bg-blue-600 hover:text-white'
                }`}
              >
                Pointer: prev (*Node)
                <span className="block text-[10px] text-slate-400 font-normal mt-1">
                  Valid DLL structural field
                </span>
              </button>

              {/* Item Data */}
              <button
                disabled={memorySlots.center_slot !== null}
                onClick={() => {
                  soundManager.playClick();
                  setDistractorAlert(null);
                  setMemorySlots((p) => ({ ...p, center_slot: 'item_data' }));
                  showToast('Slotted Data Payload (int 42) into Center Slot', 'info');
                }}
                className={`p-4 rounded-xl border font-mono text-xs font-bold text-left transition-all cursor-pointer ${
                  memorySlots.center_slot
                    ? 'bg-[#0b1224] border-[#16233d] text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-[#141f38] border-[#213459] text-blue-400 hover:bg-blue-600 hover:text-white'
                }`}
              >
                Data Payload (int 42)
                <span className="block text-[10px] text-slate-400 font-normal mt-1">
                  Valid element data field
                </span>
              </button>

              {/* Item Next */}
              <button
                disabled={memorySlots.right_slot !== null}
                onClick={() => {
                  soundManager.playClick();
                  setDistractorAlert(null);
                  setMemorySlots((p) => ({ ...p, right_slot: 'item_next' }));
                  showToast('Slotted Pointer: next (*Node) into Right Slot', 'info');
                }}
                className={`p-4 rounded-xl border font-mono text-xs font-bold text-left transition-all cursor-pointer ${
                  memorySlots.right_slot
                    ? 'bg-[#0b1224] border-[#16233d] text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-[#141f38] border-[#213459] text-blue-400 hover:bg-blue-600 hover:text-white'
                }`}
              >
                Pointer: next (*Node)
                <span className="block text-[10px] text-slate-400 font-normal mt-1">
                  Valid DLL structural field
                </span>
              </button>

              {/* Distractor 1: Index [0] */}
              <button
                onClick={() => {
                  soundManager.playError();
                  setDistractorAlert(
                    '❌ Rejected: Arrays use indices [0], but Linked Lists use pointer addresses in memory!'
                  );
                }}
                className="p-4 rounded-xl bg-[#141f38] border border-[#213459] hover:border-rose-500 font-mono text-xs font-bold text-left text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
              >
                Index [0]
                <span className="block text-[10px] text-slate-400 font-normal mt-1">
                  Array positional offset
                </span>
              </button>

              {/* Distractor 2: Hash Key */}
              <button
                onClick={() => {
                  soundManager.playError();
                  setDistractorAlert(
                    '❌ Rejected: Hash Tables store key-value buckets; DLL nodes only hold prev, data, and next!'
                  );
                }}
                className="p-4 rounded-xl bg-[#141f38] border border-[#213459] hover:border-rose-500 font-mono text-xs font-bold text-left text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
              >
                Hash Key
                <span className="block text-[10px] text-slate-400 font-normal mt-1">
                  Dictionary hash digest
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 3 INTERACTIVE BOARD: THE BOUNDARY GUARD
      ====================================================================== */}
      {levelNumber === 3 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">List Boundary Protection Terminal</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Attach HEAD and TAIL badges, then connect endpoint boundaries to NULL terminals.
              </p>
            </div>

            {/* Draggable Badges Staging */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setHeadBadgeNode((prev) => (prev === 'node_10' ? null : 'node_10'));
                  showToast('HEAD badge toggled on node [10]', 'info');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  headBadgeNode === 'node_10'
                    ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'bg-[#141f38] border-[#213459] text-blue-400 hover:bg-[#1c2c4e]'
                }`}
              >
                {headBadgeNode === 'node_10' ? '✓ HEAD: node_10' : '+ Place HEAD Badge'}
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setTailBadgeNode((prev) => (prev === 'node_30' ? null : 'node_30'));
                  showToast('TAIL badge toggled on node [30]', 'info');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  tailBadgeNode === 'node_30'
                    ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'bg-[#141f38] border-[#213459] text-blue-400 hover:bg-[#1c2c4e]'
                }`}
              >
                {tailBadgeNode === 'node_30' ? '✓ TAIL: node_30' : '+ Place TAIL Badge'}
              </button>
            </div>
          </div>

          {/* Board with Left NULL and Right NULL */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] flex items-center justify-between gap-4 overflow-x-auto min-w-[620px]">
            {/* Left NULL Terminal */}
            <button
              onClick={() => {
                soundManager.playClick();
                setNode10PrevTerminated((p) => !p);
                showToast('Left NULL terminal boundary toggled', 'info');
              }}
              className={`p-4 rounded-2xl border-2 font-mono text-center flex flex-col items-center justify-center min-w-[90px] transition-all cursor-pointer ${
                node10PrevTerminated
                  ? 'bg-[#101e42] border-[#2563EB] text-blue-400 shadow-md shadow-blue-600/20'
                  : 'bg-[#0c142b] border-[#1d2d50] text-slate-500 hover:border-blue-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-1" />
              <span className="text-sm font-black">NULL</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {node10PrevTerminated ? 'Connected' : 'Click to Terminate'}
              </span>
            </button>

            <span className="text-slate-500 font-mono text-xs">
              {node10PrevTerminated ? '◄──────' : '╌╌╌╌╌╌'}
            </span>

            {/* Node 10 */}
            <div className="relative p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-36 text-center">
              {headBadgeNode === 'node_10' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white font-mono text-[9px] font-bold shadow-md">
                  HEAD
                </div>
              )}
              <div className="text-[10px] font-mono text-slate-400">Node [10]</div>
              <div className="text-xl font-black text-white my-1">10</div>
              <div className="text-[10px] font-mono text-blue-400">
                prev: {node10PrevTerminated ? 'NULL' : '9999'}
              </div>
            </div>

            <span className="text-[#2563EB] font-mono font-bold text-xs">◄─────►</span>

            {/* Node 20 */}
            <div className="p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-36 text-center">
              <div className="text-[10px] font-mono text-slate-400">Node [20]</div>
              <div className="text-xl font-black text-white my-1">20</div>
              <div className="text-[10px] font-mono text-slate-400">prev: 10 | next: 30</div>
            </div>

            <span className="text-[#2563EB] font-mono font-bold text-xs">◄─────►</span>

            {/* Node 30 */}
            <div className="relative p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-36 text-center">
              {tailBadgeNode === 'node_30' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white font-mono text-[9px] font-bold shadow-md">
                  TAIL
                </div>
              )}
              <div className="text-[10px] font-mono text-slate-400">Node [30]</div>
              <div className="text-xl font-black text-white my-1">30</div>
              <div className="text-[10px] font-mono text-blue-400">
                next: {node30NextTerminated ? 'NULL' : '9999'}
              </div>
            </div>

            <span className="text-slate-500 font-mono text-xs">
              {node30NextTerminated ? '──────►' : '╌╌╌╌╌╌'}
            </span>

            {/* Right NULL Terminal */}
            <button
              onClick={() => {
                soundManager.playClick();
                setNode30NextTerminated((p) => !p);
                showToast('Right NULL terminal boundary toggled', 'info');
              }}
              className={`p-4 rounded-2xl border-2 font-mono text-center flex flex-col items-center justify-center min-w-[90px] transition-all cursor-pointer ${
                node30NextTerminated
                  ? 'bg-[#101e42] border-[#2563EB] text-blue-400 shadow-md shadow-blue-600/20'
                  : 'bg-[#0c142b] border-[#1d2d50] text-slate-500 hover:border-blue-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-1" />
              <span className="text-sm font-black">NULL</span>
              <span className="text-[9px] text-slate-400 mt-1">
                {node30NextTerminated ? 'Connected' : 'Click to Terminate'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 4 INTERACTIVE BOARD: TWO-WAY HIGHWAY
      ====================================================================== */}
      {levelNumber === 4 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">Bi-Directional Traversal Quest</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Collect all 5 power gems forward, then use PREV backward to return safely without hitting boundaries.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-[#141f38] border border-[#213459] text-blue-400 font-bold">
                Gems: {collectedGems.length}/5 Collected
              </span>
            </div>
          </div>

          {/* NullPointerException alert */}
          {nullViolationWarning && (
            <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-300 text-xs font-mono flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                CRASH: NullPointerException! Cannot traverse past TAIL-&gt;next (it is NULL). Turn around with button_prev!
              </span>
            </div>
          )}

          {/* Highway Chain */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] flex items-center justify-between gap-3 overflow-x-auto min-w-[620px]">
            {[1, 2, 3, 4, 5].map((val, idx) => {
              const isActive = traversalIndex === idx;
              const hasGem = collectedGems.includes(val);

              return (
                <React.Fragment key={val}>
                  <div
                    className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center w-28 ${
                      isActive
                        ? 'bg-[#15254d] border-[#2563EB] ring-4 ring-blue-500/40 shadow-lg shadow-blue-600/30 scale-105'
                        : 'bg-[#0e172e] border-[#1d2d50]'
                    }`}
                  >
                    {/* Active Avatar Indicator */}
                    {isActive && (
                      <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-[#2563EB] text-white font-mono text-[9px] font-bold">
                        CURR
                      </div>
                    )}

                    {/* Glowing Power Gem */}
                    <div className="mb-2">
                      <Sparkles
                        className={`w-6 h-6 ${
                          hasGem ? 'text-blue-400 fill-blue-400 animate-pulse' : 'text-slate-600'
                        }`}
                      />
                    </div>

                    <div className="text-xl font-black text-white">[{val}]</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {idx === 0 ? 'HEAD' : idx === 4 ? 'TAIL' : `Node ${idx + 1}`}
                    </div>
                  </div>

                  {idx < 4 && (
                    <div className="text-center font-mono text-xs text-[#2563EB] font-bold shrink-0">
                      <div>─►</div>
                      <div className="text-slate-500">◄─</div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setNullViolationWarning(false);
                if (traversalIndex > 0) {
                  const prevIdx = traversalIndex - 1;
                  setTraversalIndex(prevIdx);
                  if (prevIdx === 0 && hasVisitedTail) {
                    setHighwayCompleted(true);
                    showToast('Returned safely to HEAD! Traversal complete.', 'success');
                  } else {
                    showToast(`Moved backward to Node [${prevIdx + 1}]`, 'info');
                  }
                } else {
                  soundManager.playError();
                  showToast('Already at HEAD (curr->prev is NULL)!', 'error');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#141f38] hover:bg-[#1d2d50] text-blue-400 hover:text-white font-mono text-xs font-bold border border-[#213459] shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>button_prev (curr = curr-&gt;prev)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                if (traversalIndex < 4) {
                  const nextIdx = traversalIndex + 1;
                  setTraversalIndex(nextIdx);
                  setCollectedGems((prev) => [...new Set([...prev, nextIdx + 1])]);
                  if (nextIdx === 4) {
                    setHasVisitedTail(true);
                    showToast('Reached TAIL! Now navigate back with button_prev.', 'info');
                  } else {
                    showToast(`Moved forward to Node [${nextIdx + 1}]`, 'info');
                  }
                } else {
                  soundManager.playError();
                  setNullViolationWarning(true);
                  showToast('CRASH: Cannot step forward past TAIL (curr->next == NULL)!', 'error');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-mono text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>button_next (curr = curr-&gt;next)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 5 INTERACTIVE BOARD: LEAD THE CHARGE (Insert at Head)
      ====================================================================== */}
      {levelNumber === 5 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">Prepend Staged Node [5] at Head</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect [5].next to [10], [5].prev to NULL, rewire [10].prev to [5], and move the HEAD badge to [5].
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setL5HeadBadge((prev) => (prev === 'node_5' ? 'node_10' : 'node_5'));
                showToast('HEAD pointer relocated', 'info');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                l5HeadBadge === 'node_5'
                  ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#141f38] border-[#213459] text-blue-400 hover:bg-[#1c2c4e]'
              }`}
            >
              HEAD -&gt; {l5HeadBadge === 'node_5' ? '[5] (Updated)' : '[10] (Click to shift)'}
            </button>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] space-y-6">
            {/* Top Row: Staging Area for Node [5] */}
            <div className="p-4 rounded-2xl bg-[#0c142b] border border-dashed border-blue-500/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white font-bold flex items-center justify-center text-lg">
                  5
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Staged New Node [5]</div>
                  <div className="text-xs font-mono text-slate-400">
                    prev: {l5Wire5PrevNull ? 'NULL' : '∅'} | next: {l5Wire5Next ? '0x1010' : '∅'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL5Wire5PrevNull((p) => !p);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    l5Wire5PrevNull
                      ? 'bg-[#2563EB] border-blue-500 text-white'
                      : 'bg-[#141f38] border-[#213459] text-blue-400'
                  }`}
                >
                  [5].prev -&gt; NULL
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL5Wire5Next((p) => !p);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    l5Wire5Next
                      ? 'bg-[#2563EB] border-blue-500 text-white'
                      : 'bg-[#141f38] border-[#213459] text-blue-400'
                  }`}
                >
                  [5].next -&gt; [10]
                </button>
              </div>
            </div>

            {/* Bottom Row: Existing Chain */}
            <div className="flex items-center justify-around gap-4 min-w-[500px]">
              {/* Node 10 */}
              <div
                className={`p-4 rounded-2xl border-2 w-36 text-center transition-all ${
                  l5HeadBadge === 'node_10'
                    ? 'bg-[#121f3f] border-[#2563EB]'
                    : 'bg-[#0e172e] border-[#1d2d50]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">
                  {l5HeadBadge === 'node_10' ? 'HEAD (old)' : 'Node [10]'}
                </div>
                <div className="text-2xl font-black text-white my-1">10</div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL5Wire10Prev5((p) => !p);
                  }}
                  className={`mt-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    l5Wire10Prev5
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#141f38] text-blue-400 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  prev: {l5Wire10Prev5 ? '[5]' : 'NULL'}
                </button>
              </div>

              <span className="text-[#2563EB] font-mono font-bold">◄─────►</span>

              {/* Node 20 */}
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-36 text-center">
                <div className="text-[10px] font-mono text-slate-400">Node [20]</div>
                <div className="text-2xl font-black text-white my-1">20</div>
                <div className="text-[10px] font-mono text-slate-400">prev: 10 | next: 30</div>
              </div>

              <span className="text-[#2563EB] font-mono font-bold">◄─────►</span>

              {/* Node 30 */}
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-36 text-center">
                <div className="text-[10px] font-mono text-slate-400">TAIL</div>
                <div className="text-2xl font-black text-white my-1">30</div>
                <div className="text-[10px] font-mono text-slate-400">next: NULL</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 6 INTERACTIVE BOARD: CATCH THE CABOOSE (Insert at Tail)
      ====================================================================== */}
      {levelNumber === 6 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">Append Staged Node [40] at Tail</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect [40].prev to [30], [40].next to NULL, rewire [30].next to [40], and drag TAIL badge to [40].
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setL6TailBadge((prev) => (prev === 'node_40' ? 'node_30' : 'node_40'));
                showToast('TAIL pointer relocated', 'info');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                l6TailBadge === 'node_40'
                  ? 'bg-[#2563EB] border-blue-500 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#141f38] border-[#213459] text-blue-400 hover:bg-[#1c2c4e]'
              }`}
            >
              TAIL -&gt; {l6TailBadge === 'node_40' ? '[40] (Updated)' : '[30] (Click to advance)'}
            </button>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] space-y-6">
            <div className="flex items-center justify-around gap-4 min-w-[500px]">
              {/* Node 10 */}
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-36 text-center">
                <div className="text-[10px] font-mono text-slate-400">HEAD</div>
                <div className="text-2xl font-black text-white my-1">10</div>
                <div className="text-[10px] font-mono text-slate-400">prev: NULL</div>
              </div>

              <span className="text-[#2563EB] font-mono font-bold">◄─────►</span>

              {/* Node 20 */}
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-36 text-center">
                <div className="text-[10px] font-mono text-slate-400">Node [20]</div>
                <div className="text-2xl font-black text-white my-1">20</div>
                <div className="text-[10px] font-mono text-slate-400">prev: 10 | next: 30</div>
              </div>

              <span className="text-[#2563EB] font-mono font-bold">◄─────►</span>

              {/* Node 30 */}
              <div
                className={`p-4 rounded-2xl border-2 w-36 text-center transition-all ${
                  l6TailBadge === 'node_30'
                    ? 'bg-[#121f3f] border-[#2563EB]'
                    : 'bg-[#0e172e] border-[#1d2d50]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">
                  {l6TailBadge === 'node_30' ? 'TAIL (old)' : 'Node [30]'}
                </div>
                <div className="text-2xl font-black text-white my-1">30</div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL6Wire30Next40((p) => !p);
                  }}
                  className={`mt-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    l6Wire30Next40
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#141f38] text-blue-400 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  next: {l6Wire30Next40 ? '[40]' : 'NULL'}
                </button>
              </div>
            </div>

            {/* Bottom Row: Staging Area for Node [40] */}
            <div className="p-4 rounded-2xl bg-[#0c142b] border border-dashed border-blue-500/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white font-bold flex items-center justify-center text-lg">
                  40
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Staged New Node [40]</div>
                  <div className="text-xs font-mono text-slate-400">
                    prev: {l6Wire40Prev30 ? '0x1030' : '∅'} | next: {l6Wire40NextNull ? 'NULL' : '∅'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL6Wire40Prev30((p) => !p);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    l6Wire40Prev30
                      ? 'bg-[#2563EB] border-blue-500 text-white'
                      : 'bg-[#141f38] border-[#213459] text-blue-400'
                  }`}
                >
                  [40].prev -&gt; [30]
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL6Wire40NextNull((p) => !p);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    l6Wire40NextNull
                      ? 'bg-[#2563EB] border-blue-500 text-white'
                      : 'bg-[#141f38] border-[#213459] text-blue-400'
                  }`}
                >
                  [40].next -&gt; NULL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 7 INTERACTIVE BOARD: MIDDLE SPLICING
      ====================================================================== */}
      {levelNumber === 7 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">4-Way Pointer Splicing Arena</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Splice Node [15] between Node [10] and Node [20]. Cut direct bypass with Scissor Tool.
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setL7OldLinkSevered(true);
                showToast('✂️ Cut direct links between [10] and [20]!', 'info');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                l7OldLinkSevered
                  ? 'bg-[#101e42] border-blue-600 text-blue-400'
                  : 'bg-rose-950/80 border-rose-600 text-rose-300 hover:bg-rose-900'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>{l7OldLinkSevered ? 'Link Severed ✓' : 'Use Scissor Tool (Sever Link)'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] space-y-6">
            {/* Floating Node [15] */}
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-[#121f3f] border-2 border-[#2563EB] w-48 text-center shadow-lg shadow-blue-600/20">
                <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                  Floating Splicer Node
                </div>
                <div className="text-3xl font-black text-white my-1">15</div>
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#1e3158]">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setL7Wire15Prev10((p) => !p);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                      l7Wire15Prev10 ? 'bg-[#2563EB] text-white' : 'bg-[#18274a] text-blue-400'
                    }`}
                  >
                    prev-&gt;[10]
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setL7Wire15Next20((p) => !p);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                      l7Wire15Next20 ? 'bg-[#2563EB] text-white' : 'bg-[#18274a] text-blue-400'
                    }`}
                  >
                    next-&gt;[20]
                  </button>
                </div>
              </div>
            </div>

            {/* Gap and Connectors */}
            <div className="flex items-center justify-between gap-6 min-w-[500px]">
              {/* Node 10 */}
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-40 text-center">
                <div className="text-[10px] font-mono text-slate-400">Node [10]</div>
                <div className="text-2xl font-black text-white my-1">10</div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL7Wire10Next15((p) => !p);
                  }}
                  className={`mt-2 px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                    l7Wire10Next15 ? 'bg-[#2563EB] text-white' : 'bg-[#162445] text-blue-400'
                  }`}
                >
                  next -&gt; {l7Wire10Next15 ? '[15]' : l7OldLinkSevered ? 'NULL' : '[20]'}
                </button>
              </div>

              {/* Center Wire Status */}
              <div className="flex-1 text-center font-mono text-xs text-slate-500">
                {l7OldLinkSevered ? (
                  <span className="text-blue-400 font-bold">✂️ Severed: Ready for [15]</span>
                ) : (
                  <span className="text-rose-400">Direct Link Active (Must Sever!)</span>
                )}
              </div>

              {/* Node 20 */}
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-40 text-center">
                <div className="text-[10px] font-mono text-slate-400">Node [20]</div>
                <div className="text-2xl font-black text-white my-1">20</div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL7Wire20Prev15((p) => !p);
                  }}
                  className={`mt-2 px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                    l7Wire20Prev15 ? 'bg-[#2563EB] text-white' : 'bg-[#162445] text-blue-400'
                  }`}
                >
                  prev -&gt; {l7Wire20Prev15 ? '[15]' : l7OldLinkSevered ? 'NULL' : '[10]'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 8 INTERACTIVE BOARD: PRUNE THE ENDS (Delete Head & Tail)
      ====================================================================== */}
      {levelNumber === 8 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">Boundary Pruning & Memory Deallocation</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Advance HEAD to [10], clamp [10].prev=NULL, trash [5]; retreat TAIL to [20], clamp [20].next=NULL, trash [30].
              </p>
            </div>

            {/* Trash Can Deallocation Bin */}
            <div className="p-3 px-4 rounded-2xl bg-rose-950/60 border border-rose-700/60 flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-xs font-mono font-bold text-rose-200">
                  Memory Deallocation Bin (free)
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {[l8Node5Deallocated && 'node_5', l8Node30Deallocated && 'node_30']
                    .filter(Boolean)
                    .join(', ') || '0 nodes freed'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] flex items-center justify-between gap-3 overflow-x-auto min-w-[620px]">
            {/* Node 5 */}
            {!l8Node5Deallocated ? (
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-rose-500/60 w-36 text-center">
                <div className="text-[10px] font-mono text-rose-400">
                  {l8HeadBadge === 'node_5' ? 'HEAD' : 'Detached'}
                </div>
                <div className="text-2xl font-black text-white my-1">5</div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL8Node5Deallocated(true);
                    showToast('free(node_5) sent to Trash Can', 'info');
                  }}
                  className="mt-1 px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-700 text-rose-200 text-[10px] font-mono font-bold cursor-pointer"
                >
                  Drop to Trash
                </button>
              </div>
            ) : (
              <div className="w-36 p-4 rounded-2xl border border-dashed border-slate-700 text-center text-slate-600 font-mono text-xs">
                [5] Freed
              </div>
            )}

            <span className="text-slate-600 font-mono text-xs">─►</span>

            {/* Node 10 */}
            <div className="p-4 rounded-2xl bg-[#0e172e] border-2 border-blue-500 w-36 text-center">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setL8HeadBadge('node_10');
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  l8HeadBadge === 'node_10' ? 'bg-[#2563EB] text-white' : 'bg-[#141f38] text-blue-400'
                }`}
              >
                {l8HeadBadge === 'node_10' ? 'HEAD ✓' : 'Set HEAD'}
              </button>
              <div className="text-2xl font-black text-white my-1">10</div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setL8Node10PrevNull((p) => !p);
                }}
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  l8Node10PrevNull ? 'bg-[#2563EB] text-white' : 'bg-[#162445] text-blue-400'
                }`}
              >
                prev: {l8Node10PrevNull ? 'NULL' : '5'}
              </button>
            </div>

            <span className="text-[#2563EB] font-mono font-bold">◄─────►</span>

            {/* Node 20 */}
            <div className="p-4 rounded-2xl bg-[#0e172e] border-2 border-blue-500 w-36 text-center">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setL8TailBadge('node_20');
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  l8TailBadge === 'node_20' ? 'bg-[#2563EB] text-white' : 'bg-[#141f38] text-blue-400'
                }`}
              >
                {l8TailBadge === 'node_20' ? 'TAIL ✓' : 'Set TAIL'}
              </button>
              <div className="text-2xl font-black text-white my-1">20</div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setL8Node20NextNull((p) => !p);
                }}
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  l8Node20NextNull ? 'bg-[#2563EB] text-white' : 'bg-[#162445] text-blue-400'
                }`}
              >
                next: {l8Node20NextNull ? 'NULL' : '30'}
              </button>
            </div>

            <span className="text-slate-600 font-mono text-xs">◄─</span>

            {/* Node 30 */}
            {!l8Node30Deallocated ? (
              <div className="p-4 rounded-2xl bg-[#0e172e] border border-rose-500/60 w-36 text-center">
                <div className="text-[10px] font-mono text-rose-400">
                  {l8TailBadge === 'node_30' ? 'TAIL' : 'Detached'}
                </div>
                <div className="text-2xl font-black text-white my-1">30</div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL8Node30Deallocated(true);
                    showToast('free(node_30) sent to Trash Can', 'info');
                  }}
                  className="mt-1 px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-700 text-rose-200 text-[10px] font-mono font-bold cursor-pointer"
                >
                  Drop to Trash
                </button>
              </div>
            ) : (
              <div className="w-36 p-4 rounded-2xl border border-dashed border-slate-700 text-center text-slate-600 font-mono text-xs">
                [30] Freed
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          LEVEL 9 INTERACTIVE BOARD: BROWSER HISTORY & MIDDLE DELETION
      ====================================================================== */}
      {levelNumber === 9 && (
        <div className="bg-[#0B132B] border border-[#1c2a47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          {/* Browser Navigation Bar Simulation */}
          <div className="p-4 rounded-2xl bg-[#070d1d] border border-[#162238] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (l9CurrentPage === 'github') {
                    setL9CurrentPage('google');
                    setL9BrowserValidated(true);
                    showToast('Navigated Back: Landed directly on google.com!', 'success');
                  }
                }}
                className="w-8 h-8 rounded-lg bg-[#141f38] hover:bg-[#20325c] text-white flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (l9CurrentPage === 'google') {
                    setL9CurrentPage('github');
                    setL9BrowserValidated(true);
                    showToast('Navigated Forward: Landed directly on github.com!', 'success');
                  }
                }}
                className="w-8 h-8 rounded-lg bg-[#141f38] hover:bg-[#20325c] text-white flex items-center justify-center cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Address Bar */}
            <div className="flex-1 p-2 px-4 rounded-xl bg-[#0c142b] border border-[#1a2948] flex items-center gap-2 font-mono text-xs text-slate-300">
              <Globe className="w-4 h-4 text-blue-400 shrink-0" />
              <span>https://{l9CurrentPage}.com</span>
            </div>

            <div className="text-xs font-mono text-blue-400 font-bold">
              {l9BrowserValidated ? '✓ Navigation Validated' : 'Test Back / Forward'}
            </div>
          </div>

          {/* Node History Nodes */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#070d1d] border border-[#162238] flex items-center justify-around gap-4 overflow-x-auto min-w-[620px]">
            {/* Google Node */}
            <div className="p-5 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-48 text-center">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">PAGE 1</div>
              <div className="text-lg font-bold text-white my-1">google.com</div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setL9GoogleNextGithub((p) => !p);
                }}
                className={`mt-2 px-3 py-1 rounded-lg text-[10px] font-mono font-bold ${
                  l9GoogleNextGithub ? 'bg-[#2563EB] text-white' : 'bg-[#141f38] text-blue-400'
                }`}
              >
                next: {l9GoogleNextGithub ? 'github.com' : 'malware'}
              </button>
            </div>

            {/* Malware Middle Node */}
            {!l9MalwareDeallocated ? (
              <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-dashed border-rose-600 w-52 text-center">
                <div className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                  ADWARE POPUP
                </div>
                <div className="text-sm font-black text-rose-300 my-1">malware-popup.com</div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL9MalwareDeallocated(true);
                    showToast('free(malware-popup.com) deallocated into Trash Can!', 'info');
                  }}
                  className="mt-2 flex items-center gap-1 mx-auto px-3 py-1 rounded-lg bg-rose-900 hover:bg-rose-700 text-white text-[10px] font-mono font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Free to Trash</span>
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-dashed border-slate-700 w-52 text-center font-mono text-xs text-slate-500">
                [malware-popup] Freed ✓
              </div>
            )}

            {/* Github Node */}
            <div className="p-5 rounded-2xl bg-[#0e172e] border border-[#1d2d50] w-48 text-center">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">PAGE 3</div>
              <div className="text-lg font-bold text-white my-1">github.com</div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setL9GithubPrevGoogle((p) => !p);
                }}
                className={`mt-2 px-3 py-1 rounded-lg text-[10px] font-mono font-bold ${
                  l9GithubPrevGoogle ? 'bg-[#2563EB] text-white' : 'bg-[#141f38] text-blue-400'
                }`}
              >
                prev: {l9GithubPrevGoogle ? 'google.com' : 'malware'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER C CODE EQUIVALENT PANEL */}
      <div className="p-5 rounded-2xl bg-[#070d1d] border border-[#162238] font-mono">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
          C/C++ SOURCE IMPLEMENTATION EQUIVALENT
        </div>
        <div className="p-4 rounded-xl bg-[#040813] border border-[#141f35] text-xs text-blue-400 whitespace-pre overflow-x-auto">
          <code>{task.cCode}</code>
        </div>
      </div>
    </div>
  );
};
