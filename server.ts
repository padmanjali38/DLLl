import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.resolve(DATA_DIR, 'competition_db.json');

// Answer key for quiz validation
const QUIZ_ANSWER_KEY: Record<number, number> = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 0,
  6: 1,
  7: 0,
  8: 1,
  9: 0,
  10: 1,
};

// Activity metadata mappings
const THEORY_TITLES: Record<string, string> = {
  'fn-01-basics': 'What is DLL? & Node Anatomy',
  'fn-02-modulo': 'Node Structure & Memory Allocation',
  'fn-03-table': 'Head & Tail Boundary Pointers',
  'fn-04-lifecycle': 'Bi-Directional Traversal Pipeline',
  'fn-05-collision': 'Insertion at Head (Beginning)',
  'fn-06-chaining': 'Insertion at Tail (End)',
  'fn-07-linear': 'Insertion at Middle Position',
  'fn-08-quadratic': 'Deletion at Head & Tail',
  'fn-09-double': 'Deletion of a Middle Node',
  'fn-10-cluster': 'Bi-Directional Search Optimization',
  'fn-11-load': 'LRU Cache Design with DLL',
  'fn-12-mastery': 'Memory Overhead & Cache Locality Analysis',
};

const VIDEO_TITLES: Record<string, string> = {
  'lesson-01': 'What is DLL? & DLL Insertion',
  'lesson-02': 'Traversal & DLL Deletion',
};

const GAME_TASK_TITLES: Record<string, string> = {
  'task-1-1': 'Creating a Node',
  'task-1-2': 'Build the DLL',
  'task-1-3': 'Traversal in DLL',
  'task-2-1': 'Insert at Beginning',
  'task-2-2': 'Insert at End',
  'task-2-3': 'Insert at Any Position',
  'task-3-1': 'Delete from Beginning',
  'task-3-2': 'Delete from End',
  'task-3-3': 'Delete from Any Position',
  'dll-task-1-1': 'DLL Node Anatomy & Fields',
  'dll-task-1-2': 'Allocate Node on Dynamic Heap',
  'dll-task-1-3': 'Single Node Boundary State',
  'dll-task-2-1': 'Insert at Head (Prepend)',
  'dll-task-2-2': 'Insert at Tail (Append)',
  'dll-task-2-3': 'Insert at Middle (4-Pointer Wire)',
  'dll-task-3-1': 'Delete Head Boundary Node',
  'dll-task-3-2': 'Delete Tail Boundary Node',
  'dll-task-3-3': 'Delete Middle Node (Bypass)',
  'l1-t1': 'Allocate & Initialize Head Node',
  'l1-t2': 'Insert Second Node at Head',
  'l1-t3': 'Head Pointer Reassignment & Boundary Link',
  'l2-t1': 'Append New Node to Tail',
  'l2-t2': 'Tail Successor & Predecessor Linking',
  'l2-t3': 'Multi-Node Boundary Extension',
  'l3-t1': 'Forward Traversal to Tail',
  'l3-t2': 'Backward Traversal to Head',
  'l3-t3': 'Bi-Directional Search & Verification',
};

export interface ParticipantRecord {
  userId: string;
  studentName: string;
  avatarSeed: string;
  theoryPoints: number;
  videoPoints: number;
  gamePoints: number;
  quizPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  completedModules: string[];
  completedVideos: string[];
  completedTasks: string[];
  quizAnswers: Record<number, { selectedIndex: number; isCorrect: boolean; timestamp: number }>;
  hintsUsed: string[];
  guidedStepsUsed: string[];
  lastActive: number;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  studentName: string;
  eventType: 'THEORY' | 'VIDEO' | 'GAME' | 'QUIZ' | 'HINT' | 'GUIDED_STEP';
  activityName: string;
  category: 'Theory' | 'Visualization' | 'Games' | 'Quiz' | 'Penalties';
  points: number;
  timestamp: number;
}

interface DatabaseSchema {
  participants: Record<string, ParticipantRecord>;
  events: ActivityEvent[];
}

// Seed participants for real competition context
function getInitialSeedData(): DatabaseSchema {
  const now = Date.now();
  const seedParticipants: ParticipantRecord[] = [
    {
      userId: 'student-alex-01',
      studentName: 'Alex Chen',
      avatarSeed: 'alex',
      theoryPoints: 0,
      videoPoints: 16,
      gamePoints: 54,
      quizPoints: 20,
      penaltyPoints: -3,
      totalPoints: 87,
      completedModules: ['fn-01-basics', 'fn-02-modulo', 'fn-03-table', 'fn-04-lifecycle', 'fn-05-collision', 'fn-06-chaining', 'fn-07-linear', 'fn-08-quadratic', 'fn-09-double'],
      completedVideos: ['lesson-01', 'lesson-02'],
      completedTasks: ['task-1-1', 'task-1-2', 'task-1-3', 'task-2-1', 'task-2-2', 'task-2-3', 'task-3-1', 'task-3-2', 'task-3-3'],
      quizAnswers: {
        1: { selectedIndex: 1, isCorrect: true, timestamp: now - 3600000 },
        2: { selectedIndex: 1, isCorrect: true, timestamp: now - 3500000 },
        3: { selectedIndex: 1, isCorrect: true, timestamp: now - 3400000 },
        4: { selectedIndex: 1, isCorrect: true, timestamp: now - 3300000 },
        5: { selectedIndex: 0, isCorrect: true, timestamp: now - 3200000 },
        6: { selectedIndex: 1, isCorrect: true, timestamp: now - 3100000 },
        7: { selectedIndex: 0, isCorrect: true, timestamp: now - 3000000 },
        8: { selectedIndex: 0, isCorrect: false, timestamp: now - 2900000 },
      },
      hintsUsed: ['task-2-2-h1'],
      guidedStepsUsed: ['task-2-1-s1'],
      lastActive: now - 3600000,
    },
    {
      userId: 'student-priya-02',
      studentName: 'Priya Sharma',
      avatarSeed: 'priya',
      theoryPoints: 0,
      videoPoints: 16,
      gamePoints: 42,
      quizPoints: 24,
      penaltyPoints: -1,
      totalPoints: 81,
      completedModules: ['fn-01-basics', 'fn-02-modulo', 'fn-03-table', 'fn-04-lifecycle', 'fn-05-collision', 'fn-06-chaining', 'fn-07-linear', 'fn-08-quadratic', 'fn-09-double', 'fn-10-cluster'],
      completedVideos: ['lesson-01', 'lesson-02'],
      completedTasks: ['task-1-1', 'task-1-2', 'task-1-3', 'task-2-1', 'task-2-2', 'task-2-3', 'task-3-1'],
      quizAnswers: {
        1: { selectedIndex: 1, isCorrect: true, timestamp: now - 7200000 },
        2: { selectedIndex: 1, isCorrect: true, timestamp: now - 7100000 },
        3: { selectedIndex: 1, isCorrect: true, timestamp: now - 7000000 },
        4: { selectedIndex: 1, isCorrect: true, timestamp: now - 6900000 },
        5: { selectedIndex: 0, isCorrect: true, timestamp: now - 6800000 },
        6: { selectedIndex: 1, isCorrect: true, timestamp: now - 6700000 },
        7: { selectedIndex: 0, isCorrect: true, timestamp: now - 6600000 },
        8: { selectedIndex: 1, isCorrect: true, timestamp: now - 6500000 },
      },
      hintsUsed: ['task-1-3-h1'],
      guidedStepsUsed: [],
      lastActive: now - 7200000,
    },
    {
      userId: 'student-marcus-03',
      studentName: 'Marcus Vance',
      avatarSeed: 'marcus',
      theoryPoints: 0,
      videoPoints: 16,
      gamePoints: 48,
      quizPoints: 14,
      penaltyPoints: -4,
      totalPoints: 74,
      completedModules: ['fn-01-basics', 'fn-02-modulo', 'fn-03-table', 'fn-04-lifecycle', 'fn-05-collision', 'fn-06-chaining', 'fn-07-linear'],
      completedVideos: ['lesson-01', 'lesson-02'],
      completedTasks: ['task-1-1', 'task-1-2', 'task-1-3', 'task-2-1', 'task-2-2', 'task-2-3', 'task-3-1', 'task-3-2'],
      quizAnswers: {
        1: { selectedIndex: 1, isCorrect: true, timestamp: now - 10800000 },
        2: { selectedIndex: 1, isCorrect: true, timestamp: now - 10700000 },
        3: { selectedIndex: 1, isCorrect: true, timestamp: now - 10600000 },
        4: { selectedIndex: 1, isCorrect: true, timestamp: now - 10500000 },
        5: { selectedIndex: 1, isCorrect: false, timestamp: now - 10400000 },
        6: { selectedIndex: 1, isCorrect: true, timestamp: now - 10300000 },
      },
      hintsUsed: ['task-2-1-h1', 'task-3-2-h1'],
      guidedStepsUsed: ['task-3-2-s1'],
      lastActive: now - 10800000,
    },
    {
      userId: 'student-elena-04',
      studentName: 'Elena Rostova',
      avatarSeed: 'elena',
      theoryPoints: 0,
      videoPoints: 8,
      gamePoints: 36,
      quizPoints: 18,
      penaltyPoints: -2,
      totalPoints: 60,
      completedModules: ['fn-01-basics', 'fn-02-modulo', 'fn-03-table', 'fn-04-lifecycle', 'fn-05-collision', 'fn-06-chaining', 'fn-07-linear', 'fn-08-quadratic'],
      completedVideos: ['lesson-01'],
      completedTasks: ['task-1-1', 'task-1-2', 'task-1-3', 'task-2-1', 'task-2-2', 'task-2-3'],
      quizAnswers: {
        1: { selectedIndex: 1, isCorrect: true, timestamp: now - 14400000 },
        2: { selectedIndex: 1, isCorrect: true, timestamp: now - 14300000 },
        3: { selectedIndex: 1, isCorrect: true, timestamp: now - 14200000 },
        4: { selectedIndex: 1, isCorrect: true, timestamp: now - 14100000 },
        5: { selectedIndex: 0, isCorrect: true, timestamp: now - 14000000 },
        6: { selectedIndex: 1, isCorrect: true, timestamp: now - 13900000 },
      },
      hintsUsed: [],
      guidedStepsUsed: ['task-2-3-s1'],
      lastActive: now - 14400000,
    },
    {
      userId: 'student-devon-05',
      studentName: 'Devon Lee',
      avatarSeed: 'devon',
      theoryPoints: 0,
      videoPoints: 8,
      gamePoints: 30,
      quizPoints: 12,
      penaltyPoints: -1,
      totalPoints: 49,
      completedModules: ['fn-01-basics', 'fn-02-modulo', 'fn-03-table', 'fn-04-lifecycle', 'fn-05-collision'],
      completedVideos: ['lesson-01'],
      completedTasks: ['task-1-1', 'task-1-2', 'task-1-3', 'task-2-1', 'task-2-2'],
      quizAnswers: {
        1: { selectedIndex: 1, isCorrect: true, timestamp: now - 18000000 },
        2: { selectedIndex: 1, isCorrect: true, timestamp: now - 17900000 },
        3: { selectedIndex: 1, isCorrect: true, timestamp: now - 17800000 },
        4: { selectedIndex: 1, isCorrect: true, timestamp: now - 17700000 },
      },
      hintsUsed: ['task-1-2-h1'],
      guidedStepsUsed: [],
      lastActive: now - 18000000,
    },
  ];

  const participants: Record<string, ParticipantRecord> = {};
  seedParticipants.forEach((p) => {
    participants[p.userId] = p;
  });

  const seedEvents: ActivityEvent[] = [
    {
      id: 'evt-seed-1',
      userId: 'student-alex-01',
      studentName: 'Alex Chen',
      eventType: 'GAME',
      activityName: 'Insert at Beginning',
      category: 'Games',
      points: 6,
      timestamp: now - 3600000,
    },
    {
      id: 'evt-seed-2',
      userId: 'student-priya-02',
      studentName: 'Priya Sharma',
      eventType: 'THEORY',
      activityName: 'Bi-Directional Search Optimization',
      category: 'Theory',
      points: 0,
      timestamp: now - 6600000,
    },
    {
      id: 'evt-seed-3',
      userId: 'student-alex-01',
      studentName: 'Alex Chen',
      eventType: 'QUIZ',
      activityName: 'Quiz Question #7: Correct Answer',
      category: 'Quiz',
      points: 3,
      timestamp: now - 3000000,
    },
    {
      id: 'evt-seed-4',
      userId: 'student-marcus-03',
      studentName: 'Marcus Vance',
      eventType: 'GUIDED_STEP',
      activityName: 'Guided Step Assistance: Delete from End',
      category: 'Penalties',
      points: -2,
      timestamp: now - 10300000,
    },
    {
      id: 'evt-seed-5',
      userId: 'student-elena-04',
      studentName: 'Elena Rostova',
      eventType: 'VIDEO',
      activityName: 'What is DLL? & DLL Insertion',
      category: 'Visualization',
      points: 8,
      timestamp: now - 14400000,
    },
  ];

  return { participants, events: seedEvents };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.participants && Array.isArray(data.events)) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error loading competition database, resetting to seed:', err);
  }
  const initial = getInitialSeedData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving competition database:', err);
  }
}

let db = loadDatabase();

// Re-calculate totals safely
function recalculateParticipantScores(p: ParticipantRecord) {
  p.theoryPoints = 0; // Theory has 0 competition points
  p.videoPoints = Math.min(16, p.completedVideos.length * 8); // 2 * 8 = 16 max
  p.gamePoints = Math.min(54, p.completedTasks.length * 6); // 9 * 6 = 54 max

  let qPts = 0;
  for (const qIdStr in p.quizAnswers) {
    const ans = p.quizAnswers[Number(qIdStr)];
    if (ans) {
      if (ans.selectedIndex === -1) {
        // timeout awards 0
      } else {
        qPts += ans.isCorrect ? 3 : -1;
      }
    }
  }
  p.quizPoints = Math.max(0, Math.min(30, qPts)); // 30 max

  const hintDeductions = p.hintsUsed.length * -1;
  const guidedDeductions = p.guidedStepsUsed.length * -2;
  p.penaltyPoints = hintDeductions + guidedDeductions;

  p.totalPoints = Math.min(100, Math.max(0, p.videoPoints + p.gamePoints + p.quizPoints + p.penaltyPoints));
}

function getOrCreateUser(userId?: string, studentName?: string): ParticipantRecord {
  const finalId = userId?.trim() || 'student-current-user';
  if (!db.participants[finalId]) {
    db.participants[finalId] = {
      userId: finalId,
      studentName: studentName?.trim() || 'Current Student',
      avatarSeed: finalId,
      theoryPoints: 0,
      videoPoints: 0,
      gamePoints: 0,
      quizPoints: 0,
      penaltyPoints: 0,
      totalPoints: 0,
      completedModules: [],
      completedVideos: [],
      completedTasks: [],
      quizAnswers: {},
      hintsUsed: [],
      guidedStepsUsed: [],
      lastActive: Date.now(),
    };
    saveDatabase(db);
  } else if (studentName && studentName.trim() && db.participants[finalId].studentName !== studentName.trim()) {
    db.participants[finalId].studentName = studentName.trim();
    saveDatabase(db);
  }
  return db.participants[finalId];
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Helper to extract user identity from headers
  const getUserIdFromReq = (req: Request): string => {
    const fromHeader = req.headers['x-user-id'] as string;
    return fromHeader?.trim() || 'student-current-user';
  };

  const getStudentNameFromReq = (req: Request): string => {
    const fromHeader = req.headers['x-user-name'] as string;
    return fromHeader?.trim() || 'Current Student';
  };

  // ---------------------------------------------------------------------------
  // API Routes
  // ---------------------------------------------------------------------------

  // 1. Get Current User / Profile
  app.get('/api/points/user', (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const studentName = getStudentNameFromReq(req);
    const user = getOrCreateUser(userId, studentName);
    res.json(user);
  });

  // 2. Update Student Profile
  app.post('/api/points/user', (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const { studentName } = req.body;
    const user = getOrCreateUser(userId, studentName);
    if (studentName && typeof studentName === 'string') {
      user.studentName = studentName.trim();
      saveDatabase(db);
    }
    res.json(user);
  });

  // 3. Get Points Breakdown for Current User
  app.get('/api/points/breakdown', (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const user = getOrCreateUser(userId);
    recalculateParticipantScores(user);
    saveDatabase(db);

    // Prepare detailed breakdowns for expandable rows
    const theoryDetails = user.completedModules.map((id) => ({
      id,
      title: THEORY_TITLES[id] || id,
      points: 0,
    }));

    const videoDetails = user.completedVideos.map((id) => ({
      id,
      title: VIDEO_TITLES[id] || id,
      points: 8,
    }));

    const gameDetails = user.completedTasks.map((id) => ({
      id,
      title: GAME_TASK_TITLES[id] || id,
      points: 6,
    }));

    const quizDetails = Object.entries(user.quizAnswers).map(([qId, ans]) => ({
      questionId: Number(qId),
      isCorrect: ans.isCorrect,
      points: ans.selectedIndex === -1 ? 0 : ans.isCorrect ? 3 : -1,
      timestamp: ans.timestamp,
    }));

    const penaltyDetails = [
      ...user.hintsUsed.map((h) => ({
        id: h,
        type: 'HINT' as const,
        description: `Hint used on task ${h.replace(/-h\d+$/, '')}`,
        points: -1,
      })),
      ...user.guidedStepsUsed.map((s) => ({
        id: s,
        type: 'GUIDED_STEP' as const,
        description: `Guided Solve step ${s.split('-s')[1] || ''} on task ${s.replace(/-s\d+$/, '')}`,
        points: -2,
      })),
    ];

    res.json({
      theoryPoints: user.theoryPoints,
      videoPoints: user.videoPoints,
      gamePoints: user.gamePoints,
      quizPoints: user.quizPoints,
      penaltyPoints: user.penaltyPoints,
      totalPoints: user.totalPoints,
      details: {
        theory: theoryDetails,
        video: videoDetails,
        games: gameDetails,
        quiz: quizDetails,
        penalties: penaltyDetails,
      },
    });
  });

  // 4. Get Leaderboard (Sorted descending by totalPoints)
  app.get('/api/points/leaderboard', (req: Request, res: Response) => {
    const currentUserId = getUserIdFromReq(req);
    // Ensure current user is in participants
    getOrCreateUser(currentUserId);

    // Recalculate all participants
    Object.values(db.participants).forEach((p) => recalculateParticipantScores(p));
    saveDatabase(db);

    const list = Object.values(db.participants)
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return b.lastActive - a.lastActive;
      })
      .map((p, index) => ({
        rank: index + 1,
        userId: p.userId,
        studentName: p.studentName,
        totalPoints: p.totalPoints,
        theoryPoints: p.theoryPoints,
        videoPoints: p.videoPoints,
        gamePoints: p.gamePoints,
        quizPoints: p.quizPoints,
        penaltyPoints: p.penaltyPoints,
        isCurrentUser: p.userId === currentUserId,
      }));

    res.json(list);
  });

  // 5. Get Activity History (User's scoring events + competition highlights)
  app.get('/api/points/activity-history', (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    // Return recent events for user first, sorted newest first
    const userEvents = db.events
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);

    // Also get global competition feed
    const globalEvents = [...db.events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);

    res.json({
      userEvents,
      globalEvents,
    });
  });

  // 6. Record Scoring Event (Strictly validated on server)
  app.post('/api/points/event', (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const studentName = getStudentNameFromReq(req);
    const user = getOrCreateUser(userId, studentName);
    const { eventType, itemId, meta } = req.body;

    const now = Date.now();
    let pointsAwarded = 0;
    let activityName = '';
    let category: 'Theory' | 'Visualization' | 'Games' | 'Quiz' | 'Penalties' = 'Theory';
    let isDuplicate = false;

    if (eventType === 'THEORY_MODULE_COMPLETED') {
      const moduleId = String(itemId || meta?.moduleId || '').trim();
      if (!moduleId) {
        return res.status(400).json({ error: 'Missing moduleId' });
      }
      if (user.completedModules.includes(moduleId)) {
        isDuplicate = true;
      } else {
        user.completedModules.push(moduleId);
        pointsAwarded = 0; // Theory has 0 competition points (educational progress only)
        category = 'Theory';
        activityName = THEORY_TITLES[moduleId] ? `Theory: ${THEORY_TITLES[moduleId]}` : `Theory Module: ${moduleId}`;
      }
    } else if (eventType === 'VIDEO_LESSON_COMPLETED') {
      const lessonId = String(itemId || meta?.lessonId || '').trim();
      if (!lessonId) {
        return res.status(400).json({ error: 'Missing lessonId' });
      }
      if (user.completedVideos.includes(lessonId)) {
        isDuplicate = true;
      } else {
        user.completedVideos.push(lessonId);
        pointsAwarded = 8; // +8 once per unique fully completed video
        category = 'Visualization';
        activityName = VIDEO_TITLES[lessonId] ? `Video: ${VIDEO_TITLES[lessonId]}` : `Video Lesson: ${lessonId}`;
      }
    } else if (eventType === 'GAME_TASK_COMPLETED') {
      const taskId = String(itemId || meta?.taskId || '').trim();
      if (!taskId) {
        return res.status(400).json({ error: 'Missing taskId' });
      }
      if (user.completedTasks.includes(taskId)) {
        isDuplicate = true;
      } else {
        user.completedTasks.push(taskId);
        pointsAwarded = 6; // +6 once per unique completed game task (18 pts per 3-task level)
        category = 'Games';
        activityName = GAME_TASK_TITLES[taskId] ? `Game Task: ${GAME_TASK_TITLES[taskId]}` : `Game Task: ${taskId}`;
      }
    } else if (eventType === 'HINT_USED') {
      const hintKey = String(itemId || `${meta?.taskId || 'task'}-h${meta?.hintIndex || 1}`).trim();
      if (user.hintsUsed.includes(hintKey)) {
        isDuplicate = true; // prevent duplicate penalty submissions for same hint action
      } else {
        user.hintsUsed.push(hintKey);
        pointsAwarded = -1; // -1 per eligible hint use
        category = 'Penalties';
        const taskName = GAME_TASK_TITLES[meta?.taskId] || meta?.taskId || 'Task';
        activityName = `Hint Used (${taskName})`;
      }
    } else if (eventType === 'GUIDED_STEP_USED') {
      const stepKey = String(itemId || `${meta?.taskId || 'task'}-s${meta?.stepNumber || 1}`).trim();
      if (user.guidedStepsUsed.includes(stepKey)) {
        isDuplicate = true; // prevent duplicate penalty submissions for same guided step
      } else {
        user.guidedStepsUsed.push(stepKey);
        pointsAwarded = -2; // -2 per eligible guided solve step
        category = 'Penalties';
        const taskName = GAME_TASK_TITLES[meta?.taskId] || meta?.taskId || 'Task';
        activityName = `Guided Solve Step ${meta?.stepNumber || ''} (${taskName})`;
      }
    } else if (eventType === 'QUIZ_ANSWER') {
      const questionId = Number(itemId || meta?.questionId);
      const selectedIndex = Number(meta?.selectedIndex);

      if (!questionId || isNaN(selectedIndex)) {
        return res.status(400).json({ error: 'Missing questionId or selectedIndex' });
      }

      // Check if already answered in this attempt
      if (user.quizAnswers[questionId] && !meta?.forceRetake) {
        isDuplicate = true;
      } else {
        const isTimeout = selectedIndex === -1;
        const correctIndex = QUIZ_ANSWER_KEY[questionId];
        const isCorrect = !isTimeout && selectedIndex === correctIndex;
        user.quizAnswers[questionId] = {
          selectedIndex,
          isCorrect,
          timestamp: now,
        };
        // +3 pts for correct, -1 pt for wrong, 0 pts for timeout
        pointsAwarded = isTimeout ? 0 : isCorrect ? 3 : -1;
        category = 'Quiz';
        activityName = isTimeout
          ? `Quiz Question #${questionId}: Timed Out (0 pts)`
          : isCorrect
          ? `Quiz Question #${questionId}: Correct Answer (+3 pts)`
          : `Quiz Question #${questionId}: Incorrect Answer (-1 pt)`;
      }
    } else {
      return res.status(400).json({ error: `Unknown eventType: ${eventType}` });
    }

    user.lastActive = now;
    recalculateParticipantScores(user);

    let eventRecord: ActivityEvent | null = null;
    if (!isDuplicate && pointsAwarded !== 0) {
      eventRecord = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: user.userId,
        studentName: user.studentName,
        eventType: eventType as any,
        activityName,
        category,
        points: pointsAwarded,
        timestamp: now,
      };
      db.events.unshift(eventRecord);
      // Limit global events array
      if (db.events.length > 200) {
        db.events = db.events.slice(0, 200);
      }
    }

    saveDatabase(db);

    res.json({
      success: true,
      isDuplicate,
      pointsAwarded,
      userScores: {
        theoryPoints: user.theoryPoints,
        videoPoints: user.videoPoints,
        gamePoints: user.gamePoints,
        quizPoints: user.quizPoints,
        penaltyPoints: user.penaltyPoints,
        totalPoints: user.totalPoints,
      },
      event: eventRecord,
    });
  });

  // 7. Reset User Progress (for testing or user-initiated reset)
  app.post('/api/points/reset', (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const user = getOrCreateUser(userId);
    user.completedModules = [];
    user.completedVideos = [];
    user.completedTasks = [];
    user.quizAnswers = {};
    user.hintsUsed = [];
    user.guidedStepsUsed = [];
    recalculateParticipantScores(user);
    saveDatabase(db);
    res.json({ success: true, user });
  });

  // ---------------------------------------------------------------------------
  // Vite Integration (Dev) or Static Hosting (Prod)
  // ---------------------------------------------------------------------------
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlgoLearn Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
