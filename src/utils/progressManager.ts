import { ModuleRecord, ModuleStatus, UserProgressState } from '../types/game';
import { ScoringEvent, TopicDefinition, TopicScoreSummary } from '../types/scoring';

const STORAGE_KEY = 'hash_quest_field_notes_progress_v2';
const SCORING_EVENTS_KEY = 'algolearn_scoring_events_v2';
const PARTICIPANT_KEY = 'algolearn_participant_id';

// =========================================================================
// TOPIC DEFINITIONS (Multi-Topic Architecture: DLL, Queue, Graphs)
// =========================================================================
export const TOPIC_REGISTRY: Record<string, TopicDefinition> = {
  dll: {
    id: 'dll',
    name: 'Doubly Linked List',
    title: 'Doubly Linked List Learning Progress',
    scoreTitle: 'Doubly Linked List Topic Score',
    description: 'Master bidirectional pointers, node anatomy, constant-time boundary insertions, deletions, and memory management.',
    theoryModulesCount: 12,
    videoLessons: [
      { id: 'lesson-01', title: 'What is DLL? & DLL Insertion' },
      { id: 'lesson-02', title: 'Traversal & DLL Deletion' },
    ],
    gameTasks: [
      { id: 'dll-task-1-1', title: 'DLL Node Anatomy & Fields', levelId: 1 },
      { id: 'dll-task-1-2', title: 'Allocate Node on Dynamic Heap', levelId: 1 },
      { id: 'dll-task-1-3', title: 'Single Node Boundary State', levelId: 1 },
      { id: 'dll-task-2-1', title: 'Insert at Head (Prepend)', levelId: 2 },
      { id: 'dll-task-2-2', title: 'Insert at Tail (Append)', levelId: 2 },
      { id: 'dll-task-2-3', title: 'Insert at Middle (4-Pointer Wire)', levelId: 2 },
      { id: 'dll-task-3-1', title: 'Delete Head Boundary Node', levelId: 3 },
      { id: 'dll-task-3-2', title: 'Delete Tail Boundary Node', levelId: 3 },
      { id: 'dll-task-3-3', title: 'Delete Middle Node (Bypass)', levelId: 3 },
    ],
    quizQuestions: [
      { id: 1, title: 'DLL vs SLL Distinction' },
      { id: 2, title: 'Predecessor Pointer Advantage' },
      { id: 3, title: 'Single-Node Pointer Values' },
      { id: 4, title: 'Insertion at Head Sequence' },
      { id: 5, title: 'Insertion at Tail Sequence' },
      { id: 6, title: 'Middle Insertion 4-Pointer Wire' },
      { id: 7, title: 'Deletion at Head Boundary' },
      { id: 8, title: 'Middle Deletion Pointer Bypass' },
      { id: 9, title: 'Browser History & Real-World Use' },
      { id: 10, title: 'Memory Overhead & Cache Locality' },
    ],
  },
  queue: {
    id: 'queue',
    name: 'Queue',
    title: 'Queue Learning Progress',
    scoreTitle: 'Queue Topic Score',
    description: 'Master FIFO sequential pipelines, enqueue/dequeue mechanics, circular ring buffers, and scheduling architectures.',
    theoryModulesCount: 8,
    videoLessons: [
      { id: 'queue-vid-01', title: 'Queue Architecture & FIFO Mechanics' },
      { id: 'queue-vid-02', title: 'Circular Queue & Dynamic Ring Buffers' },
    ],
    gameTasks: [
      { id: 'queue-task-1', title: 'Enqueue Operation (Back of Queue)', levelId: 1 },
      { id: 'queue-task-2', title: 'Dequeue Operation (Front of Queue)', levelId: 1 },
      { id: 'queue-task-3', title: 'Peek & Boundary Checks', levelId: 1 },
      { id: 'queue-task-4', title: 'Circular Buffer Wrap-Around', levelId: 2 },
      { id: 'queue-task-5', title: 'Queue using Two Stacks', levelId: 2 },
      { id: 'queue-task-6', title: 'Customer Pipeline Simulation', levelId: 3 },
    ],
    quizQuestions: [
      { id: 1, title: 'FIFO Principle in Queue' },
      { id: 2, title: 'Enqueue Time Complexity' },
      { id: 3, title: 'Dequeue from Empty Queue' },
      { id: 4, title: 'Circular Array Modulo Math' },
      { id: 5, title: 'Queue using Two Stacks' },
      { id: 6, title: 'Breadth-First Search (BFS)' },
      { id: 7, title: 'Priority Queue vs Standard Queue' },
      { id: 8, title: 'Producer-Consumer Thread Buffer' },
    ],
  },
  graphs: {
    id: 'graphs',
    name: 'Graphs',
    title: 'Graphs Learning Progress',
    scoreTitle: 'Graphs Topic Score',
    description: 'Explore vertex-edge topologies, adjacency representations, and graph traversal algorithms.',
    theoryModulesCount: 10,
    videoLessons: [
      { id: 'graphs-vid-01', title: 'Graph Representations: Matrix vs List' },
      { id: 'graphs-vid-02', title: 'BFS & DFS Traversal Algorithms' },
    ],
    gameTasks: [
      { id: 'graphs-task-1', title: 'Build Adjacency Matrix', levelId: 1 },
      { id: 'graphs-task-2', title: 'Build Adjacency List', levelId: 1 },
      { id: 'graphs-task-3', title: 'Breadth-First Search (BFS)', levelId: 2 },
      { id: 'graphs-task-4', title: 'Depth-First Search (DFS)', levelId: 2 },
      { id: 'graphs-task-5', title: 'Detect Cycle in Directed Graph', levelId: 2 },
      { id: 'graphs-task-6', title: 'Dijkstra Shortest Path', levelId: 3 },
    ],
    quizQuestions: [
      { id: 1, title: 'Graph Representation Space Complexity' },
      { id: 2, title: 'BFS Queue Mechanism' },
      { id: 3, title: 'DFS Stack Mechanism' },
      { id: 4, title: 'Topological Sort Applicability' },
      { id: 5, title: 'Dijkstra Priority Queue' },
      { id: 6, title: 'Bipartite Graph Verification' },
      { id: 7, title: 'Connected Components Count' },
      { id: 8, title: 'Spanning Tree Edge Count' },
    ],
  },
};

export const FIELD_NOTES_MODULES: Omit<ModuleRecord, 'status' | 'progressPercent'>[] = [
  {
    id: 'fn-01-basics',
    number: '01',
    code: 'FN-01',
    title: 'WHAT IS A DOUBLY LINKED LIST? & NODE ANATOMY',
    category: 'FOUNDATION',
    description: 'Master the core DLL architecture: node structure with data payload, prev pointer, next pointer, and bi-directional navigation capability.',
    criteriaDescription: 'Read the foundation theory and inspect the interactive DLL node anatomy diagram.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-01',
  },
  {
    id: 'fn-02-modulo',
    number: '02',
    code: 'FN-02',
    title: 'NODE STRUCTURE & MEMORY ALLOCATION',
    category: 'FOUNDATION',
    description: 'Understand dynamic heap memory allocation, struct/class representation across C++/Java/Python, and memory pointer layouts.',
    criteriaDescription: 'Study the memory layout calculator and node allocation across programming languages.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-02',
  },
  {
    id: 'fn-03-table',
    number: '03',
    code: 'FN-03',
    title: 'HEAD & TAIL BOUNDARY POINTERS',
    category: 'FOUNDATION',
    description: 'Track the list boundary endpoints: head.prev = null and tail.next = null, empty list state, and single-node list state.',
    criteriaDescription: 'Examine head and tail pointer transitions across edge cases.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-03',
  },
  {
    id: 'fn-04-lifecycle',
    number: '04',
    code: 'FN-04',
    title: 'BI-DIRECTIONAL TRAVERSAL PIPELINE',
    category: 'FOUNDATION',
    description: 'Walk forward from head to tail using curr = curr.next and backward from tail to head using curr = curr.prev in O(N) time.',
    criteriaDescription: 'Run the interactive forward and backward traversal stepper.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-04',
  },
  {
    id: 'fn-05-collision',
    number: '05',
    code: 'FN-05',
    title: 'INSERTION AT HEAD (BEGINNING)',
    category: 'TECHNIQUE',
    description: 'Wire a new node at the beginning in O(1) time: newNode.next = head; head.prev = newNode; head = newNode.',
    criteriaDescription: 'Simulate head node creation and pointer rewiring.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-05',
  },
  {
    id: 'fn-06-chaining',
    number: '06',
    code: 'FN-06',
    title: 'INSERTION AT TAIL (END)',
    category: 'TECHNIQUE',
    description: 'Wire a new node at the end in O(1) time: newNode.prev = tail; tail.next = newNode; tail = newNode.',
    criteriaDescription: 'Master constant-time tail insertion and pointer updates.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-06',
  },
  {
    id: 'fn-07-linear',
    number: '07',
    code: 'FN-07',
    title: 'INSERTION AT MIDDLE POSITION (4-POINTER REWIRE)',
    category: 'TECHNIQUE',
    description: 'Insert between existing nodes by updating 4 pointers without breaking the bi-directional chain.',
    criteriaDescription: 'Master the 4-pointer insertion sequence at a specified index.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-07',
  },
  {
    id: 'fn-08-quadratic',
    number: '08',
    code: 'FN-08',
    title: 'DELETION AT HEAD & TAIL',
    category: 'TECHNIQUE',
    description: 'Remove boundary nodes in O(1) time and update pointers: head = head.next; head.prev = null; and tail = tail.prev; tail.next = null.',
    criteriaDescription: 'Master constant-time boundary node deletion and edge case handling.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-08',
  },
  {
    id: 'fn-09-double',
    number: '09',
    code: 'FN-09',
    title: 'DELETION OF A MIDDLE NODE (BYPASS REWIRING)',
    category: 'TECHNIQUE',
    description: 'Bypass target node in O(1) pointer updates: target.prev.next = target.next; target.next.prev = target.prev; and free memory.',
    criteriaDescription: 'Master middle node removal and pointer bypass reconnection.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-09',
  },
  {
    id: 'fn-10-realworld',
    number: '10',
    code: 'FN-10',
    title: 'REAL-WORLD APPLICATIONS (LRU CACHE & BROWSER)',
    category: 'ANALYSIS',
    description: 'Explore production use cases: Browser forward/back history, Music playlists, Undo/Redo buffers, and LRU Cache.',
    criteriaDescription: 'Study real-world software architecture leveraging Doubly Linked Lists.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-10',
  },
  {
    id: 'fn-11-advantages',
    number: '11',
    code: 'FN-11',
    title: 'ASYMPTOTIC COMPLEXITY & CORE ADVANTAGES',
    category: 'ANALYSIS',
    description: 'Deep dive into time complexity: O(1) insertion/deletion at ends, bi-directional flexibility, dynamic sizing vs arrays.',
    criteriaDescription: 'Analyze time complexities, space requirements, and performance advantages.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-11',
  },
  {
    id: 'fn-12-tradeoffs',
    number: '12',
    code: 'FN-12',
    title: 'MEMORY OVERHEAD & TRADE-OFFS',
    category: 'ANALYSIS',
    description: 'Understand extra pointer memory consumption (2 pointers per node), lack of O(1) random indexing, and CPU cache locality limits.',
    criteriaDescription: 'Analyze memory overhead, cache miss rates, and trade-offs against Singly Linked Lists and Arrays.',
    targetTab: 'THEORY',
    targetChapterId: 'theory-12',
  },
];

const INITIAL_PROGRESS: UserProgressState = {
  version: 2,
  modules: {
    'fn-01-basics': 'NOT_STARTED',
    'fn-02-modulo': 'NOT_STARTED',
    'fn-03-table': 'NOT_STARTED',
    'fn-04-lifecycle': 'NOT_STARTED',
    'fn-05-collision': 'NOT_STARTED',
    'fn-06-chaining': 'NOT_STARTED',
    'fn-07-linear': 'NOT_STARTED',
    'fn-08-quadratic': 'NOT_STARTED',
    'fn-09-double': 'NOT_STARTED',
    'fn-10-realworld': 'NOT_STARTED',
    'fn-11-advantages': 'NOT_STARTED',
    'fn-12-tradeoffs': 'NOT_STARTED',
  },
  moduleProgress: {},
  completedTheoryChapters: [],
  currentTheoryChapterId: 'theory-01',
  levelCompletedKeys: {},
  levelsCompleted: [],
  levelsMastered: [],
  quizScores: {},
  quizSubmitted: false,
  quizFinalScore: 0,
  masterChallengesCompleted: [],
  sandboxOperationsCount: 0,
  totalScore: 0,
  streak: 0,
  currentActiveModuleId: 'fn-01-basics',
  lastActiveTimestamp: Date.now(),
  completedVideos: [],
  hasCelebrated100Percent: false,
};

export const THEORY_ID_MAP: Record<string, string> = {
  'what-is-dll': 'theory-01',
  'node-structure': 'theory-02',
  'head-tail-pointers': 'theory-03',
  'bidirectional-traversal': 'theory-04',
  'insert-head': 'theory-05',
  'insert-tail': 'theory-06',
  'insert-position': 'theory-07',
  'delete-head-tail': 'theory-08',
  'delete-node': 'theory-09',
  'real-world-applications': 'theory-10',
  'core-advantages': 'theory-11',
  'limitations-tradeoffs': 'theory-12',
  'what-is-hashing': 'theory-01',
  'hash-function': 'theory-02',
  'hash-table': 'theory-03',
  'hashing-lifecycle': 'theory-04',
  'what-is-a-collision': 'theory-05',
  'separate-chaining': 'theory-06',
  'linear-probing': 'theory-07',
  'quadratic-probing': 'theory-08',
  'double-hashing': 'theory-09',
  'load-factor': 'theory-08',
  '01': 'theory-01',
  '02': 'theory-02',
  '03': 'theory-03',
  '04': 'theory-04',
  '05': 'theory-05',
  '06': 'theory-06',
  '07': 'theory-07',
  '08': 'theory-08',
  '09': 'theory-09',
  '10': 'theory-10',
  '11': 'theory-11',
  '12': 'theory-12',
};

export const normalizeTheoryChapterId = (idOrSlug: string): string => {
  if (!idOrSlug) return 'theory-01';
  if (idOrSlug.startsWith('theory-')) return idOrSlug;
  return THEORY_ID_MAP[idOrSlug] || idOrSlug;
};

type ProgressListener = (state: UserProgressState) => void;

class ProgressManager {
  private state: UserProgressState;
  private scoringEvents: ScoringEvent[] = [];
  private eventKeySet: Set<string> = new Set();
  private participantId: string;
  private activeTopicId: string = 'dll';
  private listeners: Set<ProgressListener> = new Set();

  constructor() {
    this.participantId = this.loadParticipantId();
    this.scoringEvents = this.loadScoringEvents();
    this.scoringEvents.forEach((ev) => {
      this.eventKeySet.add(this.getEventKey(ev));
    });
    this.state = this.loadState();
    this.reconcileLegacyStateWithScoringEvents();
  }

  private loadParticipantId(): string {
    if (typeof window === 'undefined') return 'student-default';
    try {
      let id = localStorage.getItem(PARTICIPANT_KEY);
      if (!id) {
        id = 'student_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem(PARTICIPANT_KEY, id);
      }
      return id;
    } catch {
      return 'student-default';
    }
  }

  public getParticipantId(): string {
    return this.participantId;
  }

  private getEventKey(ev: Omit<ScoringEvent, 'id' | 'timestamp'>): string {
    return `${ev.participantId}:${ev.topicId}:${ev.activityType}:${ev.activityId}:${ev.reason}:${ev.attemptId || 'default'}`;
  }

  private loadScoringEvents(): ScoringEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(SCORING_EVENTS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveScoringEvents() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SCORING_EVENTS_KEY, JSON.stringify(this.scoringEvents));
    } catch {
      // Ignore
    }
  }

  private loadState(): UserProgressState {
    if (typeof window === 'undefined') return INITIAL_PROGRESS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return INITIAL_PROGRESS;
      const parsed = JSON.parse(stored);
      if (parsed && parsed.version === 2) {
        return {
          ...INITIAL_PROGRESS,
          ...parsed,
          completedTheoryChapters: Array.isArray(parsed.completedTheoryChapters)
            ? Array.from(new Set(parsed.completedTheoryChapters.map(normalizeTheoryChapterId)))
            : [],
          currentTheoryChapterId: parsed.currentTheoryChapterId
            ? normalizeTheoryChapterId(parsed.currentTheoryChapterId)
            : 'theory-01',
          completedVideos: Array.isArray(parsed.completedVideos)
            ? Array.from(new Set(parsed.completedVideos))
            : [],
          levelsCompleted: Array.isArray(parsed.levelsCompleted)
            ? Array.from(new Set(parsed.levelsCompleted))
            : [],
        };
      }
      return INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      this.state.lastActiveTimestamp = Date.now();
      // Keep totalScore synced to the normalized topic score (max 100)
      const topicSummary = this.getTopicScoreSummary(this.activeTopicId);
      this.state.totalScore = Math.round(topicSummary.earnedScore);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch {
      // Ignore write errors
    }
  }

  /**
   * Automatically reconcile pre-existing completed activities from previous sessions
   * so students don't lose achievements, while maintaining single-award discipline.
   */
  private reconcileLegacyStateWithScoringEvents() {
    // 1. Existing completed videos -> +8 raw
    if (Array.isArray(this.state.completedVideos)) {
      this.state.completedVideos.forEach((vidId) => {
        this.recordScoringEvent({
          participantId: this.participantId,
          topicId: 'dll',
          activityType: 'VISUALIZE',
          activityId: vidId,
          scoreDelta: 8,
          reason: 'VIDEO_COMPLETED',
        });
      });
    }

    // 2. Existing game tasks from localStorage -> +6 raw each
    if (typeof window !== 'undefined') {
      try {
        const savedTasks = localStorage.getItem('dll_master_game_completed_tasks_v4');
        if (savedTasks) {
          const taskIds: string[] = JSON.parse(savedTasks);
          taskIds.forEach((tId) => {
            this.recordScoringEvent({
              participantId: this.participantId,
              topicId: 'dll',
              activityType: 'GAME',
              activityId: tId,
              scoreDelta: 6,
              reason: 'GAME_TASK_COMPLETED',
            });
          });
        }
      } catch {
        // ignore
      }
    }

    // 3. Existing quiz scores if submitted
    if (this.state.quizSubmitted && this.state.quizScores) {
      Object.entries(this.state.quizScores).forEach(([qIdStr, optIdx]) => {
        const qId = parseInt(qIdStr, 10);
        // We record this event if not present
        this.recordScoringEvent({
          participantId: this.participantId,
          topicId: 'dll',
          activityType: 'QUIZ',
          activityId: String(qId),
          attemptId: 'legacy_attempt',
          scoreDelta: 3, // Legacy positive assumption if score was 100
          reason: 'QUIZ_CORRECT',
          metadata: { optionIndex: optIdx },
        });
      });
    }
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const copy = this.getState();
    this.listeners.forEach((fn) => fn(copy));
  }

  public getState(): UserProgressState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public setActiveTopic(topicId: string) {
    if (TOPIC_REGISTRY[topicId]) {
      this.activeTopicId = topicId;
      this.notifyListeners();
    }
  }

  public getActiveTopicId(): string {
    return this.activeTopicId;
  }

  // =========================================================================
  // SCORING EVENT RECORDING ENGINE (Idempotent & Deduplication-Safe)
  // =========================================================================
  public recordScoringEvent(
    eventData: Omit<ScoringEvent, 'id' | 'timestamp'>
  ): boolean {
    const key = this.getEventKey(eventData);
    if (this.eventKeySet.has(key)) {
      return false; // Prevent duplicate reward or deduction
    }

    const newEvent: ScoringEvent = {
      ...eventData,
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };

    this.scoringEvents.push(newEvent);
    this.eventKeySet.add(key);
    this.saveScoringEvents();
    this.saveState();
    return true;
  }

  public getScoringEvents(topicId?: string): ScoringEvent[] {
    if (!topicId) return [...this.scoringEvents];
    return this.scoringEvents.filter((ev) => ev.topicId === topicId);
  }

  // =========================================================================
  // TOPIC SCORE NORMALIZATION & SUMMARY ENGINE (Max 100 Points Per Topic)
  // =========================================================================
  public getTopicScoreSummary(topicId: string = 'dll'): TopicScoreSummary {
    const topic = TOPIC_REGISTRY[topicId] || TOPIC_REGISTRY['dll'];
    const events = this.getScoringEvents(topic.id);

    // 1. Eligible counts
    const numVideos = topic.videoLessons.length;
    const numGameTasks = topic.gameTasks.length;
    const numQuizQuestions = topic.quizQuestions.length;

    // 2. Section Maximum Raw Positive Scores:
    // Game: +6 each, Visualize: +8 each, Quiz: +3 each
    const videoMaxRaw = numVideos * 8;
    const gameMaxRaw = numGameTasks * 6;
    const quizMaxRaw = numQuizQuestions * 3;
    const topicMaxRaw = videoMaxRaw + gameMaxRaw + quizMaxRaw;

    // 3. Section Point Budgets out of 100 (Proportional):
    // Budget = 100 * (sectionMaxRaw / topicMaxRaw)
    let videoBudget = 0;
    let gameBudget = 0;
    let quizBudget = 0;

    if (topicMaxRaw > 0) {
      videoBudget = (videoMaxRaw / topicMaxRaw) * 100;
      gameBudget = (gameMaxRaw / topicMaxRaw) * 100;
      quizBudget = (quizMaxRaw / topicMaxRaw) * 100;

      // Adjust rounding precision so sum of the 3 competition sections is EXACTLY 100
      const totalBudgetCalculated = videoBudget + gameBudget + quizBudget;
      const roundingDiff = 100 - totalBudgetCalculated;
      if (Math.abs(roundingDiff) > 0.0001) {
        quizBudget += roundingDiff;
      }
    }

    // 4. Calculate Raw Earned & Deductions from Recorded Events:
    // --- LEARN / THEORY ---
    // (Theory awards 0 competition points)
    const theoryCompletedCount =
      topic.id === 'dll'
        ? Math.min(topic.theoryModulesCount, (this.state.completedTheoryChapters || []).length)
        : 0;

    // --- VISUALIZE ---
    // Raw +8 for each fully completed video
    const completedVideosForTopic = Array.from(
      new Set(
        events
          .filter((ev) => ev.activityType === 'VISUALIZE' && ev.reason === 'VIDEO_COMPLETED')
          .map((ev) => ev.activityId)
      )
    );
    const videoCompletedCount = completedVideosForTopic.length;
    const videoEarnedRaw = videoCompletedCount * 8;
    const videoDeductions = 0;
    const videoNetRaw = Math.max(0, Math.min(videoMaxRaw, videoEarnedRaw));
    const videoEarnedPoints =
      videoMaxRaw > 0 ? (videoNetRaw / videoMaxRaw) * videoBudget : 0;

    // --- GAME ---
    // Raw +6 for each completed task, -1 for hints, -2 for guided solve steps
    const completedTasksForTopic = Array.from(
      new Set(
        events
          .filter((ev) => ev.activityType === 'GAME' && ev.reason === 'GAME_TASK_COMPLETED')
          .map((ev) => ev.activityId)
      )
    );
    const gameCompletedCount = completedTasksForTopic.length;
    const gameEarnedRaw = gameCompletedCount * 6;

    // Game deductions:
    const hintEvents = events.filter((ev) => ev.activityType === 'GAME' && ev.reason === 'HINT_USED');
    const guidedEvents = events.filter((ev) => ev.activityType === 'GAME' && ev.reason === 'GUIDED_SOLVE_STEP');
    const gameDeductions = hintEvents.length * 1 + guidedEvents.length * 2;

    const gameNetRaw = Math.max(0, Math.min(gameMaxRaw, gameEarnedRaw - gameDeductions));
    const gameEarnedPoints =
      gameMaxRaw > 0 ? (gameNetRaw / gameMaxRaw) * gameBudget : 0;

    // --- QUIZ ---
    // Raw +3 for correct, -1 for incorrect, 0 for timeout
    const quizEvents = events.filter((ev) => ev.activityType === 'QUIZ');
    const correctQuizEvents = quizEvents.filter((ev) => ev.reason === 'QUIZ_CORRECT');
    const incorrectQuizEvents = quizEvents.filter((ev) => ev.reason === 'QUIZ_INCORRECT');
    const timeoutQuizEvents = quizEvents.filter((ev) => ev.reason === 'QUIZ_TIMEOUT');

    const quizEarnedRaw = correctQuizEvents.length * 3;
    const quizDeductions = incorrectQuizEvents.length * 1; // -1 raw point deduction
    const quizNetRaw = Math.max(0, Math.min(quizMaxRaw, quizEarnedRaw - quizDeductions));
    const quizEarnedPoints =
      quizMaxRaw > 0 ? (quizNetRaw / quizMaxRaw) * quizBudget : 0;

    const quizCompletedCount = Array.from(new Set(quizEvents.map((ev) => ev.activityId))).length;

    // Overall topic competition score (clamped between 0 and 100)
    const earnedScore = Math.max(
      0,
      Math.min(100, videoEarnedPoints + gameEarnedPoints + quizEarnedPoints)
    );

    // Dynamic completion percentage:
    // Theory modules + Videos + Game tasks + Quiz questions
    const totalActivities =
      topic.theoryModulesCount + numVideos + numGameTasks + numQuizQuestions;
    const completedActivities =
      theoryCompletedCount + videoCompletedCount + gameCompletedCount + quizCompletedCount;
    const completionPercentage =
      totalActivities > 0
        ? Math.min(100, Math.round((completedActivities / totalActivities) * 100))
        : 0;

    return {
      topicId: topic.id,
      topicName: topic.name,
      topicTitle: topic.title,
      topicScoreTitle: topic.scoreTitle,
      description: topic.description,
      totalModules: topic.theoryModulesCount,
      completedModules: theoryCompletedCount,
      completionPercentage,
      maxRawScore: topicMaxRaw,
      netRawScore: videoNetRaw + gameNetRaw + quizNetRaw,
      totalBudget: 100,
      earnedScore,
      sections: {
        learn: {
          section: 'learn',
          label: 'Learn',
          eligibleCount: topic.theoryModulesCount,
          completedCount: theoryCompletedCount,
          maxRawScore: 0,
          earnedRawScore: 0,
          rawDeductions: 0,
          netRawScore: 0,
          pointBudget: 0,
          earnedPoints: 0,
          isCompletionOnly: true,
        },
        visualize: {
          section: 'visualize',
          label: 'Visualize',
          eligibleCount: numVideos,
          completedCount: videoCompletedCount,
          maxRawScore: videoMaxRaw,
          earnedRawScore: videoEarnedRaw,
          rawDeductions: videoDeductions,
          netRawScore: videoNetRaw,
          pointBudget: videoBudget,
          earnedPoints: videoEarnedPoints,
          isCompletionOnly: false,
        },
        game: {
          section: 'game',
          label: 'Game',
          eligibleCount: numGameTasks,
          completedCount: gameCompletedCount,
          maxRawScore: gameMaxRaw,
          earnedRawScore: gameEarnedRaw,
          rawDeductions: gameDeductions,
          netRawScore: gameNetRaw,
          pointBudget: gameBudget,
          earnedPoints: gameEarnedPoints,
          isCompletionOnly: false,
        },
        quiz: {
          section: 'quiz',
          label: 'Quiz',
          eligibleCount: numQuizQuestions,
          completedCount: quizCompletedCount,
          maxRawScore: quizMaxRaw,
          earnedRawScore: quizEarnedRaw,
          rawDeductions: quizDeductions,
          netRawScore: quizNetRaw,
          pointBudget: quizBudget,
          earnedPoints: quizEarnedPoints,
          isCompletionOnly: false,
        },
      },
      events,
    };
  }

  // =========================================================================
  // ACTIVITY SCORING HELPERS
  // =========================================================================

  /**
   * Complete Video: +8 raw points awarded ONLY once upon actual full video finish.
   */
  public completeVideo(videoId: string, topicId: string = 'dll'): boolean {
    if (!this.state.completedVideos) {
      this.state.completedVideos = [];
    }
    if (!this.state.completedVideos.includes(videoId)) {
      this.state.completedVideos.push(videoId);
    }

    const recorded = this.recordScoringEvent({
      participantId: this.participantId,
      topicId,
      activityType: 'VISUALIZE',
      activityId: videoId,
      scoreDelta: 8,
      reason: 'VIDEO_COMPLETED',
    });

    this.saveState();
    return recorded;
  }

  public isVideoCompleted(videoId: string): boolean {
    const list = this.state.completedVideos || [];
    return list.includes(videoId);
  }

  /**
   * Complete Game Task: +6 raw points awarded ONLY once per unique task.
   */
  public recordGameTaskCompleted(
    topicId: string,
    taskId: string,
    attemptId?: string
  ): boolean {
    const recorded = this.recordScoringEvent({
      participantId: this.participantId,
      topicId,
      activityType: 'GAME',
      activityId: taskId,
      attemptId,
      scoreDelta: 6,
      reason: 'GAME_TASK_COMPLETED',
    });

    if (recorded) {
      this.saveState();
    }
    return recorded;
  }

  /**
   * Hint Used: −1 raw point deduction applied to Game section.
   * Deducted once per unique task/hint key to prevent duplicate deductions on re-render.
   */
  public recordHintUsed(
    topicId: string,
    taskId: string,
    hintId: string = 'default'
  ): boolean {
    const recorded = this.recordScoringEvent({
      participantId: this.participantId,
      topicId,
      activityType: 'GAME',
      activityId: taskId,
      attemptId: `hint_${hintId}`,
      scoreDelta: -1,
      reason: 'HINT_USED',
    });

    if (recorded) {
      this.saveState();
    }
    return recorded;
  }

  /**
   * Guided Solve Step Used: −2 raw points deduction applied to Game section.
   * Deducted once per unique task step index to prevent duplicate deductions.
   */
  public recordGuidedSolveStepUsed(
    topicId: string,
    taskId: string,
    stepNumber: number
  ): boolean {
    const recorded = this.recordScoringEvent({
      participantId: this.participantId,
      topicId,
      activityType: 'GAME',
      activityId: taskId,
      attemptId: `step_${stepNumber}`,
      scoreDelta: -2,
      reason: 'GUIDED_SOLVE_STEP',
      metadata: { stepNumber },
    });

    if (recorded) {
      this.saveState();
    }
    return recorded;
  }

  /**
   * Quiz Question Answer:
   * - Correct: +3 raw points
   * - Incorrect: −1 raw point
   * - Timeout: 0 points (no penalty, no reward)
   * Prevents submitting the same question multiple times in the same attempt.
   */
  public recordQuizQuestionAnswer(
    topicId: string,
    questionId: number,
    selectedOptionIndex: number,
    isCorrect: boolean,
    isTimeout: boolean,
    attemptId: string = 'attempt_1'
  ): boolean {
    const scoreDelta = isTimeout ? 0 : isCorrect ? 3 : -1;
    const reason = isTimeout
      ? 'QUIZ_TIMEOUT'
      : isCorrect
      ? 'QUIZ_CORRECT'
      : 'QUIZ_INCORRECT';

    const recorded = this.recordScoringEvent({
      participantId: this.participantId,
      topicId,
      activityType: 'QUIZ',
      activityId: String(questionId),
      attemptId,
      scoreDelta,
      reason,
      metadata: {
        selectedOptionIndex,
        isCorrect,
        isTimeout,
      },
    });

    if (recorded) {
      if (!this.state.quizScores) {
        this.state.quizScores = {};
      }
      this.state.quizScores[questionId] = selectedOptionIndex;
      this.saveState();
    }

    return recorded;
  }

  // =========================================================================
  // EXISTING METRICS (Preserved for compatibility)
  // =========================================================================
  public getTheoryStats() {
    const list = Array.isArray(this.state.completedTheoryChapters)
      ? Array.from(new Set(this.state.completedTheoryChapters))
      : [];
    const completed = Math.min(12, list.length);
    const total = 12;
    const percentage = Math.round((completed / total) * 100);
    return {
      total,
      completed,
      percentage,
      isComplete: completed >= total,
      completedIds: [...list],
      currentChapterId: this.state.currentTheoryChapterId,
    };
  }

  public getVideoStats() {
    const list = Array.isArray(this.state.completedVideos) ? this.state.completedVideos : [];
    const isIntroCompleted = list.includes('lesson-01') || list.includes('introduction');
    const isCollisionCompleted = list.includes('lesson-02') || list.includes('collision');
    const completed = (isIntroCompleted ? 1 : 0) + (isCollisionCompleted ? 1 : 0);
    const total = 2;
    const percentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percentage,
      isIntroCompleted,
      isCollisionCompleted,
      isComplete: completed >= total,
      completedVideos: [...list],
    };
  }

  public getGameStats() {
    let rawList = Array.isArray(this.state.levelsCompleted) ? [...this.state.levelsCompleted] : [];

    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dll_master_game_completed_tasks_v4');
        if (saved) {
          const taskIds: string[] = JSON.parse(saved);
          const level1Done = ['dll-task-1-1', 'dll-task-1-2', 'dll-task-1-3'].every((id) => taskIds.includes(id));
          const level2Done = ['dll-task-2-1', 'dll-task-2-2', 'dll-task-2-3'].every((id) => taskIds.includes(id));
          const level3Done = ['dll-task-3-1', 'dll-task-3-2', 'dll-task-3-3'].every((id) => taskIds.includes(id));

          if (level1Done && !rawList.includes(1)) rawList.push(1);
          if (level2Done && !rawList.includes(2)) rawList.push(2);
          if (level3Done && !rawList.includes(3)) rawList.push(3);
        }
      }
    } catch {
      // ignore
    }

    const completedList = Array.from(new Set(rawList.filter((lvl) => lvl >= 1 && lvl <= 3)));
    const completed = Math.min(3, completedList.length);
    const total = 3;
    const percentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percentage,
      isComplete: completed >= total,
      completedLevels: [...completedList],
    };
  }

  public getQuizStats() {
    const isSubmitted = Boolean(this.state.quizSubmitted);
    const completed = isSubmitted ? 1 : 0;
    const total = 1;
    const percentage = isSubmitted ? 100 : 0;

    return {
      total,
      completed,
      percentage,
      isSubmitted,
      finalScore: this.state.quizFinalScore || 0,
      isComplete: isSubmitted,
    };
  }

  public getModules(): ModuleRecord[] {
    const theoryDone = this.state.completedTheoryChapters || [];
    const levelsDone = this.state.levelsCompleted || [];

    const moduleMapping: Record<string, string> = {
      'fn-01-basics': 'theory-01',
      'fn-02-modulo': 'theory-02',
      'fn-03-table': 'theory-03',
      'fn-04-lifecycle': 'theory-04',
      'fn-05-collision': 'theory-05',
      'fn-06-chaining': 'theory-06',
      'fn-07-linear': 'theory-07',
      'fn-08-quadratic': 'theory-08',
      'fn-09-double': 'theory-09',
      'fn-10-realworld': 'theory-10',
      'fn-11-advantages': 'theory-11',
      'fn-12-tradeoffs': 'theory-12',
    };

    return FIELD_NOTES_MODULES.map((m) => {
      let status = this.state.modules[m.id] || 'NOT_STARTED';
      let progressPercent = this.state.moduleProgress[m.id] || 0;
      const chapterId = moduleMapping[m.id];

      if (chapterId && theoryDone.includes(chapterId)) {
        status = 'COMPLETED';
        progressPercent = 100;
      }

      if (m.id === 'fn-06-chaining' && levelsDone.includes(2)) {
        status = this.state.levelsMastered.includes(2) ? 'MASTERED' : 'COMPLETED';
        progressPercent = 100;
      } else if (m.id === 'fn-07-linear' && levelsDone.includes(3)) {
        status = this.state.levelsMastered.includes(3) ? 'MASTERED' : 'COMPLETED';
        progressPercent = 100;
      } else if (m.id === 'fn-08-quadratic' && levelsDone.includes(4)) {
        status = this.state.levelsMastered.includes(4) ? 'MASTERED' : 'COMPLETED';
        progressPercent = 100;
      } else if (m.id === 'fn-09-double' && levelsDone.includes(5)) {
        status = this.state.levelsMastered.includes(5) ? 'MASTERED' : 'COMPLETED';
        progressPercent = 100;
      }

      if (status === 'COMPLETED' || status === 'MASTERED') {
        progressPercent = 100;
      } else if (status === 'IN_PROGRESS' && progressPercent === 0) {
        progressPercent = 50;
      }

      return {
        ...m,
        status,
        progressPercent,
      };
    });
  }

  public getStats() {
    const summary = this.getTopicScoreSummary(this.activeTopicId);
    const modules = this.getModules();
    const mastered = modules.filter((m) => m.status === 'MASTERED').length;
    const currentUnfinished =
      modules.find((m) => m.status === 'IN_PROGRESS' || m.status === 'NOT_STARTED') ||
      modules[modules.length - 1];

    return {
      total: summary.totalModules + summary.sections.visualize.eligibleCount + summary.sections.game.eligibleCount + summary.sections.quiz.eligibleCount,
      completed: summary.completedModules + summary.sections.visualize.completedCount + summary.sections.game.completedCount + summary.sections.quiz.completedCount,
      mastered,
      percentage: summary.completionPercentage,
      isAllComplete: summary.completionPercentage === 100,
      nextModule: currentUnfinished,
      theory: this.getTheoryStats(),
      video: this.getVideoStats(),
      game: this.getGameStats(),
      quiz: this.getQuizStats(),
    };
  }

  public isTheoryChapterCompleted(chapterId: string): boolean {
    const normalized = normalizeTheoryChapterId(chapterId);
    return (this.state.completedTheoryChapters || []).includes(normalized);
  }

  public completeTheoryChapter(chapterId: string): boolean {
    const normalized = normalizeTheoryChapterId(chapterId);
    if (!this.state.completedTheoryChapters) {
      this.state.completedTheoryChapters = [];
    }
    if (this.state.completedTheoryChapters.includes(normalized)) {
      return false;
    }

    this.state.completedTheoryChapters.push(normalized);
    this.state.currentTheoryChapterId = normalized;

    const chapterToModuleMap: Record<string, string> = {
      'theory-01': 'fn-01-basics',
      'theory-02': 'fn-02-modulo',
      'theory-03': 'fn-03-table',
      'theory-04': 'fn-04-lifecycle',
      'theory-05': 'fn-05-collision',
      'theory-06': 'fn-06-chaining',
      'theory-07': 'fn-07-linear',
      'theory-08': 'fn-08-quadratic',
      'theory-09': 'fn-09-double',
      'theory-10': 'fn-10-realworld',
      'theory-11': 'fn-11-advantages',
      'theory-12': 'fn-12-tradeoffs',
    };

    const targetModuleId = chapterToModuleMap[normalized];
    if (targetModuleId) {
      this.completeModule(targetModuleId);
    }

    // Theory completion counts toward overall progress, awards 0 competition points
    this.recordScoringEvent({
      participantId: this.participantId,
      topicId: 'dll',
      activityType: 'LEARN',
      activityId: normalized,
      scoreDelta: 0,
      reason: 'THEORY_COMPLETED',
    });

    this.saveState();
    return true;
  }

  public setCurrentTheoryChapter(chapterId: string) {
    const normalized = normalizeTheoryChapterId(chapterId);
    this.state.currentTheoryChapterId = normalized;
    this.saveState();
  }

  public startModule(moduleId: string) {
    if (!this.state.modules[moduleId] || this.state.modules[moduleId] === 'NOT_STARTED') {
      this.state.modules[moduleId] = 'IN_PROGRESS';
      this.state.moduleProgress[moduleId] = Math.max(this.state.moduleProgress[moduleId] || 0, 25);
      this.state.currentActiveModuleId = moduleId;
      this.saveState();
    }
  }

  public updateModuleProgress(moduleId: string, percent: number) {
    if (this.state.modules[moduleId] !== 'COMPLETED' && this.state.modules[moduleId] !== 'MASTERED') {
      this.state.modules[moduleId] = 'IN_PROGRESS';
      this.state.moduleProgress[moduleId] = Math.min(
        100,
        Math.max(this.state.moduleProgress[moduleId] || 0, percent)
      );
      this.state.currentActiveModuleId = moduleId;
      this.saveState();
    }
  }

  public completeModule(moduleId: string, isMastered: boolean = false) {
    const currentStatus = this.state.modules[moduleId];
    const newStatus: ModuleStatus =
      isMastered || currentStatus === 'MASTERED' ? 'MASTERED' : 'COMPLETED';

    this.state.modules[moduleId] = newStatus;
    this.state.moduleProgress[moduleId] = 100;
    this.state.currentActiveModuleId = moduleId;
    this.saveState();
  }

  public markLevelCompleted(levelId: number, _scoreAwarded: number = 0, isPerfect: boolean = false) {
    if (!this.state.levelsCompleted) {
      this.state.levelsCompleted = [];
    }
    if (!this.state.levelsMastered) {
      this.state.levelsMastered = [];
    }

    if (!this.state.levelsCompleted.includes(levelId)) {
      this.state.levelsCompleted.push(levelId);
    }
    if (isPerfect && !this.state.levelsMastered.includes(levelId)) {
      this.state.levelsMastered.push(levelId);
    }

    this.saveState();
  }

  public addScore(points: number) {
    this.state.totalScore = Math.min(100, (this.state.totalScore || 0) + points);
    this.saveState();
  }

  public getTotalScore(): number {
    const summary = this.getTopicScoreSummary(this.activeTopicId);
    return Math.round(summary.earnedScore);
  }

  public checkAndCompleteCertification() {
    const stats = this.getStats();
    if (stats.isAllComplete && !this.state.hasCelebrated100Percent) {
      this.saveState();
    }
  }

  public setCelebrationAcknowledged() {
    this.state.hasCelebrated100Percent = true;
    this.saveState();
  }

  public recordQuizCompletion(scores: Record<number, number>, correctCount: number, totalQuestions: number) {
    this.state.quizScores = scores;
    this.state.quizSubmitted = true;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    this.state.quizFinalScore = percentage;
    this.saveState();
  }

  public resetQuizAttempt() {
    this.state.quizScores = {};
    this.state.quizSubmitted = false;
    this.state.quizFinalScore = 0;
    this.saveState();
  }

  public recordMasterChallenge(challengeId: string) {
    if (!this.state.masterChallengesCompleted) {
      this.state.masterChallengesCompleted = [];
    }
    if (!this.state.masterChallengesCompleted.includes(challengeId)) {
      this.state.masterChallengesCompleted.push(challengeId);
    }
    this.saveState();
  }

  public recordSandboxOp() {
    this.state.sandboxOperationsCount += 1;
    this.saveState();
  }

  public resetProgress() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('hash_quest_quiz_answers_v3');
        localStorage.removeItem('hash_quest_quiz_submitted_v3');
        localStorage.removeItem('dll_master_game_completed_tasks_v4');
        localStorage.removeItem('dsa_game_completed_tasks_v1');
        localStorage.removeItem(SCORING_EVENTS_KEY);
      } catch {
        // Ignore storage errors
      }
    }

    this.scoringEvents = [];
    this.eventKeySet.clear();

    this.state = {
      version: 2,
      modules: {
        'fn-01-basics': 'NOT_STARTED',
        'fn-02-modulo': 'NOT_STARTED',
        'fn-03-table': 'NOT_STARTED',
        'fn-04-lifecycle': 'NOT_STARTED',
        'fn-05-collision': 'NOT_STARTED',
        'fn-06-chaining': 'NOT_STARTED',
        'fn-07-linear': 'NOT_STARTED',
        'fn-08-quadratic': 'NOT_STARTED',
        'fn-09-double': 'NOT_STARTED',
        'fn-10-realworld': 'NOT_STARTED',
        'fn-11-advantages': 'NOT_STARTED',
        'fn-12-tradeoffs': 'NOT_STARTED',
      },
      moduleProgress: {},
      completedTheoryChapters: [],
      currentTheoryChapterId: 'theory-01',
      levelCompletedKeys: {},
      levelsCompleted: [],
      levelsMastered: [],
      quizScores: {},
      quizSubmitted: false,
      quizFinalScore: 0,
      masterChallengesCompleted: [],
      sandboxOperationsCount: 0,
      totalScore: 0,
      streak: 0,
      currentActiveModuleId: 'fn-01-basics',
      lastActiveTimestamp: Date.now(),
      completedVideos: [],
      hasCelebrated100Percent: false,
    };
    this.saveState();
  }
}

export const progressManager = new ProgressManager();
