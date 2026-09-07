import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Gamepad2,
  Check,
  Star,
  Layers,
  ChevronRight,
  ListOrdered,
  Trophy,
  Home,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
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
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '1. What distinguishes a Doubly Linked List from a Singly Linked List?',
    options: [
      'It only stores integers instead of generic data types',
      'Each node stores two pointers: prev to predecessor and next to successor',
      'It is stored contiguously in CPU L1 cache',
      'It cannot dynamically resize at runtime',
    ],
    correctIndex: 1,
    correctAnswerText: 'Each node stores two pointers: prev to predecessor and next to successor',
    explanation:
      'A Doubly Linked List node contains three fields: the payload data, a next pointer referencing the successor, and a prev pointer referencing the predecessor.',
    techniqueCode: 'DLL-01',
    targetChapterId: 'what-is-dll',
  },
  {
    id: 2,
    question: '2. What are the boundary invariants for head and tail nodes in a non-circular Doubly Linked List?',
    options: [
      'head.prev == null and tail.next == null',
      'head.next == null and tail.prev == null',
      'head == tail always',
      'head.prev points to tail',
    ],
    correctIndex: 0,
    correctAnswerText: 'head.prev == null and tail.next == null',
    explanation:
      'In a linear non-circular Doubly Linked List, the head node has no predecessor (head.prev == null) and the tail node has no successor (tail.next == null).',
    techniqueCode: 'DLL-02',
    targetChapterId: 'head-tail-pointers',
  },
  {
    id: 3,
    question: '3. What is the time complexity of inserting a new node at the head of a Doubly Linked List?',
    options: [
      'O(N) linear time',
      'O(log N) logarithmic time',
      'O(1) constant time',
      'O(N²) quadratic time',
    ],
    correctIndex: 2,
    correctAnswerText: 'O(1) constant time',
    explanation:
      'Inserting at the head requires only updating the new node pointers, pointing old head.prev to newNode, and reassigning the head reference in O(1) constant time.',
    techniqueCode: 'DLL-03',
    targetChapterId: 'insert-head',
    targetLevelId: 1,
  },
  {
    id: 4,
    question: '4. Why is deleting the tail node in a Doubly Linked List O(1) if a tail pointer is maintained, whereas in a Singly Linked List it is O(N)?',
    options: [
      'Singly Linked Lists do not support dynamic heap memory allocation',
      'In a DLL, tail.prev gives direct access to the new tail without traversing from the head',
      'Doubly Linked Lists are sorted automatically',
      'Tail nodes are cached in CPU registers',
    ],
    correctIndex: 1,
    correctAnswerText: 'In a DLL, tail.prev gives direct access to the new tail without traversing from the head',
    explanation:
      'In a Singly Linked List, reaching the second-to-last node requires an O(N) scan from head. In a DLL, tail.prev gives instant O(1) access to update tail = tail.prev and tail.next = null.',
    techniqueCode: 'DLL-04',
    targetChapterId: 'delete-head-tail',
    targetLevelId: 2,
  },
  {
    id: 5,
    question: '5. When inserting a new node between two existing nodes (A and B), how many pointer updates are required?',
    options: [
      '1 pointer update',
      '2 pointer updates',
      '4 pointer updates (newNode.prev, newNode.next, A.next, B.prev)',
      '8 pointer updates',
    ],
    correctIndex: 2,
    correctAnswerText: '4 pointer updates (newNode.prev, newNode.next, A.next, B.prev)',
    explanation:
      'Middle insertion requires connecting newNode forward to B (newNode.next = B), newNode backward to A (newNode.prev = A), A forward to newNode (A.next = newNode), and B backward to newNode (B.prev = newNode).',
    techniqueCode: 'DLL-05',
    targetChapterId: 'insert-position',
    targetLevelId: 4,
  },
  {
    id: 6,
    question: '6. What are the two essential pointer bypass statements for deleting a middle node target?',
    options: [
      'target.next = null; target.prev = null;',
      'target.prev.next = target.next; target.next.prev = target.prev;',
      'head = target.next; tail = target.prev;',
      'target.next = target.prev;',
    ],
    correctIndex: 1,
    correctAnswerText: 'target.prev.next = target.next; target.next.prev = target.prev;',
    explanation:
      'The target node is bypassed by wiring its predecessor forward to its successor (target.prev.next = target.next) and wiring its successor backward to its predecessor (target.next.prev = target.prev).',
    techniqueCode: 'DLL-06',
    targetChapterId: 'delete-node',
    targetLevelId: 5,
  },
  {
    id: 7,
    question: '7. How can bi-directional traversal optimize element access by index k in an N-element Doubly Linked List?',
    options: [
      'It converts linear search into binary search in O(log N)',
      'If k < N/2, traverse forward from head; if k >= N/2, traverse backward from tail, cutting max steps in half',
      'It provides instant O(1) random array indexing',
      'It eliminates memory lookups',
    ],
    correctIndex: 1,
    correctAnswerText: 'If k < N/2, traverse forward from head; if k >= N/2, traverse backward from tail, cutting max steps in half',
    explanation:
      'Because traversal can start from either head or tail, picking the closest end halves the worst-case number of pointer hops (at most N/2 steps).',
    techniqueCode: 'DLL-07',
    targetChapterId: 'bidirectional-traversal',
    targetLevelId: 3,
  },
  {
    id: 8,
    question: '8. In an LRU (Least Recently Used) Cache, why is a Doubly Linked List paired with a Hash Map?',
    options: [
      'The Hash Map sorts keys, while the DLL encrypts values',
      'The Hash Map gives O(1) lookup, while the DLL allows O(1) removal and head-promotion of recently accessed nodes',
      'The DLL compresses memory for the Hash Map',
      'To prevent memory fragmentation in arrays',
    ],
    correctIndex: 1,
    correctAnswerText: 'The Hash Map gives O(1) lookup, while the DLL allows O(1) removal and head-promotion of recently accessed nodes',
    explanation:
      'A Hash Map provides O(1) key-to-node lookup, and the Doubly Linked List enables O(1) detachment and re-attachment of nodes at the head upon access without traversing.',
    techniqueCode: 'DLL-08',
    targetChapterId: 'real-world-applications',
  },
  {
    id: 9,
    question: '9. What is the primary memory trade-off of a Doubly Linked List compared to an Array or Singly Linked List?',
    options: [
      'DLL nodes cannot hold objects',
      'Each node incurs 2x pointer overhead (16 bytes on 64-bit systems) and lower CPU cache locality due to heap fragmentation',
      'DLLs cannot grow beyond a fixed capacity',
      'DLLs require hardware GPU acceleration',
    ],
    correctIndex: 1,
    correctAnswerText: 'Each node incurs 2x pointer overhead (16 bytes on 64-bit systems) and lower CPU cache locality due to heap fragmentation',
    explanation:
      'Storing both prev and next pointers requires 16 bytes of metadata per node on 64-bit architectures, and non-contiguous heap allocation leads to higher CPU cache misses during sequential traversal.',
    techniqueCode: 'DLL-09',
    targetChapterId: 'limitations-tradeoffs',
  },
  {
    id: 10,
    question: '10. Which real-world software feature natively relies on bi-directional linked list traversal?',
    options: [
      'Browser History (Forward and Back button navigation)',
      'Database B-Tree indexing',
      'Floating-point arithmetic unit',
      'DNS IP resolution',
    ],
    correctIndex: 0,
    correctAnswerText: 'Browser History (Forward and Back button navigation)',
    explanation:
      'Web browsers model history using a Doubly Linked List: Back accesses curr.prev, Forward accesses curr.next, and visiting a new page appends a new node.',
    techniqueCode: 'DLL-10',
    targetChapterId: 'real-world-applications',
  },
];

const QUIZ_STORAGE_ANSWERS_KEY = 'hash_quest_quiz_answers_v3';
const QUIZ_STORAGE_SUBMITTED_KEY = 'hash_quest_quiz_submitted_v3';

export const QuizView: React.FC<QuizViewProps> = ({
  onNavigateToTheory,
  onNavigateToQuest,
  onNavigateToProgress,
  onNavigateToHome,
}) => {
  useScrollReveal();

  // Load persisted student answers
  const [studentAnswers, setStudentAnswers] = useState<Record<number, StudentAnswerRecord>>(() => {
    try {
      const stored = localStorage.getItem(QUIZ_STORAGE_ANSWERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    try {
      const storedSub = localStorage.getItem(QUIZ_STORAGE_SUBMITTED_KEY);
      if (storedSub !== null) {
        return storedSub === 'true';
      }
      return progressManager.getState().quizSubmitted || false;
    } catch {
      return false;
    }
  });

  // Subscribe to progressManager for reset synchronization
  useEffect(() => {
    const unsub = progressManager.subscribe((pState) => {
      if (!pState.quizSubmitted) {
        setIsSubmitted(false);
        try {
          const stored = localStorage.getItem(QUIZ_STORAGE_ANSWERS_KEY);
          if (!stored) {
            setStudentAnswers({});
          }
        } catch {
          // Ignore
        }
      }
    });
    return unsub;
  }, []);

  // Navigation within Quiz (0-indexed current question)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  // Temporary selection before confirming/submitting the question
  const [pendingSelection, setPendingSelection] = useState<number | null>(null);

  // Current question helper
  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex] || QUIZ_QUESTIONS[0];
  const currentAnswerRecord = studentAnswers[currentQuestion.id];
  const isCurrentQuestionAnswered = currentAnswerRecord !== undefined;

  // Synchronize selection with current question record
  useEffect(() => {
    if (currentAnswerRecord !== undefined) {
      setPendingSelection(currentAnswerRecord.selectedOptionIndex);
    } else {
      setPendingSelection(null);
    }
  }, [currentQuestionIndex, currentAnswerRecord]);

  // Persist answers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_STORAGE_ANSWERS_KEY, JSON.stringify(studentAnswers));
    } catch {
      // Ignore storage errors
    }
  }, [studentAnswers]);

  // Calculate score deterministically from stored answers
  const { score, totalQuestions, percentage } = useMemo(() => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const rec = studentAnswers[q.id];
      if (rec && rec.isCorrect) {
        correct++;
      }
    });
    const total = QUIZ_QUESTIONS.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return {
      score: correct,
      totalQuestions: total,
      percentage: pct,
      correctAnswersCount: correct,
    };
  }, [studentAnswers]);

  // Handle student selecting an option (before or during answering)
  const handleSelectOption = (optionIndex: number) => {
    if (isCurrentQuestionAnswered && isSubmitted) return;
    soundManager.playQuizSelect();
    setPendingSelection(optionIndex);
  };

  // Handle confirming answer for current question (Records answer without revealing final result screen)
  const handleConfirmAnswer = () => {
    if (pendingSelection === null || isCurrentQuestionAnswered) return;

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
    };

    const updatedAnswers = {
      ...studentAnswers,
      [q.id]: newRecord,
    };

    setStudentAnswers(updatedAnswers);

    // Play appropriate interaction sound
    if (isCorrect) {
      soundManager.playQuizCorrect();
    } else {
      soundManager.playQuizWrong();
    }
  };

  // Handle submitting the entire examination ONLY when user clicks "Complete & Review"
  const handleSubmitExamination = () => {
    // If pending selection on current question is not saved yet, save it
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
      };
      updatedAnswers[q.id] = newRecord;
      setStudentAnswers(updatedAnswers);
    }

    const totalAnswered = Object.keys(updatedAnswers).length;
    if (totalAnswered < QUIZ_QUESTIONS.length) {
      soundManager.playError();
      const firstUnansweredIndex = QUIZ_QUESTIONS.findIndex((quest) => updatedAnswers[quest.id] === undefined);
      if (firstUnansweredIndex >= 0) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
      return;
    }

    setIsSubmitted(true);
    try {
      localStorage.setItem(QUIZ_STORAGE_SUBMITTED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }

    // Calculate final correct score
    let calculatedCorrect = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const rec = updatedAnswers[q.id];
      if (rec && rec.isCorrect) calculatedCorrect++;
    });

    // Synchronize with progressManager
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

  // Handle resetting the quiz completely
  const handleResetQuiz = () => {
    soundManager.playReset();
    setStudentAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setPendingSelection(null);

    try {
      localStorage.removeItem(QUIZ_STORAGE_ANSWERS_KEY);
      localStorage.setItem(QUIZ_STORAGE_SUBMITTED_KEY, 'false');
    } catch {
      // Ignore
    }

    progressManager.resetQuizAttempt();
  };

  const answeredCount = Object.keys(studentAnswers).length;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4 font-sans text-slate-900 dark:text-white animate-page-enter">
      {/* Header Banner */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl pb-6 mb-6 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-slate-800 text-[#2563EB] dark:text-blue-300 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            <span>Knowledge Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Doubly Linked List Quiz (10 Questions)
            </span>
            {isSubmitted && (
              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-semibold">
                Completed
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter">
          Doubly Linked List Mastery Quiz
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Test your understanding of Doubly Linked Lists, bi-directional pointers, head and tail invariants, insertions, deletions, and dual-direction traversals.
        </p>

        {/* Question Index Tabs / Progress Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>
                Progress: <strong className="text-[#2563EB] dark:text-blue-300 font-mono">{answeredCount}</strong> / {totalQuestions} Answered
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

              let pillStyle = 'bg-slate-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#1E293B]';
              if (isCurrent) {
                pillStyle = 'bg-primary-gradient text-white border-transparent font-bold shadow-xs shadow-primary-gradient';
              } else if (isAnswered) {
                if (rec.isCorrect) {
                  pillStyle = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 font-semibold';
                } else {
                  pillStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-semibold';
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
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    } else {
                      setCurrentQuestionIndex(idx);
                    }
                  }}
                  className={`py-2 text-center text-xs font-mono rounded-lg border transition-all cursor-pointer ${pillStyle}`}
                  title={`Question ${idx + 1}`}
                >
                  <span>Q{idx + 1}</span>
                  {isAnswered && (
                    <span className="block text-[10px] leading-tight mt-0.5">
                      {rec.isCorrect ? '✓' : '✕'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* QUIZ COMPLETION VIEW (Displayed ONLY after Complete & Review is clicked) */}
      {isSubmitted ? (
        <div className="space-y-8">
          {/* 1. Existing Quiz Assessment Completed Section (Completely Unchanged) */}
          <div
            id="quiz-result-card"
            className="p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center text-center animate-editorial-scale transition-all"
          >
            {/* 1. Top Achievement Trophy Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#00A86B] dark:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/50 mx-auto mb-4 sm:mb-5">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
            </div>

            {/* 2. Achievement Badge */}
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#00A86B]/40 dark:border-emerald-500/40 bg-[#E6F8F0] dark:bg-emerald-950/60 text-[#008A54] dark:text-emerald-300 font-mono text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4">
              ★ OUTSTANDING MASTERY (GRADE A+) ★
            </div>

            {/* 3. Main Completion Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B192C] dark:text-white tracking-tight uppercase mb-3">
              QUIZ ASSESSMENT COMPLETED
            </h2>

            {/* 4. Supporting Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-normal mb-6 sm:mb-8">
              Incredible performance! You demonstrated thorough command of Stack operations and algorithmic constraints.
            </p>

            {/* 5. Large Highlighted Score Card */}
            <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-[#0B1120] border-2 border-blue-200/70 dark:border-slate-700 rounded-3xl shadow-[0_8px_30px_rgba(99,102,241,0.08)] dark:shadow-[0_8px_30px_rgba(37,99,235,0.15)] flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-[#2563EB] dark:text-blue-300 uppercase mb-2">
                FINAL HIGHLIGHTED SCORE
              </span>
              <div className="text-5xl sm:text-6xl font-black text-[#00A86B] dark:text-emerald-400 font-sans tracking-tight leading-none my-2">
                {percentage}%
              </div>
              <div className="mt-3 px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs sm:text-sm font-semibold">
                {score} / {totalQuestions} Questions Correct
              </div>
            </div>

            {/* 6. Summary Statistics Cards (CORRECT, INCORRECT, ACCURACY - STRICTLY NO XP) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl mx-auto">
              {/* CORRECT CARD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                  CORRECT
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#00A86B] dark:text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  {score}
                </span>
              </div>

              {/* INCORRECT CARD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                  INCORRECT
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-rose-500 dark:text-rose-400 font-mono">
                  {totalQuestions - score}
                </span>
              </div>

              {/* ACCURACY CARD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                  ACCURACY
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* 7. Action Buttons (Retake Quiz & Back to Home) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-8 w-full max-w-md mx-auto">
              {/* 1. Retake Quiz (Primary Action) */}
              <button
                id="btn-quiz-retake"
                type="button"
                onClick={handleResetQuiz}
                className="w-full sm:w-auto px-6 sm:px-7 py-3 rounded-2xl bg-primary-gradient hover:brightness-110 text-white font-sans text-sm font-semibold shadow-md shadow-primary-gradient transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                <span>Retake Quiz</span>
              </button>

              {/* 2. Back to Home (Secondary Action) */}
              <button
                id="btn-quiz-back-to-home"
                type="button"
                onClick={() => {
                  soundManager.playNav();
                  if (onNavigateToHome) {
                    onNavigateToHome();
                  }
                }}
                className="w-full sm:w-auto px-6 sm:px-7 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#0B1120] dark:hover:bg-[#1E293B] text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 font-sans text-sm font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 stroke-[2.2] text-[#2563EB] dark:text-blue-300" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>

          {/* 2. QUESTION OVERVIEW SECTION (Directly Below Completion Certificate) */}
          <div id="quiz-question-overview-section" className="space-y-6">
            {/* Section Heading */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <ListOrdered className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                <span>Full Question-by-Question Review</span>
              </h3>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold font-mono">
                {score} of {totalQuestions} Correct
              </span>
            </div>

            {/* 10 Question Review Cards (Sequential Order 01 to 10) */}
            <div className="space-y-5">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const rec = studentAnswers[q.id];
                const isCorrect = rec?.isCorrect || false;
                const cleanQuestionText = q.question.replace(/^\d+\.\s*/, '');
                const questionNumberStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

                return (
                  <div
                    key={q.id}
                    id={`quiz-review-card-${q.id}`}
                    className={`p-6 sm:p-7 rounded-[22px] sm:rounded-[24px] bg-white dark:bg-[#111827] transition-all shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${
                      isCorrect
                        ? 'border-2 border-emerald-400 dark:border-emerald-500/50'
                        : 'border-2 border-rose-300 dark:border-rose-500/50'
                    }`}
                  >
                    {/* Top Header: Badge + Identifier (Left) & Status Badge (Right) */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 bg-primary-gradient text-white rounded-full text-xs font-bold font-mono tracking-wide shadow-xs inline-flex items-center justify-center">
                          Question {questionNumberStr}
                        </span>
                        <span className="text-xs font-bold text-[#2E55FA] dark:text-[#C4B5FD] font-mono tracking-wider">
                          {q.techniqueCode}
                        </span>
                      </div>

                      <div>
                        {isCorrect ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6F8F0] dark:bg-emerald-950/60 border border-[#00A86B]/30 dark:border-emerald-500/30 text-[#008A54] dark:text-emerald-300 rounded-lg text-xs font-bold font-sans">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Correct</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold font-sans">
                            <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Incorrect</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question Statement */}
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3.5 mb-4 leading-snug break-words">
                      {cleanQuestionText}
                    </h4>

                    {/* Submission and Correct Answer Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      {/* Left: Your Submission */}
                      <div
                        className={`p-3.5 sm:p-4 rounded-xl border ${
                          isCorrect
                            ? 'bg-[#E8FAF0] dark:bg-emerald-950/40 border-[#A7F3D0] dark:border-emerald-500/30'
                            : 'bg-[#FEECEB] dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30'
                        }`}
                      >
                        <div
                          className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5 font-sans ${
                            isCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          YOUR SUBMISSION:
                        </div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 break-words">
                          {rec
                            ? `${String.fromCharCode(65 + rec.selectedOptionIndex)}: ${rec.selectedAnswerText}`
                            : 'No Answer Submitted'}
                        </div>
                      </div>

                      {/* Right: Correct Answer */}
                      <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B1120]">
                        <div className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                          CORRECT ANSWER:
                        </div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 break-words">
                          {String.fromCharCode(65 + q.correctIndex)}: {q.correctAnswerText}
                        </div>
                      </div>
                    </div>

                    {/* Technical Explanation Panel */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-2">
                        <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                        <span>Technical Explanation:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-3 font-normal">
                        {q.explanation}
                      </p>

                      {q.exampleSnippet && (
                        <div className="mb-3 p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-[#2563EB] dark:text-cyan-300 font-semibold">
                          Example: {q.exampleSnippet}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                        {q.targetChapterId && (
                          <button
                            onClick={() => {
                              soundManager.playNav();
                              onNavigateToTheory(q.targetChapterId);
                            }}
                            className="text-[#2563EB] dark:text-blue-400 hover:text-[#2563EB] dark:hover:text-blue-300 font-semibold text-xs inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Review in Theory Guide →</span>
                          </button>
                        )}
                        {q.targetLevelId && (
                          <button
                            onClick={() => {
                              soundManager.playNav();
                              onNavigateToQuest(q.targetLevelId);
                            }}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                          >
                            <Gamepad2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                            <span>Practice in Quest Level {q.targetLevelId} →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Taking the Quiz: Step-by-Step Question Flow (Questions 1 to 10) */
        <div className="space-y-6">
          <div
            key={currentQuestion.id}
            id={`quiz-step-card-${currentQuestion.id}`}
            className={`p-6 sm:p-8 border rounded-2xl transition-all bg-white dark:bg-[#111827] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] animate-chapter-switch ${
              isCurrentQuestionAnswered
                ? currentAnswerRecord?.isCorrect
                  ? 'border-emerald-300 dark:border-emerald-500/40 ring-1 ring-emerald-200 dark:ring-emerald-500/30'
                  : 'border-rose-300 dark:border-rose-500/40 ring-1 ring-rose-200 dark:ring-rose-500/30'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Question Header */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#2563EB] dark:bg-blue-600 text-white rounded-md text-xs font-bold font-mono shadow-xs">
                  Question {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs font-semibold text-[#2563EB] dark:text-cyan-300 font-mono">{currentQuestion.techniqueCode}</span>
              </div>

              {isCurrentQuestionAnswered && (
                <div>
                  {currentAnswerRecord?.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>
              )}
            </div>

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
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isCurrentQuestionAnswered && isSubmitted}
                    style={{ animationDelay: `${(optIdx + 1) * 60}ms` }}
                    className={`w-full p-4 text-left text-sm font-sans rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer animate-chapter-switch ${optStyle}`}
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

            {/* Answer Confirmation / Next Button Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  soundManager.playNav();
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className={`btn-modern-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentQuestionIndex === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {!isCurrentQuestionAnswered ? (
                currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    id="btn-submit-answer"
                    disabled={pendingSelection === null}
                    onClick={handleConfirmAnswer}
                    className={`btn-modern-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                      pendingSelection !== null ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed pointer-events-none'
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
                    className={`btn-modern-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                      pendingSelection !== null ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed pointer-events-none'
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
                  className="btn-modern-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-finish-quiz"
                  onClick={handleSubmitExamination}
                  className="btn-modern-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Complete & Review</span>
                </button>
              )}
            </div>

            {/* Technical Explanation Panel (visible once answered) */}
            {isCurrentQuestionAnswered && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] rounded-xl p-4 sm:p-5 text-xs">
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

                <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                  {currentQuestion.targetChapterId && (
                    <button
                      onClick={() => {
                        soundManager.playNav();
                        onNavigateToTheory(currentQuestion.targetChapterId);
                      }}
                      className="text-[#2563EB] dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review in Theory Guide →</span>
                    </button>
                  )}
                  {currentQuestion.targetLevelId && (
                    <button
                      onClick={() => {
                        soundManager.playNav();
                        onNavigateToQuest(currentQuestion.targetLevelId);
                      }}
                      className="text-slate-700 dark:text-slate-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                      <span>Practice in Quest Level {currentQuestion.targetLevelId} →</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
