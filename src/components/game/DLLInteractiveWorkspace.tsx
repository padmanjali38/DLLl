import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Play,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeftRight,
  Trash2,
  Split,
  PlusCircle,
  Box,
  CornerDownRight,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DLLLevelConfig } from '../../data/dllGameLevelsConfig';
import { DLLNodeVisualizer, VisualDLLNode } from './DLLNodeVisualizer';
import { soundManager } from '../../utils/audio';
import { DLL_GUIDED_STEPS_MAP, GuidedStepItem } from '../../data/dllGuidedSolveSteps';
import { DLLGuidedSolveHeaderPanel } from './DLLGuidedSolveHeaderPanel';
import { DLLRightTaskPanel, DLLChecklistItem } from './DLLRightTaskPanel';

interface DLLInteractiveWorkspaceProps {
  level: DLLLevelConfig;
  initialGuidedMode?: boolean;
  onBackToLevels: () => void;
  onOpenGuidedSolve?: () => void;
  onLevelCompleted: (levelNumber: number, earnedXp: number) => void;
  onGoToNextLevel?: (nextLevelNumber: number) => void;
}

export const DLLInteractiveWorkspace: React.FC<DLLInteractiveWorkspaceProps> = ({
  level,
  initialGuidedMode = false,
  onBackToLevels,
  onOpenGuidedSolve,
  onLevelCompleted,
  onGoToNextLevel,
}) => {
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintStep, setHintStep] = useState<number>(0);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // LEVEL 1: Linking 4 nodes (10, 20, 30, 40)
  const [l1Links, setL1Links] = useState({
    p10: '',
    n10: '',
    p20: '',
    n20: '',
    p30: '',
    n30: '',
    p40: '',
    n40: '',
  });

  // LEVEL 2: Node Memory Structure + Adjacent Connect
  const [l2Slot1, setL2Slot1] = useState<string>(''); // PREV
  const [l2Slot2, setL2Slot2] = useState<string>(''); // 25
  const [l2Slot3, setL2Slot3] = useState<string>(''); // NEXT
  const [l2NextLinked, setL2NextLinked] = useState<boolean>(false);
  const [l2PrevLinked, setL2PrevLinked] = useState<boolean>(false);

  // LEVEL 3: HEAD, TAIL, NULL
  const [l3Head, setL3Head] = useState<string>('');
  const [l3Tail, setL3Tail] = useState<string>('');
  const [l3FirstPrev, setL3FirstPrev] = useState<string>('');
  const [l3LastNext, setL3LastNext] = useState<string>('');

  // LEVEL 4: Bi-directional Traversal
  // CRITICAL: Each NEXT or PREV click performs only one movement. Never automatically traverse the entire list.
  const [l4CurrentNode, setL4CurrentNode] = useState<number>(10);
  const [l4ForwardPath, setL4ForwardPath] = useState<number[]>([10]);
  const [l4BackwardPath, setL4BackwardPath] = useState<number[]>([]);
  const [l4TraversePhase, setL4TraversePhase] = useState<'forward' | 'backward' | 'done'>('forward');

  // LEVEL 5: Insert at Head
  const [l5Step1, setL5Step1] = useState<boolean>(false); // 5.prev = NULL
  const [l5Step2, setL5Step2] = useState<boolean>(false); // 5.next = 10
  const [l5Step3, setL5Step3] = useState<boolean>(false); // 10.prev = 5
  const [l5Step4, setL5Step4] = useState<boolean>(false); // HEAD = 5

  // LEVEL 6: Insert at Tail
  const [l6Step1, setL6Step1] = useState<boolean>(false); // 30.next = 40
  const [l6Step2, setL6Step2] = useState<boolean>(false); // 40.prev = 30
  const [l6Step3, setL6Step3] = useState<boolean>(false); // 40.next = NULL
  const [l6Step4, setL6Step4] = useState<boolean>(false); // TAIL = 40

  // LEVEL 7: Insert at Position
  const [l7Step1, setL7Step1] = useState<boolean>(false); // 30.prev = 20
  const [l7Step2, setL7Step2] = useState<boolean>(false); // 30.next = 40
  const [l7Step3, setL7Step3] = useState<boolean>(false); // 20.next = 30
  const [l7Step4, setL7Step4] = useState<boolean>(false); // 40.prev = 30

  // LEVEL 8: Delete Head and Tail
  const [l8HeadDeleted, setL8HeadDeleted] = useState<boolean>(false);
  const [l8TailDeleted, setL8TailDeleted] = useState<boolean>(false);

  // LEVEL 9: Delete Middle Node
  const [l9TargetSelected, setL9TargetSelected] = useState<boolean>(false);
  const [l9NextRewired, setL9NextRewired] = useState<boolean>(false);
  const [l9PrevRewired, setL9PrevRewired] = useState<boolean>(false);
  const [l9NodeFreed, setL9NodeFreed] = useState<boolean>(false);
  const [l9BonusSolved, setL9BonusSolved] = useState<boolean>(false);

  // GUIDED SOLVE STATE MACHINE
  type GuidedState =
    | 'GUIDED_IDLE'
    | 'SHOWING_STEP'
    | 'WAITING_FOR_NEXT_CLICK'
    | 'EXECUTING_ONE_ACTION'
    | 'PAUSED_AFTER_ACTION'
    | 'COMPLETED'
    | 'STOPPED';

  const levelGuidedConfig = DLL_GUIDED_STEPS_MAP[level.level] || DLL_GUIDED_STEPS_MAP[1];
  const totalGuidedSteps = levelGuidedConfig.totalSteps;

  const [guidedState, setGuidedState] = useState<GuidedState>(() =>
    initialGuidedMode ? 'WAITING_FOR_NEXT_CLICK' : 'GUIDED_IDLE'
  );
  const [guidedStepIndex, setGuidedStepIndex] = useState<number>(0);
  const [guidedStoppedNotice, setGuidedStoppedNotice] = useState<string | null>(null);
  const [isGuidedComplete, setIsGuidedComplete] = useState<boolean>(false);

  // Current level state representation for Guided Solve checks
  const currentLevelState = {
    l1Links,
    l2Slot1,
    l2Slot2,
    l2Slot3,
    l2NextLinked,
    l2PrevLinked,
    l3Head,
    l3Tail,
    l3FirstPrev,
    l3LastNext,
    l4CurrentNode,
    l4ForwardPath,
    l4BackwardPath,
    l4TraversePhase,
    l5Step1,
    l5Step2,
    l5Step3,
    l5Step4,
    l6Step1,
    l6Step2,
    l6Step3,
    l6Step4,
    l7Step1,
    l7Step2,
    l7Step3,
    l7Step4,
    l8HeadDeleted,
    l8TailDeleted,
    l9TargetSelected,
    l9NextRewired,
    l9PrevRewired,
    l9NodeFreed,
  };

  const actionBag = {
    setL1Links,
    setL2Slot1,
    setL2Slot2,
    setL2Slot3,
    setL2NextLinked,
    setL2PrevLinked,
    setL3Head,
    setL3Tail,
    setL3FirstPrev,
    setL3LastNext,
    setL4CurrentNode,
    setL4ForwardPath,
    setL4BackwardPath,
    setL4TraversePhase,
    setL5Step1,
    setL5Step2,
    setL5Step3,
    setL5Step4,
    setL6Step1,
    setL6Step2,
    setL6Step3,
    setL6Step4,
    setL7Step1,
    setL7Step2,
    setL7Step3,
    setL7Step4,
    setL8HeadDeleted,
    setL8TailDeleted,
    setL9TargetSelected,
    setL9NextRewired,
    setL9PrevRewired,
    setL9NodeFreed,
  };

  // Sync initialGuidedMode when component loads or prop switches
  useEffect(() => {
    if (initialGuidedMode && guidedState === 'GUIDED_IDLE') {
      let firstIncomplete = 0;
      const steps = levelGuidedConfig.steps;
      for (let i = 0; i < steps.length; i++) {
        if (!steps[i].isDone(currentLevelState)) {
          firstIncomplete = i;
          break;
        }
        if (i === steps.length - 1) {
          firstIncomplete = steps.length - 1;
        }
      }
      setGuidedStepIndex(firstIncomplete);
      setGuidedState('WAITING_FOR_NEXT_CLICK');
    }
  }, [initialGuidedMode, level.level]);

  const currentGuidedStep: GuidedStepItem =
    levelGuidedConfig.steps[guidedStepIndex] || levelGuidedConfig.steps[0];

  const isGuidedActive =
    guidedState === 'WAITING_FOR_NEXT_CLICK' ||
    guidedState === 'SHOWING_STEP' ||
    guidedState === 'PAUSED_AFTER_ACTION' ||
    guidedState === 'EXECUTING_ONE_ACTION';

  const isNodeHighlighted = (nodeId: string) => {
    if (!isGuidedActive || !currentGuidedStep) return false;
    return (
      currentGuidedStep.highlightNodeId === nodeId ||
      currentGuidedStep.highlightSecondaryNodeId === nodeId
    );
  };

  const isPointerHighlighted = (pointerType: string, nodeId?: string) => {
    if (!isGuidedActive || !currentGuidedStep) return false;
    if (currentGuidedStep.highlightPointer === 'ALL') return isNodeHighlighted(nodeId || '');
    return (
      currentGuidedStep.highlightPointer === pointerType &&
      (!nodeId || isNodeHighlighted(nodeId))
    );
  };

  // Activation & Resume of Guided Solve
  const handleStartOrResumeGuidedSolve = () => {
    soundManager.playClick();
    setGuidedStoppedNotice(null);

    // Resume behavior: find first incomplete step
    let firstIncomplete = 0;
    const steps = levelGuidedConfig.steps;
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].isDone(currentLevelState)) {
        firstIncomplete = i;
        break;
      }
      if (i === steps.length - 1) {
        firstIncomplete = steps.length - 1;
      }
    }

    setGuidedStepIndex(firstIncomplete);
    setGuidedState('WAITING_FOR_NEXT_CLICK');
  };

  // Stop Guided Solve (Preserves DLL state, returns manual control)
  const handleStopGuidedSolve = () => {
    soundManager.playClick();
    setGuidedState('STOPPED');
    setGuidedStoppedNotice('Guided Solve stopped. You can continue the task yourself.');
  };

  // Next Step: Strictly performs EXACTLY one action, then STOPS and waits
  const handleGuidedNextStep = () => {
    if (guidedState !== 'WAITING_FOR_NEXT_CLICK') return;

    soundManager.playClick();
    setGuidedState('EXECUTING_ONE_ACTION');

    // Execute exactly ONE action
    const stepToExecute = levelGuidedConfig.steps[guidedStepIndex];
    if (stepToExecute) {
      stepToExecute.execute(actionBag);
    }

    setGuidedState('PAUSED_AFTER_ACTION');

    const isLast = guidedStepIndex >= totalGuidedSteps - 1;
    if (!isLast) {
      // Advance step and pause indefinitely until next explicit user click!
      setGuidedStepIndex((prev) => prev + 1);
      setGuidedState('WAITING_FOR_NEXT_CLICK');
    } else {
      // Completed all steps!
      setGuidedState('COMPLETED');
      setIsGuidedComplete(true);
      triggerSuccess(`🎉 Guided Solve Complete! ${levelGuidedConfig.completionResult}`);
    }
  };

  // Trigger Completion
  const triggerSuccess = (msg: string) => {
    soundManager.playSuccess();
    setFeedback({ message: msg, type: 'success' });
    setShowCompletionModal(true);
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });
    onLevelCompleted(level.level, level.xp);
  };

  const triggerError = (msg: string) => {
    soundManager.playError();
    setFeedback({ message: msg, type: 'error' });
  };

  const handleReset = () => {
    soundManager.playClick();
    setFeedback(null);
    setShowHint(false);
    setShowCompletionModal(false);
    setGuidedState('GUIDED_IDLE');
    setGuidedStepIndex(0);
    setGuidedStoppedNotice(null);
    setIsGuidedComplete(false);

    if (level.level === 1) {
      setL1Links({ p10: '', n10: '', p20: '', n20: '', p30: '', n30: '', p40: '', n40: '' });
    } else if (level.level === 2) {
      setL2Slot1('');
      setL2Slot2('');
      setL2Slot3('');
      setL2NextLinked(false);
      setL2PrevLinked(false);
    } else if (level.level === 3) {
      setL3Head('');
      setL3Tail('');
      setL3FirstPrev('');
      setL3LastNext('');
    } else if (level.level === 4) {
      setL4CurrentNode(10);
      setL4ForwardPath([10]);
      setL4BackwardPath([]);
      setL4TraversePhase('forward');
    } else if (level.level === 5) {
      setL5Step1(false);
      setL5Step2(false);
      setL5Step3(false);
      setL5Step4(false);
    } else if (level.level === 6) {
      setL6Step1(false);
      setL6Step2(false);
      setL6Step3(false);
      setL6Step4(false);
    } else if (level.level === 7) {
      setL7Step1(false);
      setL7Step2(false);
      setL7Step3(false);
      setL7Step4(false);
    } else if (level.level === 8) {
      setL8HeadDeleted(false);
      setL8TailDeleted(false);
    } else if (level.level === 9) {
      setL9TargetSelected(false);
      setL9NextRewired(false);
      setL9PrevRewired(false);
      setL9NodeFreed(false);
      setL9BonusSolved(false);
    }
  };

  // Traversal for Level 4: One single step per button click
  const handleL4NextClick = () => {
    soundManager.playClick();
    if (l4TraversePhase !== 'forward') {
      triggerError('You have already finished the forward traversal. Now use PREV to traverse backward!');
      return;
    }

    const order = [10, 20, 30, 40];
    const currentIdx = order.indexOf(l4CurrentNode);
    if (currentIdx < order.length - 1) {
      const nextNode = order[currentIdx + 1];
      setL4CurrentNode(nextNode);
      const updatedPath = [...l4ForwardPath, nextNode];
      setL4ForwardPath(updatedPath);

      if (nextNode === 40) {
        setL4TraversePhase('backward');
        setL4BackwardPath([40]);
        setFeedback({
          message: 'Forward traversal to TAIL complete! Now press PREV to step backwards to HEAD.',
          type: 'success',
        });
      }
    }
  };

  const handleL4PrevClick = () => {
    soundManager.playClick();
    if (l4TraversePhase === 'forward') {
      triggerError('Traverse forward to TAIL (Node 40) first using the NEXT button.');
      return;
    }

    const reverseOrder = [40, 30, 20, 10];
    const currentIdx = reverseOrder.indexOf(l4CurrentNode);
    if (currentIdx < reverseOrder.length - 1) {
      const prevNode = reverseOrder[currentIdx + 1];
      setL4CurrentNode(prevNode);
      const updatedPath = [...l4BackwardPath, prevNode];
      setL4BackwardPath(updatedPath);

      if (prevNode === 10) {
        setL4TraversePhase('done');
        triggerSuccess(level.feedback.correct);
      }
    }
  };

  // LEVEL 1 Validation: 4 nodes
  const handleVerifyLevel1 = () => {
    if (
      l1Links.p10 === 'NULL' &&
      l1Links.n10 === '20' &&
      l1Links.p20 === '10' &&
      l1Links.n20 === '30' &&
      l1Links.p30 === '20' &&
      l1Links.n30 === '40' &&
      l1Links.p40 === '30' &&
      l1Links.n40 === 'NULL'
    ) {
      triggerSuccess(level.feedback.correct);
    } else {
      triggerError(level.feedback.wrong);
    }
  };

  // LEVEL 2 Validation
  const handleVerifyLevel2 = () => {
    const memoryCorrect = l2Slot1 === 'PREV' && l2Slot2 === '25' && l2Slot3 === 'NEXT';
    const adjacentCorrect = l2NextLinked && l2PrevLinked;

    if (memoryCorrect && adjacentCorrect) {
      triggerSuccess(level.feedback.correct);
    } else if (!memoryCorrect) {
      triggerError('❌ Check the memory slots: PREV must be on the left, data 25 in the middle, and NEXT on the right.');
    } else {
      triggerError('❌ Connect the NEXT pointer of 10 to 20, and the PREV pointer of 20 to 10.');
    }
  };

  // LEVEL 3 Validation
  const handleVerifyLevel3 = () => {
    if (
      l3Head === '10' &&
      l3Tail === '40' &&
      l3FirstPrev === 'NULL' &&
      l3LastNext === 'NULL'
    ) {
      triggerSuccess(level.feedback.correct);
    } else {
      triggerError(level.feedback.wrong);
    }
  };

  // LEVEL 4 Validation
  const handleVerifyLevel4 = () => {
    const forwardComplete = l4ForwardPath.length >= 4 && l4ForwardPath[3] === 40;
    const backwardComplete = l4BackwardPath.length >= 4 && l4BackwardPath[3] === 10;

    if (forwardComplete && backwardComplete) {
      triggerSuccess(level.feedback.correct);
    } else if (!forwardComplete) {
      triggerError('Traverse forward from HEAD (10) all the way to TAIL (40) using NEXT pointers.');
    } else {
      triggerError('Now traverse backward from TAIL (40) all the way to HEAD (10) using PREV pointers.');
    }
  };

  // LEVEL 5 Validation
  const handleVerifyLevel5 = () => {
    if (l5Step1 && l5Step2 && l5Step3 && l5Step4) {
      triggerSuccess(level.feedback.correct);
    } else {
      triggerError(level.feedback.wrong);
    }
  };

  // LEVEL 6 Validation
  const handleVerifyLevel6 = () => {
    if (l6Step1 && l6Step2 && l6Step3 && l6Step4) {
      triggerSuccess(level.feedback.correct);
    } else {
      triggerError(level.feedback.wrong);
    }
  };

  // LEVEL 7 Validation
  const handleVerifyLevel7 = () => {
    if (l7Step1 && l7Step2 && l7Step3 && l7Step4) {
      triggerSuccess(level.feedback.correct);
    } else {
      triggerError(level.feedback.wrong);
    }
  };

  // LEVEL 8 Validation
  const handleVerifyLevel8 = () => {
    if (l8HeadDeleted && l8TailDeleted) {
      triggerSuccess(level.feedback.correct);
    } else {
      triggerError(level.feedback.wrong);
    }
  };

  // LEVEL 9 Validation
  const handleVerifyLevel9 = () => {
    if (l9TargetSelected && l9NextRewired && l9PrevRewired && l9NodeFreed) {
      triggerSuccess(level.feedback.correct);
    } else {
      triggerError(level.feedback.wrong);
    }
  };

  // Dynamic Target Verification Checklist for current level
  const checklist: DLLChecklistItem[] = React.useMemo(() => {
    switch (level.level) {
      case 1:
        return [
          { id: '1', text: 'Set first node: 10.PREV = NULL', completed: l1Links.p10 === 'NULL' },
          { id: '2', text: 'Connect 10.NEXT → 20 and 20.PREV → 10', completed: l1Links.n10 === '20' && l1Links.p20 === '10' },
          { id: '3', text: 'Connect 20.NEXT → 30 and 30.PREV → 20', completed: l1Links.n20 === '30' && l1Links.p30 === '20' },
          { id: '4', text: 'Connect 30.NEXT → 40, 40.PREV → 30 and 40.NEXT = NULL', completed: l1Links.n30 === '40' && l1Links.p40 === '30' && l1Links.n40 === 'NULL' },
        ];
      case 2:
        return [
          { id: '1', text: 'Set Slot 1 to PREV pointer', completed: l2Slot1 === 'PREV' },
          { id: '2', text: 'Set Slot 2 to DATA=25', completed: l2Slot2 === '25' },
          { id: '3', text: 'Set Slot 3 to NEXT pointer', completed: l2Slot3 === 'NEXT' },
          { id: '4', text: 'Link adjacent nodes: 10.NEXT → 25 and 25.PREV → 10', completed: l2NextLinked && l2PrevLinked },
        ];
      case 3:
        return [
          { id: '1', text: 'Set HEAD pointer to first node (10)', completed: l3Head === '10' },
          { id: '2', text: 'Set TAIL pointer to last node (40)', completed: l3Tail === '40' },
          { id: '3', text: 'Set HEAD.PREV to NULL', completed: l3FirstPrev === 'NULL' },
          { id: '4', text: 'Set TAIL.NEXT to NULL', completed: l3LastNext === 'NULL' },
        ];
      case 4:
        return [
          { id: '1', text: 'Start from HEAD node 10', completed: l4ForwardPath.includes(10) },
          { id: '2', text: 'Traverse forward using NEXT to TAIL node 40', completed: l4ForwardPath.length >= 4 && l4ForwardPath[3] === 40 },
          { id: '3', text: 'Start backward traversal from TAIL node 40', completed: l4BackwardPath.includes(40) },
          { id: '4', text: 'Traverse backward using PREV to HEAD node 10', completed: l4BackwardPath.length >= 4 && l4BackwardPath[3] === 10 },
        ];
      case 5:
        return [
          { id: '1', text: 'Create node 5 and set 5.PREV = NULL', completed: l5Step1 },
          { id: '2', text: 'Set 5.NEXT → 10', completed: l5Step2 },
          { id: '3', text: 'Set 10.PREV → 5', completed: l5Step3 },
          { id: '4', text: 'Set HEAD → 5', completed: l5Step4 },
        ];
      case 6:
        return [
          { id: '1', text: 'Create node 30', completed: l6Step1 },
          { id: '2', text: 'Set 20.NEXT → 30', completed: l6Step2 },
          { id: '3', text: 'Set 30.PREV → 20', completed: l6Step3 },
          { id: '4', text: 'Set TAIL → 30 and 30.NEXT = NULL', completed: l6Step4 },
        ];
      case 7:
        return [
          { id: '1', text: 'Create node 30', completed: l7Step1 },
          { id: '2', text: 'Set 30.PREV → 20 and 30.NEXT → 40', completed: l7Step2 },
          { id: '3', text: 'Set 20.NEXT → 30', completed: l7Step3 },
          { id: '4', text: 'Set 40.PREV → 30', completed: l7Step4 },
        ];
      case 8:
        return [
          { id: '1', text: 'Delete HEAD node 10', completed: l8HeadDeleted },
          { id: '2', text: 'Set HEAD → 20 and 20.PREV = NULL', completed: l8HeadDeleted },
          { id: '3', text: 'Delete TAIL node 40', completed: l8TailDeleted },
          { id: '4', text: 'Set TAIL → 30 and 30.NEXT = NULL', completed: l8TailDeleted },
        ];
      case 9:
        return [
          { id: '1', text: 'Select middle node 30 to remove', completed: l9TargetSelected },
          { id: '2', text: 'Bypass forward: set 20.NEXT → 40', completed: l9NextRewired },
          { id: '3', text: 'Bypass backward: set 40.PREV → 20', completed: l9PrevRewired },
          { id: '4', text: 'Safely free node 30 memory', completed: l9NodeFreed },
        ];
      default:
        return [];
    }
  }, [
    level.level,
    l1Links,
    l2Slot1,
    l2Slot2,
    l2Slot3,
    l2NextLinked,
    l2PrevLinked,
    l3Head,
    l3Tail,
    l3FirstPrev,
    l3LastNext,
    l4ForwardPath,
    l4BackwardPath,
    l5Step1,
    l5Step2,
    l5Step3,
    l5Step4,
    l6Step1,
    l6Step2,
    l6Step3,
    l6Step4,
    l7Step1,
    l7Step2,
    l7Step3,
    l7Step4,
    l8HeadDeleted,
    l8TailDeleted,
    l9TargetSelected,
    l9NextRewired,
    l9PrevRewired,
    l9NodeFreed,
  ]);

  const handleCheckAnswer = () => {
    switch (level.level) {
      case 1:
        handleVerifyLevel1();
        break;
      case 2:
        handleVerifyLevel2();
        break;
      case 3:
        handleVerifyLevel3();
        break;
      case 4:
        handleVerifyLevel4();
        break;
      case 5:
        handleVerifyLevel5();
        break;
      case 6:
        handleVerifyLevel6();
        break;
      case 7:
        handleVerifyLevel7();
        break;
      case 8:
        handleVerifyLevel8();
        break;
      case 9:
        handleVerifyLevel9();
        break;
      default:
        break;
    }
  };

  return (
    <div id="dll-interactive-workspace" className="flex flex-col gap-6 w-full animate-fade-in">
      {/* 1. TOP BAR: Level number, Level title, XP, Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Task #{level.level} of 9
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">
              +{level.xp} XP
            </span>
            {level.difficulty && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {level.difficulty}
              </span>
            )}
            {!isGuidedActive && (
              <button
                id="btn-top-guided-solve"
                onClick={handleStartOrResumeGuidedSolve}
                className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Lightbulb className="w-3 h-3 fill-current" />
                💡 Guided Solve
              </button>
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {level.cardTitle || level.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {level.description}
          </p>
        </div>

        {/* Progress tracker */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-xs font-mono font-semibold text-slate-400">
            Course Completion
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvlNum) => (
              <div
                key={lvlNum}
                className={`h-2 rounded-full transition-all ${
                  lvlNum < level.level
                    ? 'w-4 bg-emerald-500'
                    : lvlNum === level.level
                    ? 'w-6 bg-purple-600'
                    : 'w-3 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Guided Solve Stopped Notice Banner */}
      {guidedStoppedNotice && (
        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-2xl text-purple-900 dark:text-purple-200 text-sm font-medium animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            <span>{guidedStoppedNotice}</span>
          </div>
          <button
            onClick={() => setGuidedStoppedNotice(null)}
            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg cursor-pointer text-purple-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Guided Solve Header Panel */}
      {isGuidedActive && currentGuidedStep && (
        <DLLGuidedSolveHeaderPanel
          levelNumber={level.level}
          currentStepIndex={guidedStepIndex}
          totalSteps={totalGuidedSteps}
          currentStep={currentGuidedStep}
          stateMachineState={guidedState}
          onNextStep={handleGuidedNextStep}
          onStopGuided={handleStopGuidedSolve}
        />
      )}

      {/* Optional Hint Banner */}
      {showHint && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3 shadow-sm animate-fade-in">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Goal & Hint: </strong>
            <p className="text-xs text-amber-800 dark:text-amber-300">{level.goal}</p>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE WITH 2 COLUMNS: INTERACTIVE MEMORY (LEFT) + TASK/INSTRUCTION PANEL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left: Interactive Memory Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Live Explicit Pointer Operation Banner */}
          {lastOperation && (
            <div className="w-full p-3.5 bg-[#0F172A] text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 flex items-center justify-between shadow-xs animate-fade-in">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Latest Pointer Operation:</span>
                <code className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-md text-xs">{lastOperation}</code>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                ✓ Memory Linked
              </span>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 flex flex-col gap-8 shadow-sm">
        {/* ================= LEVEL 1: Connect 4 Nodes (10, 20, 30, 40) ================= */}
        {level.level === 1 && (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center max-w-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Connect Nodes 10, 20, 30, and 40 in Both Directions
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Every node must have a PREV link pointing backward and a NEXT link pointing forward. The ends connect to NULL.
              </p>
            </div>

            {/* Live Interactive Node Connector Grid for 4 nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Node 10 */}
              <div className="flex flex-col p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-mono font-bold">
                    HEAD NODE
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">Node 10</span>
                </div>

                <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">10</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      10.prev:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['NULL', '20', '30'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, p10: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.p10 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      10.next:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['NULL', '20', '30'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, n10: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.n10 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Node 20 */}
              <div className="flex flex-col p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-mono font-bold">
                    NODE 2
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">Node 20</span>
                </div>

                <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">20</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      20.prev:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['10', '30', '40'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, p20: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.p20 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      20.next:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['10', '30', '40'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, n20: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.n20 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Node 30 */}
              <div className="flex flex-col p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-mono font-bold">
                    NODE 3
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">Node 30</span>
                </div>

                <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">30</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      30.prev:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['10', '20', '40'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, p30: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.p30 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      30.next:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['20', '40', 'NULL'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, n30: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.n30 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Node 40 */}
              <div className="flex flex-col p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold">
                    TAIL NODE
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">Node 40</span>
                </div>

                <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">40</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      40.prev:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['20', '30', 'NULL'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, p40: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.p40 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      40.next:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['NULL', '30', '20'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setL1Links((prev) => ({ ...prev, n40: opt }))}
                          className={`py-1 rounded-md font-mono font-bold text-xs border transition-all ${
                            l1Links.n40 === opt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Live Diagram Preview */}
            <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Live State Preview: NULL ← [10] ⇄ [20] ⇄ [30] ⇄ [40] → NULL
              </span>
              <DLLNodeVisualizer
                nodes={[
                  { id: '10', data: 10, prevVal: l1Links.p10 || null, nextVal: l1Links.n10 || '?', isHead: true },
                  { id: '20', data: 20, prevVal: l1Links.p20 || '?', nextVal: l1Links.n20 || '?' },
                  { id: '30', data: 30, prevVal: l1Links.p30 || '?', nextVal: l1Links.n30 || '?' },
                  { id: '40', data: 40, prevVal: l1Links.p40 || '?', nextVal: l1Links.n40 || null, isTail: true },
                ]}
              />
            </div>

            <button
              onClick={handleVerifyLevel1}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Connections
            </button>
          </div>
        )}

        {/* ================= LEVEL 2: Build a DLL Node ================= */}
        {level.level === 2 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Part 1: Build the Node Memory Layout
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                A Doubly Linked List node consists of 3 distinct sections. Place PREV, DATA 25, and NEXT into the empty node.
              </p>
            </div>

            {/* Draggable / Selectable chips */}
            <div className="flex items-center gap-3 flex-wrap justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono font-bold text-slate-400 mr-2">Components:</span>
              {['PREV', '25', 'NEXT', 'DATA'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    soundManager.playClick();
                    if (!l2Slot1) setL2Slot1(item);
                    else if (!l2Slot2) setL2Slot2(item);
                    else if (!l2Slot3) setL2Slot3(item);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-purple-600 dark:text-purple-400 shadow-xs hover:border-purple-400 transition-all"
                >
                  + {item}
                </button>
              ))}
            </div>

            {/* Node Structure Box */}
            <div className="flex items-stretch rounded-2xl border-2 border-purple-500 bg-white dark:bg-slate-900 overflow-hidden shadow-md max-w-md w-full">
              {/* Left: Slot 1 (PREV) */}
              <div
                onClick={() => setL2Slot1('')}
                className="flex-1 p-4 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Slot 1 (Left)
                </span>
                <span className={`font-mono font-bold text-sm ${l2Slot1 === 'PREV' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                  {l2Slot1 || '[ Empty ]'}
                </span>
              </div>

              {/* Center: Slot 2 (DATA) */}
              <div
                onClick={() => setL2Slot2('')}
                className="flex-1 p-4 flex flex-col items-center justify-center bg-purple-50/30 dark:bg-purple-950/10 cursor-pointer hover:bg-purple-50/60"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Slot 2 (Data)
                </span>
                <span className={`font-mono font-bold text-sm ${l2Slot2 === '25' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                  {l2Slot2 || '[ Empty ]'}
                </span>
              </div>

              {/* Right: Slot 3 (NEXT) */}
              <div
                onClick={() => setL2Slot3('')}
                className="flex-1 p-4 border-l border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
              >
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Slot 3 (Right)
                </span>
                <span className={`font-mono font-bold text-sm ${l2Slot3 === 'NEXT' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                  {l2Slot3 || '[ Empty ]'}
                </span>
              </div>
            </div>

            {/* Part 2: Connect Two Adjacent Nodes */}
            <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
              <div className="text-center">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Part 2: Connect Adjacent Nodes (10 and 20)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Link 10.NEXT → 20 and 20.PREV → 10.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap justify-center">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL2NextLinked(!l2NextLinked);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                    l2NextLinked
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  10.NEXT → Node 20
                  {l2NextLinked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setL2PrevLinked(!l2PrevLinked);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                    l2PrevLinked
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  20.PREV → Node 10
                  {l2PrevLinked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
              </div>

              <DLLNodeVisualizer
                nodes={[
                  { id: '10', data: 10, nextVal: l2NextLinked ? '20' : '?', prevVal: null, isHead: true },
                  { id: '20', data: 20, prevVal: l2PrevLinked ? '10' : '?', nextVal: null, isTail: true },
                ]}
              />
            </div>

            <button
              onClick={handleVerifyLevel2}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Node Structure
            </button>
          </div>
        )}

        {/* ================= LEVEL 3: Place HEAD & TAIL ================= */}
        {level.level === 3 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Assign HEAD, TAIL, and Boundary NULL Pointers
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Identify which node HEAD and TAIL point to, and what first.PREV and last.NEXT reference.
              </p>
            </div>

            {/* Boundary Rules Callout */}
            <div className="w-full p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                HEAD points to the first node.
              </div>
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                TAIL points to the last node.
              </div>
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                First node PREV = NULL.
              </div>
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Last node NEXT = NULL.
              </div>
            </div>

            {/* Interactive Target Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  1. Which node does HEAD point to?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['10', '20', '30', '40'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setL3Head(opt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        l3Head === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Node {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  2. Which node does TAIL point to?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['10', '20', '30', '40'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setL3Tail(opt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        l3Tail === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Node {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  3. What is Node 10.prev?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['NULL', 'Node 20', 'Node 40'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setL3FirstPrev(opt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        l3FirstPrev === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  4. What is Node 40.next?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['NULL', 'Node 30', 'Node 10'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setL3LastNext(opt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        l3LastNext === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DLLNodeVisualizer
              nodes={[
                { id: '10', data: 10, isHead: l3Head === '10' },
                { id: '20', data: 20 },
                { id: '30', data: 30 },
                { id: '40', data: 40, isTail: l3Tail === '40' },
              ]}
            />

            <button
              onClick={handleVerifyLevel3}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Boundaries & Pointers
            </button>
          </div>
        )}

        {/* ================= LEVEL 4: Bi-directional Traversal ================= */}
        {level.level === 4 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Traverse in Both Directions (One Step Per Click)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Phase 1: Step forward from HEAD (10) to TAIL (40) using NEXT. Phase 2: Step backward to HEAD using PREV.
              </p>
            </div>

            {/* Live DLL Visual with active highlighted node */}
            <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold">
                <span className="text-slate-400">Current Position:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white">
                  Node {l4CurrentNode}
                </span>
                <span className="text-slate-400 ml-2">Phase:</span>
                <span className="capitalize font-bold text-purple-600 dark:text-purple-400">
                  {l4TraversePhase}
                </span>
              </div>

              <DLLNodeVisualizer
                nodes={[
                  { id: '10', data: 10, isHead: true, highlight: l4CurrentNode === 10 },
                  { id: '20', data: 20, highlight: l4CurrentNode === 20 },
                  { id: '30', data: 30, highlight: l4CurrentNode === 30 },
                  { id: '40', data: 40, isTail: true, highlight: l4CurrentNode === 40 },
                ]}
              />
            </div>

            {/* History Logs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Forward Sequence (Target: 10 → 20 → 30 → 40)
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-600 dark:text-purple-400 flex-wrap">
                  {l4ForwardPath.map((v, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-slate-300">→</span>}
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
                        {v}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Backward Sequence (Target: 40 → 30 → 20 → 10)
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-600 dark:text-purple-400 flex-wrap">
                  {l4BackwardPath.length === 0 ? (
                    <span className="text-slate-400 italic text-xs">Awaiting arrival at TAIL...</span>
                  ) : (
                    l4BackwardPath.map((v, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-slate-300">←</span>}
                        <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
                          {v}
                        </span>
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Direction Buttons */}
            <div className="flex items-center gap-4 flex-wrap justify-center pt-2">
              <button
                id="btn-traverse-prev"
                onClick={handleL4PrevClick}
                disabled={l4TraversePhase === 'forward' || l4TraversePhase === 'done'}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 border-2 border-purple-600 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                <ChevronLeft className="w-5 h-5" />
                PREV (Step Backward)
              </button>

              <button
                id="btn-traverse-next"
                onClick={handleL4NextClick}
                disabled={l4TraversePhase !== 'forward'}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                NEXT (Step Forward)
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= LEVEL 5: Insert at Head ================= */}
        {level.level === 5 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Insert Node 5 at HEAD
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Correctly update 5.PREV, 5.NEXT, 10.PREV, and the HEAD pointer.
              </p>
            </div>

            {/* Live Diagram based on step state */}
            <DLLNodeVisualizer
              nodes={
                l5Step4
                  ? [
                      { id: '5', data: 5, prevVal: null, nextVal: '10', isHead: true, isNew: true },
                      { id: '10', data: 10, prevVal: '5', nextVal: '20' },
                      { id: '20', data: 20 },
                      { id: '30', data: 30, isTail: true },
                    ]
                  : [
                      { id: '10', data: 10, prevVal: l5Step3 ? '5' : null, nextVal: '20', isHead: true },
                      { id: '20', data: 20 },
                      { id: '30', data: 30, isTail: true },
                    ]
              }
            />

            {/* Staged New Node */}
            {!l5Step4 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300">
                  New Node to Insert:
                </span>
                <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 font-mono font-black text-sm text-amber-900 dark:text-amber-200">
                  [ PREV | 5 | NEXT ]
                </div>
              </div>
            )}

            {/* Step Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setL5Step1(!l5Step1)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l5Step1
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 1</span>
                  <span className="font-mono font-bold text-sm">5.prev = NULL</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l5Step1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l5Step1 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL5Step2(!l5Step2)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l5Step2
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 2</span>
                  <span className="font-mono font-bold text-sm">5.next = 10</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l5Step2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l5Step2 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL5Step3(!l5Step3)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l5Step3
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 3</span>
                  <span className="font-mono font-bold text-sm">10.prev = 5</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l5Step3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l5Step3 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL5Step4(!l5Step4)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l5Step4
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 4</span>
                  <span className="font-mono font-bold text-sm">HEAD = 5</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l5Step4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l5Step4 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            <button
              onClick={handleVerifyLevel5}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Head Insertion
            </button>
          </div>
        )}

        {/* ================= LEVEL 6: Insert at Tail ================= */}
        {level.level === 6 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Insert Node 40 at TAIL
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Connect 30.NEXT to 40, set 40.PREV to 30, set 40.NEXT to NULL, and advance TAIL.
              </p>
            </div>

            <DLLNodeVisualizer
              nodes={
                l6Step4
                  ? [
                      { id: '10', data: 10, isHead: true },
                      { id: '20', data: 20 },
                      { id: '30', data: 30, nextVal: '40' },
                      { id: '40', data: 40, prevVal: '30', nextVal: null, isTail: true, isNew: true },
                    ]
                  : [
                      { id: '10', data: 10, isHead: true },
                      { id: '20', data: 20 },
                      { id: '30', data: 30, isTail: true, nextVal: l6Step1 ? '40' : null },
                    ]
              }
            />

            {/* Step Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setL6Step1(!l6Step1)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l6Step1
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 1</span>
                  <span className="font-mono font-bold text-sm">30.next = 40</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l6Step1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l6Step1 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL6Step2(!l6Step2)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l6Step2
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 2</span>
                  <span className="font-mono font-bold text-sm">40.prev = 30</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l6Step2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l6Step2 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL6Step3(!l6Step3)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l6Step3
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 3</span>
                  <span className="font-mono font-bold text-sm">40.next = NULL</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l6Step3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l6Step3 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL6Step4(!l6Step4)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l6Step4
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 4</span>
                  <span className="font-mono font-bold text-sm">TAIL = 40</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l6Step4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l6Step4 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            <button
              onClick={handleVerifyLevel6}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Tail Insertion
            </button>
          </div>
        )}

        {/* ================= LEVEL 7: Insert at Position ================= */}
        {level.level === 7 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Insert Node 30 Between 20 and 40
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rewire 4 pointers: 30.PREV = 20, 30.NEXT = 40, 20.NEXT = 30, and 40.PREV = 30.
              </p>
            </div>

            <DLLNodeVisualizer
              nodes={
                l7Step3 && l7Step4
                  ? [
                      { id: '10', data: 10, isHead: true },
                      { id: '20', data: 20, nextVal: '30' },
                      { id: '30', data: 30, prevVal: '20', nextVal: '40', isNew: true },
                      { id: '40', data: 40, prevVal: '30', nextVal: '50' },
                      { id: '50', data: 50, isTail: true },
                    ]
                  : [
                      { id: '10', data: 10, isHead: true },
                      { id: '20', data: 20, nextVal: l7Step3 ? '30' : '40' },
                      { id: '40', data: 40, prevVal: l7Step4 ? '30' : '20', nextVal: '50' },
                      { id: '50', data: 50, isTail: true },
                    ]
              }
            />

            {/* Step Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setL7Step1(!l7Step1)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l7Step1
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 1</span>
                  <span className="font-mono font-bold text-sm">30.prev = 20</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l7Step1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l7Step1 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL7Step2(!l7Step2)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l7Step2
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 2</span>
                  <span className="font-mono font-bold text-sm">30.next = 40</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l7Step2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l7Step2 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL7Step3(!l7Step3)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l7Step3
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 3</span>
                  <span className="font-mono font-bold text-sm">20.next = 30</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l7Step3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l7Step3 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL7Step4(!l7Step4)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l7Step4
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 4</span>
                  <span className="font-mono font-bold text-sm">40.prev = 30</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l7Step4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l7Step4 && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            <button
              onClick={handleVerifyLevel7}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Middle Insertion
            </button>
          </div>
        )}

        {/* ================= LEVEL 8: Delete Head & Tail ================= */}
        {level.level === 8 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Remove Nodes from the Boundaries
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Execute DELETE HEAD (remove Node 10) and DELETE TAIL (remove Node 40).
              </p>
            </div>

            <DLLNodeVisualizer
              nodes={[
                ...(l8HeadDeleted
                  ? []
                  : [{ id: '10', data: 10, isHead: !l8HeadDeleted, isFading: l8HeadDeleted }]),
                { id: '20', data: 20, isHead: l8HeadDeleted, prevVal: l8HeadDeleted ? null : '10' },
                { id: '30', data: 30, isTail: l8TailDeleted, nextVal: l8TailDeleted ? null : '40' },
                ...(l8TailDeleted
                  ? []
                  : [{ id: '40', data: 40, isTail: !l8TailDeleted, isFading: l8TailDeleted }]),
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setL8HeadDeleted(!l8HeadDeleted);
                }}
                className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l8HeadDeleted
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-900 dark:text-rose-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-sm">Delete HEAD (Node 10)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    HEAD moves to 20; 20.PREV becomes NULL.
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${l8HeadDeleted ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l8HeadDeleted && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setL8TailDeleted(!l8TailDeleted);
                }}
                className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l8TailDeleted
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-900 dark:text-rose-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-sm">Delete TAIL (Node 40)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    TAIL moves to 30; 30.NEXT becomes NULL.
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${l8TailDeleted ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l8TailDeleted && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            <button
              onClick={handleVerifyLevel8}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Boundary Deletions
            </button>
          </div>
        )}

        {/* ================= LEVEL 9: Delete Middle Node ================= */}
        {level.level === 9 && (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Delete Node 30 Without Breaking the Doubly Linked List
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rewire 20.NEXT to 40, rewire 40.PREV to 20, and deallocate Node 30.
              </p>
            </div>

            <DLLNodeVisualizer
              nodes={
                l9NodeFreed
                  ? [
                      { id: '10', data: 10, isHead: true },
                      { id: '20', data: 20, nextVal: '40' },
                      { id: '40', data: 40, prevVal: '20', nextVal: '50' },
                      { id: '50', data: 50, isTail: true },
                    ]
                  : [
                      { id: '10', data: 10, isHead: true },
                      { id: '20', data: 20, nextVal: l9NextRewired ? '40' : '30' },
                      { id: '30', data: 30, isFading: l9TargetSelected, highlight: l9TargetSelected },
                      { id: '40', data: 40, prevVal: l9PrevRewired ? '20' : '30', nextVal: '50' },
                      { id: '50', data: 50, isTail: true },
                    ]
              }
            />

            {/* 4 Execution Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setL9TargetSelected(!l9TargetSelected)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l9TargetSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 1</span>
                  <span className="font-mono font-bold text-sm">Select target = Node 30</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l9TargetSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l9TargetSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL9NextRewired(!l9NextRewired)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l9NextRewired
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 2</span>
                  <span className="font-mono font-bold text-sm">20.next = 40 (bypass 30)</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l9NextRewired ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l9NextRewired && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL9PrevRewired(!l9PrevRewired)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l9PrevRewired
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 3</span>
                  <span className="font-mono font-bold text-sm">40.prev = 20 (bypass 30)</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l9PrevRewired ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l9PrevRewired && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              <button
                onClick={() => setL9NodeFreed(!l9NodeFreed)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  l9NodeFreed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Step 4</span>
                  <span className="font-mono font-bold text-sm">Free Node 30 from memory</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${l9NodeFreed ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {l9NodeFreed && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            <button
              onClick={handleVerifyLevel9}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
            >
              Verify Middle-Node Deletion
            </button>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CONTROL BAR: Task instruction, Guided Solve button, Hint button, Reset button, Exit Level button */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Current Task Instruction:
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              {level.task}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Guided Solve */}
          <button
            id="btn-bottom-guided-solve"
            onClick={isGuidedActive ? handleStopGuidedSolve : handleStartOrResumeGuidedSolve}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isGuidedActive
                ? 'border-amber-400 bg-amber-500 text-white shadow-md'
                : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 hover:bg-amber-100'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-current" />
            {isGuidedActive ? 'Guided Solve Active' : '💡 Guided Solve'}
          </button>

          {/* Hint */}
          <button
            id="btn-bottom-hint"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            Hint
          </button>

          {/* Reset */}
          <button
            id="btn-bottom-reset"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Exit Level */}
          <button
            id="btn-bottom-exit"
            onClick={onBackToLevels}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Level
          </button>
        </div>
      </div>
    </div>

    {/* Right: Task / Instruction Panel (4 cols) */}
    <div className="lg:col-span-4 sticky top-6">
      <DLLRightTaskPanel
        level={level}
        checklist={checklist}
        feedback={feedback}
        hintStep={hintStep}
        onAdvanceHint={() => setHintStep((prev) => Math.min(3, prev + 1))}
        onCheckAnswer={handleCheckAnswer}
        onResetLevel={handleReset}
        onStartGuidedSolve={handleStartOrResumeGuidedSolve}
        isGuidedActive={isGuidedActive}
      />
    </div>
  </div>

      {/* 4. Feedback Banner when active */}
      {feedback && !showCompletionModal && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between gap-4 shadow-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>

          {feedback.type === 'success' && (
            <button
              onClick={() => setShowCompletionModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shrink-0"
            >
              View Results →
            </button>
          )}
        </div>
      )}

      {/* 5. LEVEL COMPLETION MODAL ("when_correct") */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl flex flex-col items-center text-center gap-5">
            {/* Celebration Icon */}
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {isGuidedComplete ? '🎉 Guided Solve Complete!' : `Task #${level.level} Completed!`}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {level.cardTitle || level.title}
              </h3>
            </div>

            {/* Level Complete Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 w-full my-1">
              <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 block">
                  Tasks Done
                </span>
                <span className="text-base font-black font-mono text-indigo-950 dark:text-indigo-200">
                  4 / 4
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                  Accuracy
                </span>
                <span className="text-base font-black font-mono text-emerald-950 dark:text-emerald-200">
                  100%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400 block">
                  XP Earned
                </span>
                <span className="text-base font-black font-mono text-purple-950 dark:text-purple-200">
                  +{level.xp} XP
                </span>
              </div>
            </div>

            {/* Completed DLL Visual */}
            <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Completed Doubly Linked List
              </span>
              <code className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-200 dark:border-purple-900 shadow-2xs">
                {level.preview}
              </code>
            </div>

            {/* Short Learning Summary */}
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-left text-xs text-slate-600 dark:text-slate-300 space-y-1 w-full">
              <span className="font-bold text-slate-900 dark:text-white block">
                Learning Takeaway:
              </span>
              <p className="leading-relaxed">
                {level.learningOutcome}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={onBackToLevels}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all"
              >
                Level Cards
              </button>

              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  if (onGoToNextLevel) {
                    onGoToNextLevel(level.level + 1);
                  } else {
                    onBackToLevels();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {level.level < 9 ? (
                  <>
                    Next Level
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Finish All
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
