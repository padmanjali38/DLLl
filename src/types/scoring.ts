export type ScoringActivityType = 'LEARN' | 'VISUALIZE' | 'GAME' | 'QUIZ';

export type ScoringReason =
  | 'VIDEO_COMPLETED'       // +8 raw
  | 'GAME_TASK_COMPLETED'   // +6 raw
  | 'QUIZ_CORRECT'          // +3 raw
  | 'QUIZ_INCORRECT'        // -1 raw
  | 'QUIZ_TIMEOUT'          // 0 raw
  | 'HINT_USED'             // -1 raw
  | 'GUIDED_SOLVE_STEP'     // -2 raw
  | 'THEORY_COMPLETED';     // 0 raw (completion tracking only)

export interface ScoringEvent {
  id: string;
  participantId: string;
  topicId: string;
  activityType: ScoringActivityType;
  activityId: string;
  attemptId?: string;
  scoreDelta: number;
  reason: ScoringReason;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface SectionScore {
  section: 'learn' | 'visualize' | 'game' | 'quiz';
  label: string;
  eligibleCount: number;
  completedCount: number;
  maxRawScore: number;
  earnedRawScore: number;
  rawDeductions: number;
  netRawScore: number;
  pointBudget: number;       // normalized maximum points (0 for learn; sum across visualize, game, quiz is exactly 100)
  earnedPoints: number;      // normalized earned points, clamped between 0 and pointBudget
  isCompletionOnly: boolean; // true for Learn section (0 competition points)
}

export interface TopicScoreSummary {
  topicId: string;
  topicName: string;
  topicTitle: string;
  topicScoreTitle: string;
  description: string;
  totalModules: number;
  completedModules: number;
  completionPercentage: number;
  maxRawScore: number;
  netRawScore: number;
  totalBudget: 100;
  earnedScore: number;       // normalized overall topic score out of 100, clamped between 0 and 100
  sections: {
    learn: SectionScore;
    visualize: SectionScore;
    game: SectionScore;
    quiz: SectionScore;
  };
  events: ScoringEvent[];
}

export interface TopicDefinition {
  id: string;
  name: string;
  title: string;
  scoreTitle: string;
  description: string;
  theoryModulesCount: number;
  videoLessons: { id: string; title: string }[];
  gameTasks: { id: string; title: string; levelId: number }[];
  quizQuestions: { id: number; title: string }[];
}
