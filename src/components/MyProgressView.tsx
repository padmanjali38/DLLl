import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Trophy,
  BookOpen,
  Gamepad2,
  Video,
  Award,
  Check,
  Star,
  Circle,
  HelpCircle,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { progressManager, TOPIC_REGISTRY } from '../utils/progressManager';
import { ModuleRecord, ModuleStatus, UserProgressState, MainViewTab } from '../types/game';
import { TopicScoreSummary } from '../types/scoring';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CompletionCelebrationModal } from './CompletionCelebrationModal';
import { soundManager } from '../utils/audio';

interface MyProgressViewProps {
  onNavigateToTab: (tab: MainViewTab, levelId?: number, chapterId?: string) => void;
}

export const MyProgressView: React.FC<MyProgressViewProps> = ({ onNavigateToTab }) => {
  useScrollReveal();
  const [selectedTopicId, setSelectedTopicId] = useState<string>('dll');
  const [progressState, setProgressState] = useState<UserProgressState>(progressManager.getState());
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FOUNDATION' | 'TECHNIQUE' | 'ANALYSIS' | 'EXAMINATION'>('ALL');

  useEffect(() => {
    progressManager.checkAndCompleteCertification();
    const unsubscribe = progressManager.subscribe((state) => {
      setProgressState(state);
    });
    return unsubscribe;
  }, []);

  const summary: TopicScoreSummary = progressManager.getTopicScoreSummary(selectedTopicId);
  const modules = progressManager.getModules();
  const is100Percent = summary.completionPercentage === 100;
  const isPerfectScore = summary.earnedScore >= 100;

  const filteredModules =
    activeFilter === 'ALL'
      ? modules
      : modules.filter((m) => m.category === activeFilter);

  const formatPoints = (pts: number) => {
    return Math.round(pts * 10) / 10;
  };

  const renderStatusBadge = (status: ModuleStatus) => {
    switch (status) {
      case 'MASTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>Mastered</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            <span>Completed</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-50 dark:bg-[#0B1120] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>Not Started</span>
          </span>
        );
    }
  };

  const handleModuleClick = (module: ModuleRecord) => {
    soundManager.playSelect();
    progressManager.startModule(module.id);
    onNavigateToTab(module.targetTab, module.targetLevelId, module.targetChapterId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans text-slate-900 dark:text-white animate-page-enter pb-24">
      {/* =========================================================================
          TOPIC SELECTOR TABS (Multiple DSA Topics Support: DLL, Queue, Graphs)
          ========================================================================= */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2 shrink-0">
          Topics:
        </span>
        {Object.values(TOPIC_REGISTRY).map((t) => {
          const isSelected = selectedTopicId === t.id;
          const tSummary = progressManager.getTopicScoreSummary(t.id);
          return (
            <button
              key={t.id}
              onClick={() => {
                soundManager.playTab();
                setSelectedTopicId(t.id);
                progressManager.setActiveTopic(t.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary-gradient text-white border-transparent shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{t.name}</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {Math.round(tSummary.earnedScore)}/100 pts
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          A. TOPIC HEADER AND OVERALL COMPLETION (Matching Reference Screenshot)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-[#2563EB] dark:text-blue-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-blue-400" />
              <span>DSA Curriculum Progress</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {summary.topicTitle}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {summary.description}
            </p>
          </div>

          {/* Modules Count Badge & Percentage Indicator */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 px-4 py-3 rounded-2xl">
            <span className="text-xs font-semibold font-mono text-slate-500 dark:text-slate-400">
              {summary.completedModules} / {summary.totalModules} modules completed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {summary.completionPercentage}%
            </span>
          </div>
        </div>

        {/* Main Overall Completion Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Overall Curriculum Completion</span>
            <span className="font-mono">{summary.completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="bg-primary-gradient h-full rounded-full transition-all duration-700 ease-out shadow-xs shadow-primary-gradient"
              style={{ width: `${summary.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* 100% Curriculum Celebration Banner */}
        {is100Percent && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  100% Curriculum Completed!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  You have successfully finished all learning activities for {summary.topicName}.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playModalOpen();
                setShowCertificateModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary-gradient text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:brightness-110 shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Certificate</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          B. TOPIC SCORE BANNER (Matching Reference Screenshot)
          ========================================================================= */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-[#111827] dark:to-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 mb-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Performance Competition Score
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {summary.topicScoreTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Normalized out of 100 maximum points. Calculated from completed activities and recorded deductions.
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-white dark:bg-[#15203b] border border-blue-200 dark:border-blue-900/60 px-5 py-3 rounded-2xl shadow-xs self-start sm:self-auto">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] dark:text-blue-400 font-mono">
              {formatPoints(summary.earnedScore)}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 font-mono">
              / 100 Points
            </span>
          </div>
        </div>

        {/* Scoring Breakdown Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Videos (+8 raw)</span>
            <span className="font-bold text-slate-900 dark:text-white">{summary.sections.visualize.completedCount}/{summary.sections.visualize.eligibleCount} Watched</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Game Tasks (+6 raw)</span>
            <span className="font-bold text-slate-900 dark:text-white">{summary.sections.game.completedCount}/{summary.sections.game.eligibleCount} Solved</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Quiz (+3 / -1 raw)</span>
            <span className="font-bold text-slate-900 dark:text-white">{summary.sections.quiz.completedCount}/{summary.sections.quiz.eligibleCount} Answered</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Deductions</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              -{summary.sections.game.rawDeductions + summary.sections.quiz.rawDeductions} raw pts
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          C & D. FOUR SECTION POINT CARDS (NO INDIVIDUAL PROGRESS BARS BENEATH POINTS)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 1. LEARN CARD */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between reveal-on-scroll">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Learn
              </span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-slate-800">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono leading-none">
                0 / 0
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">
                Points
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {summary.sections.learn.completedCount} / {summary.sections.learn.eligibleCount} modules completed
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Completion tracking only • 0 pts
            </span>
          </div>
        </div>

        {/* 2. VISUALIZE CARD */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between reveal-on-scroll stagger-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visualize
              </span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-slate-800">
                <Video className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono leading-none">
                {formatPoints(summary.sections.visualize.earnedPoints)} / {formatPoints(summary.sections.visualize.pointBudget)}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">
                Points
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {summary.sections.visualize.completedCount} / {summary.sections.visualize.eligibleCount} videos completed (+8 raw each)
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                soundManager.playNav();
                onNavigateToTab('VIDEO');
              }}
              className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Videos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. GAME CARD */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between reveal-on-scroll stagger-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Game
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800">
                <Gamepad2 className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono leading-none">
                {formatPoints(summary.sections.game.earnedPoints)} / {formatPoints(summary.sections.game.pointBudget)}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">
                Points
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {summary.sections.game.completedCount} / {summary.sections.game.eligibleCount} tasks solved (+6 raw each)
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                soundManager.playNav();
                onNavigateToTab('GAME', 1);
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Play Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 4. QUIZ CARD */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between reveal-on-scroll stagger-3">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quiz
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-slate-800">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono leading-none">
                {formatPoints(summary.sections.quiz.earnedPoints)} / {formatPoints(summary.sections.quiz.pointBudget)}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">
                Points
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {summary.sections.quiz.completedCount} / {summary.sections.quiz.eligibleCount} questions completed (+3 / -1)
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                soundManager.playNav();
                onNavigateToTab('QUIZ');
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Take Quiz</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODULES LIST & DETAILED LEDGER
          ========================================================================= */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {(['ALL', 'FOUNDATION', 'TECHNIQUE', 'ANALYSIS'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundManager.playTab();
                  setActiveFilter(cat);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-primary-gradient text-white shadow-xs shadow-primary-gradient'
                    : 'bg-slate-100 dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1E293B]'
                }`}
              >
                {cat === 'ALL' ? 'All Modules' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing {filteredModules.length} of {modules.length} curriculum modules
          </div>
        </div>

        {/* Module Ledger Cards List */}
        <div className="space-y-3.5">
          {filteredModules.map((m, idx) => {
            const isDone = m.status === 'COMPLETED' || m.status === 'MASTERED';
            const isInProgress = m.status === 'IN_PROGRESS';
            const staggerClass = idx < 6 ? `stagger-${idx + 1}` : '';

            return (
              <div
                key={m.id}
                id={`progress-module-${m.id}`}
                className={`bg-white dark:bg-[#111827] border rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll ${staggerClass} ${
                  isDone
                    ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-blue-500/40'
                    : isInProgress
                    ? 'border-blue-300 dark:border-cyan-400/50 ring-1 ring-blue-200 dark:ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-blue-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                        {m.code}
                      </span>
                      <span className="text-xs font-semibold text-[#2563EB] dark:text-cyan-300 uppercase font-mono">
                        {m.category}
                      </span>
                      {renderStatusBadge(m.status)}
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {m.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {m.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0B1120] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 inline-block font-sans">
                      <span className="font-bold text-slate-700 dark:text-slate-200">Criteria:</span>
                      <span>{m.criteriaDescription}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-6">
                    <button
                      id={`btn-open-module-${m.id}`}
                      onClick={() => handleModuleClick(m)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                        isDone ? 'btn-modern-secondary' : 'btn-modern-primary'
                      }`}
                    >
                      <span>{isDone ? 'Review Module' : isInProgress ? 'Resume Module' : 'Start Module'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 100% Completion Certificate Modal */}
      <CompletionCelebrationModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onNavigateToLab={() => onNavigateToTab('LAB')}
        onNavigateToProgress={() => setShowCertificateModal(false)}
      />
    </div>
  );
};

export default MyProgressView;
