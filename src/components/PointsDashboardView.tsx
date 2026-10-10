import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Gamepad2,
  HelpCircle,
  AlertTriangle,
  Clock,
  User,
  Edit2,
  Check,
  RefreshCw,
  Layers,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Medal,
} from 'lucide-react';
import {
  pointsManager,
  PointsBreakdown,
  LeaderboardEntry,
  ScoringActivityEvent,
} from '../utils/pointsManager';
import { soundManager } from '../utils/audio';

export const PointsDashboardView: React.FC = () => {
  const [breakdown, setBreakdown] = useState<PointsBreakdown | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEvents, setUserEvents] = useState<ScoringActivityEvent[]>([]);
  const [globalEvents, setGlobalEvents] = useState<ScoringActivityEvent[]>([]);
  const [historyTab, setHistoryTab] = useState<'my' | 'all'>('my');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    theory: false,
    visualization: false,
    games: false,
    quiz: false,
    penalties: false,
  });

  const [studentName, setStudentName] = useState<string>(() => pointsManager.getStudentName());
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(studentName);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const currentUserId = pointsManager.getUserId();

  // Load and refresh data
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      // First ensure any locally completed activities are synced to the backend
      await pointsManager.syncExistingProgress();

      const [bData, lData, hData] = await Promise.all([
        pointsManager.getBreakdown(),
        pointsManager.getLeaderboard(),
        pointsManager.getActivityHistory(),
      ]);

      setBreakdown(bData);
      setLeaderboard(lData);
      setUserEvents(hData.userEvents);
      setGlobalEvents(hData.globalEvents);
    } catch (err) {
      console.warn('Error loading points data:', err);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to points manager updates
    const unsub = pointsManager.subscribe(() => {
      loadData();
    });

    // Auto-refresh leaderboard periodically for live competition feel
    const interval = setInterval(() => {
      loadData();
    }, 12000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const toggleCategory = (cat: string) => {
    soundManager.playClick();
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    soundManager.playSelect();
    await pointsManager.setStudentName(tempName.trim());
    setStudentName(tempName.trim());
    setIsEditingName(false);
    loadData(true);
  };

  // Find user's leaderboard position
  const currentUserEntry = leaderboard.find((item) => item.isCurrentUser);
  const userRank = currentUserEntry?.rank ?? 1;

  // Format timestamp relative
  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  const activeEvents = historyTab === 'my' ? userEvents : globalEvents;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-page-enter">
      {/* =========================================================================
          TOP HEADER: COMPETITION STATUS & PARTICIPANT IDENTITY
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-gradient text-white shadow-xs">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                  SHARED TOURNAMENT LEADERBOARD
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 dark:text-white">
                Points & Competition Standings
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pl-9">
            Real-time validated scoring across Theory, Visualization, Games, and Quizzes with student rankings.
          </p>
        </div>

        {/* Authenticated Participant Identity Card */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-[#0B1120] p-2.5 sm:p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start md:self-auto">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-300 flex items-center justify-center font-bold text-sm">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 pr-2">
            <div className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <span>PARTICIPANT</span>
              {currentUserEntry && (
                <span className="text-[#2563EB] dark:text-blue-400 font-bold">
                  • RANK #{currentUserEntry.rank}
                </span>
              )}
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-blue-400 text-slate-900 dark:text-white outline-none w-32"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  title="Save name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                  {studentName}
                </span>
                <button
                  onClick={() => {
                    setTempName(studentName);
                    setIsEditingName(true);
                  }}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Edit participant name"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2563EB]' : ''}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN DASHBOARD GRID
          Left: Points Breakdown + Leaderboard
          Right: Activity History
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================================
            LEFT / MAIN COLUMN (lg:col-span-8)
            ======================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* -------------------------------------------------------------------
              SECTION 1: POINTS BREAKDOWN CARD
              ------------------------------------------------------------------- */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 dark:text-white">
                    Points Breakdown
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculated scores per category. Click any row to expand completed activity details.
                  </p>
                </div>
              </div>

              {/* Total points badge summary */}
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  NET SCORE
                </span>
                <span className="text-lg sm:text-xl font-extrabold font-mono text-[#2563EB] dark:text-blue-400">
                  {breakdown?.totalPoints ?? 0} pts
                </span>
              </div>
            </div>

            {/* Breakdown Rows List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* ROW 1: THEORY */}
              <div className="py-3">
                <div
                  onClick={() => toggleCategory('theory')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                        Theory
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {breakdown?.details.theory.length || 0} modules completed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                      +{breakdown?.theoryPoints ?? 0} pts
                    </span>
                    <div className="text-slate-400">
                      {expandedCategories.theory ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Theory Details */}
                {expandedCategories.theory && (
                  <div className="mt-2 pl-12 pr-3 py-2 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                    {breakdown && breakdown.details.theory.length > 0 ? (
                      breakdown.details.theory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/40 last:border-0"
                        >
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[280px] sm:max-w-md">
                            {item.title}
                          </span>
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            +{item.points} pts
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        No theory modules completed yet. Visit Learn to read chapters.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ROW 2: VISUALIZATION */}
              <div className="py-3">
                <div
                  onClick={() => toggleCategory('visualization')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                        Visualization
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {breakdown?.details.video.length || 0} lessons watched
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                      +{breakdown?.videoPoints ?? 0} pts
                    </span>
                    <div className="text-slate-400">
                      {expandedCategories.visualization ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Video Details */}
                {expandedCategories.visualization && (
                  <div className="mt-2 pl-12 pr-3 py-2 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                    {breakdown && breakdown.details.video.length > 0 ? (
                      breakdown.details.video.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/40 last:border-0"
                        >
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[280px] sm:max-w-md">
                            {item.title}
                          </span>
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            +{item.points} pts
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        No video lessons watched yet. Complete lessons in Visualize.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ROW 3: GAMES */}
              <div className="py-3">
                <div
                  onClick={() => toggleCategory('games')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                        Games
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {breakdown?.details.games.length || 0} interactive tasks completed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                      +{breakdown?.gamePoints ?? 0} pts
                    </span>
                    <div className="text-slate-400">
                      {expandedCategories.games ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Games Details */}
                {expandedCategories.games && (
                  <div className="mt-2 pl-12 pr-3 py-2 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                    {breakdown && breakdown.details.games.length > 0 ? (
                      breakdown.details.games.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/40 last:border-0"
                        >
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[280px] sm:max-w-md">
                            {item.title}
                          </span>
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            +{item.points} pts
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        No game tasks completed yet. Complete levels in the Game arena.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ROW 4: QUIZ */}
              <div className="py-3">
                <div
                  onClick={() => toggleCategory('quiz')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                        Quiz
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {breakdown?.details.quiz.length || 0} questions answered
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                        (breakdown?.quizPoints ?? 0) >= 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
                      }`}
                    >
                      {(breakdown?.quizPoints ?? 0) >= 0 ? `+${breakdown?.quizPoints ?? 0}` : breakdown?.quizPoints} pts
                    </span>
                    <div className="text-slate-400">
                      {expandedCategories.quiz ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Quiz Details */}
                {expandedCategories.quiz && (
                  <div className="mt-2 pl-12 pr-3 py-2 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                    {breakdown && breakdown.details.quiz.length > 0 ? (
                      breakdown.details.quiz.map((item) => (
                        <div
                          key={item.questionId}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/40 last:border-0"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            Question #{item.questionId} ({item.isCorrect ? 'Correct' : 'Incorrect'})
                          </span>
                          <span
                            className={`font-mono font-semibold ${
                              item.points > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {item.points > 0 ? `+${item.points}` : item.points} pt
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        No quiz questions answered yet. Take the Quiz to earn points.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ROW 5: PENALTIES */}
              <div className="py-3">
                <div
                  onClick={() => toggleCategory('penalties')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                        Penalties
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {breakdown?.details.penalties.length || 0} deductions (hints & guided steps)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30">
                      {breakdown?.penaltyPoints ?? 0} pts
                    </span>
                    <div className="text-slate-400">
                      {expandedCategories.penalties ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Penalties Details */}
                {expandedCategories.penalties && (
                  <div className="mt-2 pl-12 pr-3 py-2 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                    {breakdown && breakdown.details.penalties.length > 0 ? (
                      breakdown.details.penalties.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/40 last:border-0"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            {item.description}
                          </span>
                          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                            {item.points} pts
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        No penalties incurred. Great independent problem solving!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ROW 6: TOTAL POINTS */}
              <div className="pt-3 pb-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-gradient text-white flex items-center justify-center shadow-xs">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block">
                        Total Points
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Net score across all categories
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="px-3.5 py-1.5 rounded-xl text-sm sm:text-base font-mono font-extrabold bg-[#2563EB] text-white shadow-xs">
                      {breakdown?.totalPoints ?? 0} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              SECTION 2: LEADERBOARD CARD
              ------------------------------------------------------------------- */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 dark:text-white">
                    Competition Leaderboard
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live participant standings sorted in descending order by total points.
                  </p>
                </div>
              </div>

              {currentUserEntry && (
                <div className="self-start sm:self-auto px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 text-xs font-mono font-bold text-[#2563EB] dark:text-blue-300 flex items-center gap-1.5">
                  <Medal className="w-3.5 h-3.5" />
                  <span>YOUR RANK: #{currentUserEntry.rank}</span>
                </div>
              )}
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right hidden sm:table-cell">Theory</th>
                    <th className="py-2.5 px-3 text-right hidden md:table-cell">Visualization</th>
                    <th className="py-2.5 px-3 text-right hidden sm:table-cell">Games</th>
                    <th className="py-2.5 px-3 text-right hidden md:table-cell">Quiz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {leaderboard.map((entry) => {
                    const isYou = entry.isCurrentUser;
                    return (
                      <tr
                        key={entry.userId}
                        className={`transition-colors ${
                          isYou
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 font-semibold border-l-4 border-l-[#2563EB]'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {entry.rank === 1 && (
                              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-[11px]">
                                🥇
                              </span>
                            )}
                            {entry.rank === 2 && (
                              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-[11px]">
                                🥈
                              </span>
                            )}
                            {entry.rank === 3 && (
                              <span className="w-6 h-6 rounded-full bg-amber-800/20 dark:bg-amber-800/40 text-amber-800 dark:text-amber-400 font-bold flex items-center justify-center text-[11px]">
                                🥉
                              </span>
                            )}
                            {entry.rank > 3 && (
                              <span className="font-mono text-slate-500 dark:text-slate-400 pl-1.5 font-bold">
                                #{entry.rank}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Student Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 dark:text-white font-medium">
                              {entry.studentName}
                            </span>
                            {isYou && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2563EB] text-white">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Points (Blue) */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-extrabold text-[#2563EB] dark:text-blue-400">
                            {entry.totalPoints} pts
                          </span>
                        </td>

                        {/* Theory Points */}
                        <td className="py-3 px-3 text-right hidden sm:table-cell">
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            +{entry.theoryPoints}
                          </span>
                        </td>

                        {/* Visualization Points */}
                        <td className="py-3 px-3 text-right hidden md:table-cell">
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            +{entry.videoPoints}
                          </span>
                        </td>

                        {/* Game Points */}
                        <td className="py-3 px-3 text-right hidden sm:table-cell">
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            +{entry.gamePoints}
                          </span>
                        </td>

                        {/* Quiz Points */}
                        <td className="py-3 px-3 text-right hidden md:table-cell">
                          <span
                            className={`font-mono ${
                              entry.quizPoints >= 0
                                ? 'text-slate-600 dark:text-slate-400'
                                : 'text-rose-500'
                            }`}
                          >
                            {entry.quizPoints >= 0 ? `+${entry.quizPoints}` : entry.quizPoints}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: ACTIVITY HISTORY (lg:col-span-4)
            ======================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-sans text-slate-900 dark:text-white">
                    Activity History
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Recent scoring events & point ledger
                  </p>
                </div>
              </div>

              {/* Feed Switch Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-mono font-bold">
                <button
                  onClick={() => setHistoryTab('my')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    historyTab === 'my'
                      ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  My Events
                </button>
                <button
                  onClick={() => setHistoryTab('all')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    historyTab === 'all'
                      ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tournament
                </button>
              </div>
            </div>

            {/* Event List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {activeEvents.length > 0 ? (
                activeEvents.map((evt) => {
                  const isPositive = evt.points > 0;
                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-start justify-between gap-2.5"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                              evt.category === 'Theory'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300'
                                : evt.category === 'Visualization'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300'
                                : evt.category === 'Games'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300'
                                : evt.category === 'Quiz'
                                ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
                            }`}
                          >
                            {evt.category}
                          </span>
                          {historyTab === 'all' && (
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
                              {evt.studentName}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            • {formatTimeAgo(evt.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-900 dark:text-slate-200 leading-snug break-words">
                          {evt.activityName}
                        </p>
                      </div>

                      {/* Points badge: Green for earned, Red for deductions */}
                      <div className="shrink-0 pt-0.5">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                            isPositive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                          )}
                          <span>{isPositive ? `+${evt.points}` : evt.points}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">
                    No recent events logged yet. Complete modules, videos, game tasks, or quizzes to build your ledger.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
