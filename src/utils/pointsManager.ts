import { progressManager } from './progressManager';

export interface PointsBreakdownDetails {
  theory: Array<{ id: string; title: string; points: number }>;
  video: Array<{ id: string; title: string; points: number }>;
  games: Array<{ id: string; title: string; points: number }>;
  quiz: Array<{ questionId: number; isCorrect: boolean; points: number; timestamp: number }>;
  penalties: Array<{ id: string; type: 'HINT' | 'GUIDED_STEP'; description: string; points: number }>;
}

export interface PointsBreakdown {
  theoryPoints: number;
  videoPoints: number;
  gamePoints: number;
  quizPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  details: PointsBreakdownDetails;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  totalPoints: number;
  theoryPoints: number;
  videoPoints: number;
  gamePoints: number;
  quizPoints: number;
  penaltyPoints: number;
  isCurrentUser: boolean;
}

export interface ScoringActivityEvent {
  id: string;
  userId: string;
  studentName: string;
  eventType: 'THEORY' | 'VIDEO' | 'GAME' | 'QUIZ' | 'HINT' | 'GUIDED_STEP';
  activityName: string;
  category: 'Theory' | 'Visualization' | 'Games' | 'Quiz' | 'Penalties';
  points: number;
  timestamp: number;
}

const STORAGE_USER_ID_KEY = 'algolearn_student_id_v1';
const STORAGE_USER_NAME_KEY = 'algolearn_student_name_v1';
const STORAGE_SYNCED_EVENTS_KEY = 'algolearn_synced_events_v1';

class PointsManager {
  private userId: string;
  private studentName: string;
  private subscribers: Set<() => void> = new Set();
  private isSyncing: boolean = false;
  private syncedKeys: Set<string> = new Set();

  constructor() {
    // Initialize or load identity
    let storedId = '';
    let storedName = '';
    try {
      storedId = localStorage.getItem(STORAGE_USER_ID_KEY) || '';
      storedName = localStorage.getItem(STORAGE_USER_NAME_KEY) || '';
      const rawSynced = localStorage.getItem(STORAGE_SYNCED_EVENTS_KEY);
      if (rawSynced) {
        this.syncedKeys = new Set(JSON.parse(rawSynced));
      }
    } catch {
      // Ignore
    }

    if (!storedId) {
      storedId = `student-${Math.random().toString(36).substring(2, 9)}`;
      try {
        localStorage.setItem(STORAGE_USER_ID_KEY, storedId);
      } catch {}
    }

    if (!storedName) {
      storedName = 'Ram Ganesh'; // From user email metadata
      try {
        localStorage.setItem(STORAGE_USER_NAME_KEY, storedName);
      } catch {}
    }

    this.userId = storedId;
    this.studentName = storedName;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getStudentName(): string {
    return this.studentName;
  }

  public async setStudentName(newName: string): Promise<void> {
    const trimmed = newName.trim();
    if (!trimmed) return;
    this.studentName = trimmed;
    try {
      localStorage.setItem(STORAGE_USER_NAME_KEY, trimmed);
      await fetch('/api/points/user', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ studentName: trimmed }),
      });
    } catch (err) {
      console.warn('Could not sync student name to server:', err);
    }
    this.notifySubscribers();
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-user-id': this.userId,
      'x-user-name': this.studentName,
    };
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notifySubscribers() {
    const defer = typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout;
    defer(() => {
      this.subscribers.forEach((cb) => {
        try {
          cb();
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  // Record an action event securely on the backend
  public resetPoints(): void {
    this.syncedKeys.clear();
    try {
      localStorage.removeItem(STORAGE_SYNCED_EVENTS_KEY);
    } catch {}
    this.notifySubscribers();
  }

  public async recordEvent(
    eventType:
      | 'THEORY_MODULE_COMPLETED'
      | 'VIDEO_LESSON_COMPLETED'
      | 'GAME_TASK_COMPLETED'
      | 'HINT_USED'
      | 'GUIDED_STEP_USED'
      | 'QUIZ_ANSWER',
    itemId: string,
    meta?: any
  ): Promise<any> {
    const dedupeKey = `${eventType}:${itemId}:${meta?.stepNumber || meta?.hintIndex || ''}`;
    if (this.syncedKeys.has(dedupeKey) && eventType !== 'QUIZ_ANSWER') {
      return { success: true, isDuplicate: true };
    }

    try {
      const res = await fetch('/api/points/event', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ eventType, itemId, meta }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      this.syncedKeys.add(dedupeKey);
      try {
        localStorage.setItem(STORAGE_SYNCED_EVENTS_KEY, JSON.stringify(Array.from(this.syncedKeys)));
      } catch {}

      this.notifySubscribers();
      return data;
    } catch (err) {
      console.warn('PointsManager recordEvent network error:', err);
      // Fallback local acknowledgment
      return { success: false, error: err };
    }
  }

  // Fetch breakdown
  public async getBreakdown(): Promise<PointsBreakdown> {
    try {
      const res = await fetch('/api/points/breakdown', {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PointsManager getBreakdown error:', err);
    }

    // Fallback client-calculated breakdown
    return this.computeLocalBreakdown();
  }

  // Fetch leaderboard
  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch('/api/points/leaderboard', {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PointsManager getLeaderboard error:', err);
    }
    return [];
  }

  // Fetch activity history
  public async getActivityHistory(): Promise<{
    userEvents: ScoringActivityEvent[];
    globalEvents: ScoringActivityEvent[];
  }> {
    try {
      const res = await fetch('/api/points/activity-history', {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PointsManager getActivityHistory error:', err);
    }
    return { userEvents: [], globalEvents: [] };
  }

  // Synchronize already completed activities into the validated points ledger
  public async syncExistingProgress(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Sync theory chapters
      const state = progressManager.getState();
      const completedTheory = state.completedTheoryChapters || [];
      for (const chId of completedTheory) {
        await this.recordEvent('THEORY_MODULE_COMPLETED', chId, { moduleId: chId });
      }

      // 2. Sync video lessons
      const videoStats = progressManager.getVideoStats();
      const completedVideos = videoStats.completedVideos || [];
      for (const vid of completedVideos) {
        await this.recordEvent('VIDEO_LESSON_COMPLETED', vid, { lessonId: vid });
      }

      // 3. Sync completed game tasks
      try {
        const rawTasks = localStorage.getItem('dll_master_game_completed_tasks_v4');
        if (rawTasks) {
          const taskIds: string[] = JSON.parse(rawTasks);
          for (const tId of taskIds) {
            await this.recordEvent('GAME_TASK_COMPLETED', tId, { taskId: tId });
          }
        }
      } catch {}

      // 4. Sync quiz answers
      try {
        const rawAnswers = localStorage.getItem('algolearn_quiz_answers_v4') || localStorage.getItem('hash_quest_quiz_answers_v3');
        if (rawAnswers) {
          const answers = JSON.parse(rawAnswers);
          for (const [qId, rec] of Object.entries(answers)) {
            const ansObj = rec as any;
            if (ansObj && typeof ansObj.selectedOptionIndex === 'number') {
              await this.recordEvent('QUIZ_ANSWER', qId, {
                questionId: Number(qId),
                selectedIndex: ansObj.selectedOptionIndex,
              });
            }
          }
        }
      } catch {}

      this.notifySubscribers();
    } catch (err) {
      console.warn('Error syncing existing progress to points server:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  // Local fallback calculator aligned with exact 100-point rubric
  private computeLocalBreakdown(): PointsBreakdown {
    const pState = progressManager.getState();
    const theoryCompleted = pState.completedTheoryChapters || [];
    const videoCompleted = progressManager.getVideoStats().completedVideos || [];

    let gameCompleted: string[] = [];
    try {
      const raw = localStorage.getItem('dll_master_game_completed_tasks_v4');
      if (raw) gameCompleted = JSON.parse(raw);
    } catch {}

    let quizCorrect = 0;
    let quizWrong = 0;
    const quizDetails: Array<{ questionId: number; isCorrect: boolean; points: number; timestamp: number }> = [];
    try {
      const raw = localStorage.getItem('algolearn_quiz_answers_v4') || localStorage.getItem('hash_quest_quiz_answers_v3');
      if (raw) {
        const ans = JSON.parse(raw);
        for (const [qId, rec] of Object.entries(ans)) {
          const r = rec as any;
          if (r.isTimeout || r.selectedOptionIndex === -1) {
            quizDetails.push({ questionId: Number(qId), isCorrect: false, points: 0, timestamp: Date.now() });
          } else if (r.isCorrect) {
            quizCorrect++;
            quizDetails.push({ questionId: Number(qId), isCorrect: true, points: 3, timestamp: Date.now() });
          } else {
            quizWrong++;
            quizDetails.push({ questionId: Number(qId), isCorrect: false, points: -1, timestamp: Date.now() });
          }
        }
      }
    } catch {}

    // 16 pts Visualize + 54 pts Game + 30 pts Quiz = 100 pts Max
    const theoryPoints = 0;
    const videoPoints = Math.min(16, videoCompleted.length * 8);
    const gamePoints = Math.min(54, gameCompleted.length * 6);
    const quizPoints = Math.max(0, Math.min(30, quizCorrect * 3 - quizWrong * 1));
    const penaltyPoints = 0;
    const totalPoints = Math.min(100, Math.max(0, theoryPoints + videoPoints + gamePoints + quizPoints + penaltyPoints));

    return {
      theoryPoints,
      videoPoints,
      gamePoints,
      quizPoints,
      penaltyPoints,
      totalPoints,
      details: {
        theory: theoryCompleted.map((id) => ({ id, title: id, points: 0 })),
        video: videoCompleted.map((id) => ({ id, title: id, points: 8 })),
        games: gameCompleted.map((id) => ({ id, title: id, points: 6 })),
        quiz: quizDetails,
        penalties: [],
      },
    };
  }
}

export const pointsManager = new PointsManager();
