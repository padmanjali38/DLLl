import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Gamepad2,
  Check,
  Star,
  Layers,
  ListOrdered,
  Trophy,
  Home,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { progressManager, TOPIC_REGISTRY } from '../utils/progressManager';
import { pointsManager } from '../utils/pointsManager';
import { soundManager } from '../utils/audio';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface QuizViewProps {
  onNavigateToTheory: (chapterId?: string) => void;
  onNavigateToQuest: (levelId?: number) => void;
  onNavigateToProgress: () => void;
  onNavigateToHome?: () => void;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswerText: string;
  explanation: string;
  exampleSnippet?: string;
  techniqueCode: string;
  targetChapterId?: string;
  targetLevelId?: number;
}

export interface StudentAnswerRecord {
  questionId: number;
  selectedOptionIndex: number;
  selectedAnswerText: string;
  correctOptionIndex: number;
  correctAnswerText: string;
  isCorrect: boolean;
  isTimeout?: boolean;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '1. What distinguishes a Doubly Linked List from a Singly Linked List?',
    options: [
      'It only stores integers instead of generic data types',
      'Each node contains two pointers: one pointing forward (next) and one pointing backward (prev)',
      'Nodes are stored in contiguous memory addresses like arrays',
      'It does not require head or tail pointers',
    ],
    correctIndex: 1,
    correctAnswerText: 'Each node contains two pointers: one pointing forward (next) and one pointing backward (prev)',
    explanation: 'A Doubly Linked List equips every node with both a prev pointer and a next pointer, enabling O(1) bi-directional navigation, whereas Singly Linked Lists only permit forward movement.',
    techniqueCode: 'FN-01',
    targetChapterId: 'theory-01',
    targetLevelId: 1,
  },
  {
    id: 2,
    question: '2. Why does deleting an arbitrary middle node in a Doubly Linked List take O(1) time when the node reference is given, compared to O(N) in a Singly Linked List?',
    options: [
      'Because nodes are indexed by integer keys in O(1)',
      'Because the target node directly stores target.prev, eliminating the need to traverse from head to find the predecessor',
      'Because DLL uses a hash map under the hood',
      'Because deletion in DLL does not require updating any adjacent node pointers',
    ],
    correctIndex: 1,
    correctAnswerText: 'Because the target node directly stores target.prev, eliminating the need to traverse from head to find the predecessor',
    explanation: 'In a Singly Linked List, you must linearly traverse from head to find the preceding node before you can rewire pointers (O(N)). In a DLL, target.prev gives direct constant-time access to the predecessor, allowing immediate O(1) rewiring.',
    techniqueCode: 'FN-09',
    targetChapterId: 'theory-09',
    targetLevelId: 3,
  },
  {
    id: 3,
    question: '3. What are the values of head.prev and tail.next in a valid Doubly Linked List with at least one node?',
    options: [
      'head.prev = head and tail.next = tail (self-looping)',
      'Both pointers must be NULL (or undefined in untyped environments) to designate boundary termination',
      'head.prev = tail and tail.next = head (circular list)',
      'head.prev points to the middle node and tail.next points to head',
    ],
    correctIndex: 1,
    correctAnswerText: 'Both pointers must be NULL (or undefined in untyped environments) to designate boundary termination',
    explanation: 'In a standard linear Doubly Linked List, head.prev is strictly NULL (signaling the start) and tail.next is strictly NULL (signaling the end). In a single-node list, head === tail, so both prev and next are NULL.',
    techniqueCode: 'FN-03',
    targetChapterId: 'theory-03',
    targetLevelId: 1,
  },
  {
    id: 4,
    question: '4. What is the correct 3-step pointer sequence for inserting a newNode at the head of a non-empty Doubly Linked List?',
    options: [
      'head.next = newNode; newNode.prev = head; head = newNode;',
      'newNode.next = head; head.prev = newNode; head = newNode;',
      'newNode.prev = head; head.next = newNode; tail = newNode;',
      'head = newNode; newNode.next = head.prev; head.prev = null;',
    ],
    correctIndex: 1,
    correctAnswerText: 'newNode.next = head; head.prev = newNode; head = newNode;',
    explanation: 'First, wire the new node forward to current head (newNode.next = head). Second, wire existing head back to new node (head.prev = newNode). Finally, update the list boundary head reference (head = newNode).',
    techniqueCode: 'FN-05',
    targetChapterId: 'theory-05',
    targetLevelId: 2,
  },
  {
    id: 5,
    question: '5. When appending a newNode to the tail of a non-empty Doubly Linked List in O(1) time, which sequence is correct?',
    options: [
      'newNode.prev = tail; tail.next = newNode; tail = newNode;',
      'tail = newNode; newNode.next = tail; tail.prev = null;',
      'tail.prev = newNode; newNode.next = tail; head = newNode;',
      'newNode.next = null; head.prev = newNode; tail = newNode;',
    ],
    correctIndex: 0,
    correctAnswerText: 'newNode.prev = tail; tail.next = newNode; tail = newNode;',
    explanation: 'To append in O(1), wire newNode.prev back to existing tail, wire existing tail.next forward to newNode, and advance the tail pointer to newNode.',
    techniqueCode: 'FN-06',
    targetChapterId: 'theory-06',
    targetLevelId: 2,
  },
  {
    id: 6,
    question: '6. Inserting a newNode between two nodes (A and B) requires updating exactly how many pointers in a Doubly Linked List?',
    options: [
      '2 pointers: only the next pointers of A and newNode',
      '4 pointers: A.next, newNode.prev, newNode.next, and B.prev',
      '6 pointers: including head and tail boundaries',
      '1 pointer: by swapping the data payload',
    ],
    correctIndex: 1,
    correctAnswerText: '4 pointers: A.next, newNode.prev, newNode.next, and B.prev',
    explanation: 'Inserting between A and B requires a 4-pointer rewire: newNode.next = B; newNode.prev = A; A.next = newNode; and B.prev = newNode.',
    techniqueCode: 'FN-07',
    targetChapterId: 'theory-07',
    targetLevelId: 2,
  },
  {
    id: 7,
    question: '7. What happens when deleting the head node in a Doubly Linked List with multiple nodes?',
    options: [
      'head = head.next; head.prev = null; (and free old head memory)',
      'tail = tail.prev; tail.next = null;',
      'head = null; tail = null;',
      'head.next = null; tail.prev = null;',
    ],
    correctIndex: 0,
    correctAnswerText: 'head = head.next; head.prev = null; (and free old head memory)',
    explanation: 'To delete the head, advance head to head.next, sever the backward reference by setting new head.prev = null, and deallocate the old head node.',
    techniqueCode: 'FN-08',
    targetChapterId: 'theory-08',
    targetLevelId: 3,
  },
  {
    id: 8,
    question: '8. How is a middle node target safely bypassed and deleted from a Doubly Linked List?',
    options: [
      'target.prev = null; target.next = null;',
      'target.prev.next = target.next; target.next.prev = target.prev; (and free target)',
      'head = target.next; tail = target.prev;',
      'target.next = target.prev; target.prev = target.next;',
    ],
    correctIndex: 1,
    correctAnswerText: 'target.prev.next = target.next; target.next.prev = target.prev; (and free target)',
    explanation: 'To bypass target node, connect target predecessor forward to target successor (target.prev.next = target.next) and connect target successor backward to target predecessor (target.next.prev = target.prev).',
    techniqueCode: 'FN-09',
    targetChapterId: 'theory-09',
    targetLevelId: 3,
  },
  {
    id: 9,
    question: '9. Which software design pattern or feature commonly utilizes a Doubly Linked List in production architectures?',
    options: [
      'LRU (Least Recently Used) Cache combined with a Hash Map, and Browser History Forward/Back navigation',
      'CPU L1 hardware instruction registers',
      'Relational Database primary B-Tree page indexing',
      'Static immutable constant lookup arrays',
    ],
    correctIndex: 0,
    correctAnswerText: 'LRU (Least Recently Used) Cache combined with a Hash Map, and Browser History Forward/Back navigation',
    explanation: 'LRU Cache requires O(1) removal and insertion of most/least recently accessed items, which a DLL enables when paired with a Hash Map. Browser Forward/Back history also relies on bi-directional node traversal.',
    techniqueCode: 'FN-10',
    targetChapterId: 'theory-10',
  },
  {
    id: 10,
    question: '10. What is the main memory trade-off of a Doubly Linked List compared to a Singly Linked List?',
    options: [
      'DLL requires O(N^2) space complexity',
      'Each DLL node incurs an additional pointer overhead (typically 8 bytes on a 64-bit architecture for prev pointer) per node',
      'DLL nodes cannot store numeric values',
      'DLL cannot be dynamically resized on the heap',
    ],
    correctIndex: 1,
    correctAnswerText: 'Each DLL node incurs an additional pointer overhead (typically 8 bytes on a 64-bit architecture for prev pointer) per node',
    explanation: 'Every DLL node maintains two memory addresses (prev and next). On 64-bit architectures, this extra pointer adds 8 bytes per node compared to Singly Linked Lists, while both retain O(N) space complexity.',
    techniqueCode: 'FN-12',
    targetChapterId: 'theory-12',
  },
];

const QUIZ_STORAGE_ANSWERS_KEY = 'algolearn_quiz_answers_v4';
const QUIZ_STORAGE_SUBMITTED_KEY = 'algolearn_quiz_submitted_v4';
const QUIZ_STORAGE_ATTEMPT_KEY = 'algolearn_quiz_attempt_id_v4';
const QUESTION_TIME_LIMIT_SECONDS = 20;

export const QuizView: React.FC<QuizViewProps> = ({
  onNavigateToTheory,
  onNavigateToQuest,
  onNavigateToProgress,
  onNavigateToHome,
}) => {
  useScrollReveal();

  // Load persisted answers
  const [studentAnswers, setStudentAnswers] = useState<Record<number, StudentAnswerRecord>>(() => {
    try {
      const stored = localStorage.getItem(QUIZ_STORAGE_ANSWERS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Load submission status
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    try {
      const storedSub = localStorage.getItem(QUIZ_STORAGE_SUBMITTED_KEY);
      if (storedSub !== null) return storedSub === 'true';
      return progressManager.getState().quizSubmitted || false;
    } catch {
      return false;
    }
  });

  // Unique Attempt ID to cleanly isolate attempts and prevent cross-attempt collisions
  const [attemptId, setAttemptId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(QUIZ_STORAGE_ATTEMPT_KEY);
      if (stored) return stored;
      const initialId = 'attempt_' + Date.now();
      localStorage.setItem(QUIZ_STORAGE_ATTEMPT_KEY, initialId);
      return initialId;
    } catch {
      return 'attempt_' + Date.now();
    }
  });

  // Active timers references to guarantee cancellation on complete reset
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTopic = TOPIC_REGISTRY[progressManager.getActiveTopicId()] || TOPIC_REGISTRY['dll'];

  // Gate quiz timer and Question 1 behind explicit "Start Quiz" button:
  // If quiz is already submitted or has existing recorded answers, hasStarted defaults to true to preserve attempt resume.
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    try {
      if (isSubmitted) return true;
      const stored = localStorage.getItem(QUIZ_STORAGE_ANSWERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Object.keys(parsed).length > 0) return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const handleStartQuiz = () => {
    soundManager.playPrimaryClick();
    setHasStarted(true);
    setTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
    isSubmittingRef.current = false;
  };

  const handleRestartQuiz = () => {
    soundManager.playClick();

    // 1. Invalidate and clear all active timers and pending auto-advance callbacks immediately
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }

    // 2. Generate a fresh attempt ID
    const newAttemptId = 'attempt_' + Date.now();
    try {
      localStorage.removeItem(QUIZ_STORAGE_ANSWERS_KEY);
      localStorage.removeItem(QUIZ_STORAGE_SUBMITTED_KEY);
      localStorage.setItem(QUIZ_STORAGE_ATTEMPT_KEY, newAttemptId);
    } catch {
      // Ignore storage errors
    }

    // 3. Clear progressManager scores for this topic so reattempt starts from a blank ledger
    progressManager.resetQuizAttempt(activeTopic?.id || 'dll');

    // 4. Reset entire quiz state collection and attempt-level states
    setAttemptId(newAttemptId);
    setStudentAnswers({});
    setIsSubmitted(false);
    setHasStarted(false);
    setCurrentQuestionIndex(0);
    setPendingSelection(null);
    setTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
    isSubmittingRef.current = false;
  };

  // Navigation within Quiz (0-indexed current question)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [pendingSelection, setPendingSelection] = useState<number | null>(null);

  // Per-question countdown timer state
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT_SECONDS);
  const isSubmittingRef = useRef<boolean>(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex] || QUIZ_QUESTIONS[0];
  const currentAnswerRecord = studentAnswers[currentQuestion.id];
  const isCurrentQuestionAnswered = currentAnswerRecord !== undefined;

  // Sync selection with current question record
  useEffect(() => {
    if (currentAnswerRecord !== undefined) {
      setPendingSelection(currentAnswerRecord.selectedOptionIndex >= 0 ? currentAnswerRecord.selectedOptionIndex : null);
    } else {
      setPendingSelection(null);
    }
  }, [currentQuestionIndex, currentAnswerRecord]);

  // Persist answers
  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_STORAGE_ANSWERS_KEY, JSON.stringify(studentAnswers));
    } catch {
      // Ignore
    }
  }, [studentAnswers]);

  // Handle Timeout when 20s expires: 0 points awarded, no penalty, recorded as unanswered
  const handleQuestionTimeout = (qId: number) => {
    if (isSubmittingRef.current || studentAnswers[qId] !== undefined) return;
    isSubmittingRef.current = true;

    // Immediately stop and clear any active interval timer
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    setTimeLeft(0);
    soundManager.playError();

    const q = QUIZ_QUESTIONS.find((item) => item.id === qId) || currentQuestion;
    const timeoutRecord: StudentAnswerRecord = {
      questionId: q.id,
      selectedOptionIndex: -1,
      selectedAnswerText: 'Unanswered (Timed out)',
      correctOptionIndex: q.correctIndex,
      correctAnswerText: q.correctAnswerText,
      isCorrect: false,
      isTimeout: true,
    };
    setStudentAnswers((prev) => ({
      ...prev,
      [q.id]: timeoutRecord,
    }));

    // Record timeout in progressManager and pointsManager: scoreDelta = 0, no penalty!
    progressManager.recordQuizQuestionAnswer(activeTopic?.id || 'dll', q.id, -1, false, true, attemptId);
    pointsManager.recordEvent('QUIZ_ANSWER', String(q.id), {
      questionId: q.id,
      selectedIndex: -1,
      attemptId,
    });
  };

  // =========================================================================
  // PER-QUESTION TIMER ENGINE (20 Seconds Per Question)
  // Runs strictly while question is active, student clicked "Start Quiz", and not resolved
  // =========================================================================
  useEffect(() => {
    // If not started, already submitted, or current question is answered/timed-out, stop timer
    if (!hasStarted || isSubmitted || isCurrentQuestionAnswered) {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
      setTimeLeft(0);
      return;
    }

    // Reset countdown to 20 seconds for this active question
    setTimeLeft(QUESTION_TIME_LIMIT_SECONDS);
    isSubmittingRef.current = false;

    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }

    const currentQId = currentQuestion.id;
    intervalTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalTimerRef.current) {
            clearInterval(intervalTimerRef.current);
            intervalTimerRef.current = null;
          }
          // Safely mark this specific question as Timed Out
          handleQuestionTimeout(currentQId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
    };
  }, [hasStarted, currentQuestion.id, isCurrentQuestionAnswered, isSubmitted, attemptId]);

  // Calculate score deterministically according to exact scoring rules
  // Correct: +3, Incorrect: -1, Timeout: 0 (uncapped deductions per Requirement 3)
  const { score, totalQuestions, percentage, correctCount, incorrectCount, timeoutCount, rawNetScore } = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let timeout = 0;

    QUIZ_QUESTIONS.forEach((q) => {
      const rec = studentAnswers[q.id];
      if (rec) {
        if (rec.isCorrect) correct++;
        else if (rec.isTimeout) timeout++;
        else incorrect++;
      }
    });

    const total = QUIZ_QUESTIONS.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const rawNet = correct * 3 - incorrect * 1;

    return {
      score: correct,
      totalQuestions: total,
      percentage: pct,
      correctCount: correct,
      incorrectCount: incorrect,
      timeoutCount: timeout,
      rawNetScore: rawNet,
    };
  }, [studentAnswers]);

  // Option select
  const handleSelectOption = (optionIndex: number) => {
    if (isCurrentQuestionAnswered || isSubmitted) return;
    soundManager.playQuizSelect();
    setPendingSelection(optionIndex);
  };

  // Confirm Answer: +3 for correct, -1 for incorrect
  const handleConfirmAnswer = () => {
    if (pendingSelection === null || isCurrentQuestionAnswered || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const q = currentQuestion;
    const isCorrect = pendingSelection === q.correctIndex;
    const selectedText = q.options[pendingSelection] || '';

    const newRecord: StudentAnswerRecord = {
      questionId: q.id,
      selectedOptionIndex: pendingSelection,
      selectedAnswerText: selectedText,
      correctOptionIndex: q.correctIndex,
      correctAnswerText: q.correctAnswerText,
      isCorrect,
      isTimeout: false,
    };

    const updatedAnswers = {
      ...studentAnswers,
      [q.id]: newRecord,
    };

    setStudentAnswers(updatedAnswers);

    // Record scoring event in progressManager and pointsManager (+3 for correct, -1 for incorrect)
    progressManager.recordQuizQuestionAnswer(activeTopic?.id || 'dll', q.id, pendingSelection, isCorrect, false, attemptId);
    pointsManager.recordEvent('QUIZ_ANSWER', String(q.id), {
      questionId: q.id,
      selectedIndex: pendingSelection,
      attemptId,
    });

    if (isCorrect) {
      soundManager.playQuizCorrect();
    } else {
      soundManager.playQuizWrong();
    }
  };

  // Submit complete quiz
  const handleSubmitExamination = () => {
    const updatedAnswers = { ...studentAnswers };
    if (pendingSelection !== null && !updatedAnswers[currentQuestion.id]) {
      const q = currentQuestion;
      const isCorrect = pendingSelection === q.correctIndex;
      const selectedText = q.options[pendingSelection] || '';
      const newRecord: StudentAnswerRecord = {
        questionId: q.id,
        selectedOptionIndex: pendingSelection,
        selectedAnswerText: selectedText,
        correctOptionIndex: q.correctIndex,
        correctAnswerText: q.correctAnswerText,
        isCorrect,
        isTimeout: false,
      };
      updatedAnswers[q.id] = newRecord;
      setStudentAnswers(updatedAnswers);
      progressManager.recordQuizQuestionAnswer(activeTopic?.id || 'dll', q.id, pendingSelection, isCorrect, false, attemptId);
      pointsManager.recordEvent('QUIZ_ANSWER', String(q.id), {
        questionId: q.id,
        selectedIndex: pendingSelection,
        attemptId,
      });
    }

    // Fill any skipped questions as timed out (0 points)
    QUIZ_QUESTIONS.forEach((q) => {
      if (!updatedAnswers[q.id]) {
        updatedAnswers[q.id] = {
          questionId: q.id,
          selectedOptionIndex: -1,
          selectedAnswerText: 'Unanswered',
          correctOptionIndex: q.correctIndex,
          correctAnswerText: q.correctAnswerText,
          isCorrect: false,
          isTimeout: true,
        };
        progressManager.recordQuizQuestionAnswer(activeTopic?.id || 'dll', q.id, -1, false, true, attemptId);
        pointsManager.recordEvent('QUIZ_ANSWER', String(q.id), {
          questionId: q.id,
          selectedIndex: -1,
          attemptId,
        });
      }
    });

    setIsSubmitted(true);
    try {
      localStorage.setItem(QUIZ_STORAGE_SUBMITTED_KEY, 'true');
    } catch {
      // Ignore
    }

    let calculatedCorrect = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const rec = updatedAnswers[q.id];
      if (rec && rec.isCorrect) calculatedCorrect++;
    });

    const rawScoresMap: Record<number, number> = {};
    (Object.values(updatedAnswers) as StudentAnswerRecord[]).forEach((rec) => {
      rawScoresMap[rec.questionId] = rec.selectedOptionIndex;
    });

    progressManager.recordQuizCompletion(rawScoresMap, calculatedCorrect, QUIZ_QUESTIONS.length);

    if (calculatedCorrect >= 6) {
      soundManager.playQuizComplete();
    } else {
      soundManager.playQuizWrong();
    }
  };

  const answeredCount = Object.keys(studentAnswers).length;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4 font-sans text-slate-900 dark:text-white animate-page-enter pb-16">
      {/* Header Banner */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl pb-6 mb-6 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-slate-800 text-[#2563EB] dark:text-blue-300 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            <span>Quiz Assessment Section</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Per-Question Timer Indicator */}
            {!isSubmitted && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                  isCurrentQuestionAnswered
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    : !hasStarted
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border-blue-200 dark:border-blue-900/60'
                    : timeLeft <= 5
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border-blue-200 dark:border-blue-900/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {isCurrentQuestionAnswered
                    ? currentAnswerRecord?.isTimeout
                      ? 'Time Expired'
                      : 'Answered'
                    : !hasStarted
                    ? 'Timer Stopped (Click Start Quiz)'
                    : `Time Left: ${timeLeft}s`}
                </span>
              </div>
            )}

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              10 Questions (+3 / -1)
            </span>

          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter">
          Doubly Linked List Mastery Quiz
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Test your understanding with 20 seconds per question. Correct answers award +3 raw points, incorrect answers deduct 1 raw point, and timed-out questions award 0 points.
        </p>

        {/* Clear Scoring Rules Banner (Requirement 4.1) */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Scoring Rules:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono font-bold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span>Correct answer:</span>
              <span className="font-extrabold">+3 pts</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <span>Wrong answer:</span>
              <span className="font-extrabold">-1 pts</span>
            </span>
          </div>
        </div>

        {/* Question Index Tabs / Progress Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>
                Progress: <strong className="text-[#2563EB] dark:text-blue-300 font-mono">{answeredCount}</strong> / {totalQuestions} Completed
              </span>
            </div>
            {isSubmitted && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                {score} / {totalQuestions} Correct
              </span>
            )}
          </div>

          {/* Question Index Pills */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const rec = studentAnswers[q.id];
              const isAnswered = rec !== undefined;
              const isCurrent = currentQuestionIndex === idx && !isSubmitted;

              let pillStyle =
                'bg-slate-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#1E293B]';
              if (isCurrent) {
                pillStyle =
                  'bg-primary-gradient text-white border-transparent font-bold shadow-xs shadow-primary-gradient';
              } else if (isAnswered) {
                if (rec.isCorrect) {
                  pillStyle =
                    'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 font-semibold';
                } else if (rec.isTimeout) {
                  pillStyle =
                    'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 font-semibold';
                } else {
                  pillStyle =
                    'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-semibold';
                }
              }

              return (
                <button
                  key={q.id}
                  id={`btn-quiz-jump-${q.id}`}
                  onClick={() => {
                    soundManager.playNav();
                    if (isSubmitted) {
                      const el = document.getElementById(`quiz-review-card-${q.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className={`py-2 text-center text-xs font-mono rounded-xl border transition-all ${isSubmitted ? 'cursor-pointer' : 'cursor-default'} ${pillStyle}`}
                  title={`Question ${idx + 1}`}
                >
                  <span>Q{idx + 1}</span>
                  {isAnswered && (
                    <span className="block text-[10px] leading-tight mt-0.5">
                      {rec.isCorrect ? '✓' : rec.isTimeout ? '⏱' : '✕'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          QUIZ COMPLETION VIEW (WHEN SUBMITTED) — RETAKE ALLOWED
          ========================================================================= */}
      {isSubmitted ? (
        <div className="space-y-8">
          <div
            id="quiz-result-card"
            className="p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center text-center animate-editorial-scale transition-all"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#00A86B] dark:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/50 mx-auto mb-4">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#00A86B]/40 dark:border-emerald-500/40 bg-[#E6F8F0] dark:bg-emerald-950/60 text-[#008A54] dark:text-emerald-300 font-mono text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-3">
              ★ ASSESSMENT COMPLETED ★
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-2">
              QUIZ ASSESSMENT RESULTS
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed mb-6">
              Your responses have been recorded in the persistent ledger. Points are normalized to your overall topic competition score.
            </p>

            {/* Score Metric Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mx-auto mb-6">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block mb-1">
                  CORRECT (+3)
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {correctCount}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block mb-1">
                  INCORRECT (-1)
                </span>
                <span className="text-2xl font-extrabold text-rose-500 dark:text-rose-400 font-mono">
                  {incorrectCount}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block mb-1">
                  TIMEOUT (0)
                </span>
                <span className="text-2xl font-extrabold text-amber-500 font-mono">
                  {timeoutCount}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block mb-1">
                  NET RAW SCORE
                </span>
                <span className="text-2xl font-extrabold text-[#2563EB] dark:text-blue-400 font-mono">
                  {rawNetScore} / 30
                </span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-4 w-full max-w-lg mx-auto">

              <button
                id="btn-quiz-view-progress"
                type="button"
                onClick={() => {
                  soundManager.playNav();
                  onNavigateToProgress();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary-gradient text-white font-sans text-xs font-bold uppercase tracking-wider shadow-md shadow-primary-gradient transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
              >
                <TrendingUp className="w-4 h-4" />
                <span>View Topic Progress</span>
              </button>

              <button
                id="btn-quiz-back-home"
                type="button"
                onClick={() => {
                  soundManager.playNav();
                  if (onNavigateToHome) onNavigateToHome();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Home className="w-4 h-4" />
                <span>Overview</span>
              </button>
            </div>
          </div>

          {/* Full Question Review Cards */}
          <div id="quiz-question-overview-section" className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <ListOrdered className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                <span>Full Question-by-Question Review</span>
              </h3>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold font-mono">
                {score} of {totalQuestions} Correct
              </span>
            </div>

            <div className="space-y-4">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const rec = studentAnswers[q.id];
                const isCorrect = rec?.isCorrect || false;
                const isTimedOut = rec?.isTimeout || false;
                const cleanQuestionText = q.question.replace(/^\d+\.\s*/, '');
                const questionNumberStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

                return (
                  <div
                    key={q.id}
                    id={`quiz-review-card-${q.id}`}
                    className={`p-6 rounded-2xl bg-white dark:bg-[#111827] border transition-all shadow-xs ${
                      isCorrect
                        ? 'border-emerald-400 dark:border-emerald-500/50'
                        : isTimedOut
                        ? 'border-amber-300 dark:border-amber-500/50'
                        : 'border-rose-300 dark:border-rose-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 bg-primary-gradient text-white rounded-full text-xs font-bold font-mono tracking-wide shadow-xs">
                          Question {questionNumberStr}
                        </span>
                      </div>

                      <div>
                        {isCorrect ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Correct (+3 pts)</span>
                          </div>
                        ) : isTimedOut ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Timed Out (0 pts)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Incorrect (-1 pt)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-4 leading-snug break-words">
                      {cleanQuestionText}
                    </h4>

                    {/* Submission and Correct Answer Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div
                        className={`p-3.5 rounded-xl border ${
                          isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30'
                            : isTimedOut
                            ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30'
                            : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-bold tracking-wider uppercase mb-1 text-slate-500">
                          YOUR RESPONSE:
                        </div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {rec && rec.selectedOptionIndex >= 0
                            ? `${String.fromCharCode(65 + rec.selectedOptionIndex)}: ${rec.selectedAnswerText}`
                            : 'Timed Out / Unanswered'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120]">
                        <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 mb-1">
                          CORRECT ANSWER:
                        </div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {String.fromCharCode(65 + q.correctIndex)}: {q.correctAnswerText}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1.5">
                        <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                        <span>Technical Explanation:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Taking the Quiz Question Flow */
        <div className="space-y-6">
          <div
            key={currentQuestion.id}
            id={`quiz-step-card-${currentQuestion.id}`}
            className={`p-6 sm:p-8 border rounded-3xl transition-all bg-white dark:bg-[#111827] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${
              isCurrentQuestionAnswered
                ? currentAnswerRecord?.isCorrect
                  ? 'border-emerald-300 dark:border-emerald-500/40 ring-1 ring-emerald-200 dark:ring-emerald-500/30'
                  : currentAnswerRecord?.isTimeout
                  ? 'border-amber-300 dark:border-amber-500/40 ring-1 ring-amber-200 dark:ring-amber-500/30'
                  : 'border-rose-300 dark:border-rose-500/40 ring-1 ring-rose-200 dark:ring-rose-500/30'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Question Card Top Bar */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#2563EB] dark:bg-blue-600 text-white rounded-lg text-xs font-bold font-mono shadow-xs">
                  Question {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isCurrentQuestionAnswered ? (
                  currentAnswerRecord?.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Correct (+3 pts)</span>
                    </span>
                  ) : currentAnswerRecord?.isTimeout ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Timed Out (0 pts)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Incorrect (-1 pt)</span>
                    </span>
                  )
                ) : !hasStarted ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border-blue-200 dark:border-blue-900/60">
                    <Clock className="w-3.5 h-3.5" />
                    <span>20s (Paused)</span>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-colors ${
                      timeLeft <= 5
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Start Quiz Callout Banner in Question 1 Area */}
            {!hasStarted && (
              <div
                id="quiz-start-callout"
                className="mb-6 p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assessment Ready — Question 1
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      The 20-second per-question countdown begins when you click Start Quiz.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-start-quiz"
                  type="button"
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-gradient text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-primary-gradient transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-98 shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Quiz</span>
                </button>
              </div>
            )}

            {/* Question Statement */}
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 leading-snug break-words">
              {currentQuestion.question}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = pendingSelection === optIdx;
                let optStyle =
                  'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-800 dark:text-slate-200';

                if (isCurrentQuestionAnswered) {
                  if (optIdx === currentQuestion.correctIndex) {
                    optStyle =
                      'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold ring-2 ring-emerald-400 dark:ring-emerald-500/40';
                  } else if (isSelected && !currentAnswerRecord?.isCorrect) {
                    optStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-950 dark:text-rose-200 font-bold';
                  } else {
                    optStyle = 'bg-white dark:bg-[#0B1120] opacity-40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500';
                  }
                } else if (isSelected) {
                  optStyle =
                    'bg-blue-50/80 dark:bg-blue-950/60 border-[#2563EB] dark:border-cyan-400 text-blue-950 dark:text-cyan-200 font-semibold ring-2 ring-blue-500 dark:ring-cyan-500/30';
                }

                return (
                  <button
                    key={optIdx}
                    id={`quiz-q${currentQuestion.id}-opt${optIdx}`}
                    onClick={() => {
                      if (!hasStarted) return;
                      handleSelectOption(optIdx);
                    }}
                    disabled={!hasStarted || isCurrentQuestionAnswered}
                    className={`w-full p-4 text-left text-sm font-sans rounded-2xl border transition-all flex items-start gap-3.5 ${!hasStarted || isCurrentQuestionAnswered ? 'cursor-not-allowed' : 'cursor-pointer'} ${optStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold font-mono ${
                        isSelected
                          ? isCurrentQuestionAnswered
                            ? optIdx === currentQuestion.correctIndex
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-primary-gradient text-white border-transparent shadow-xs'
                          : 'bg-slate-100 dark:bg-[#111827] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 pt-0.5 leading-relaxed break-words">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Sequential question progression indicator (previous button removed per specification) */}
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                <ListOrdered className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              </div>

              {!hasStarted ? null : !isCurrentQuestionAnswered ? (
                currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    id="btn-submit-answer"
                    disabled={pendingSelection === null}
                    onClick={handleConfirmAnswer}
                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary-gradient text-white flex items-center gap-2 transition-all shadow-md shadow-primary-gradient ${
                      pendingSelection !== null
                        ? 'cursor-pointer hover:brightness-110'
                        : 'opacity-40 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  <button
                    id="btn-finish-quiz"
                    disabled={pendingSelection === null}
                    onClick={handleSubmitExamination}
                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary-gradient text-white flex items-center gap-2 transition-all shadow-md shadow-primary-gradient ${
                      pendingSelection !== null
                        ? 'cursor-pointer hover:brightness-110'
                        : 'opacity-40 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Complete & Review</span>
                  </button>
                )
              ) : currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  id="btn-next-question"
                  onClick={() => {
                    soundManager.playClick();
                    setCurrentQuestionIndex((prev) => prev + 1);
                  }}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary-gradient text-white flex items-center gap-2 cursor-pointer shadow-md shadow-primary-gradient hover:brightness-110"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-finish-quiz"
                  onClick={handleSubmitExamination}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary-gradient text-white flex items-center gap-2 cursor-pointer shadow-md shadow-primary-gradient hover:brightness-110"
                >
                  <Award className="w-4 h-4" />
                  <span>Complete & Review</span>
                </button>
              )}
            </div>

            {/* Technical Explanation Panel (visible once answered) */}
            {isCurrentQuestionAnswered && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] rounded-2xl p-4 sm:p-5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-2">
                  <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                  <span>Technical Explanation:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 font-normal text-sm">
                  {currentQuestion.explanation}
                </p>

                {currentQuestion.exampleSnippet && (
                  <div className="mb-3 p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-[#2563EB] dark:text-cyan-300 font-semibold">
                    Example: {currentQuestion.exampleSnippet}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
