import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Trophy,
  Gamepad2,
  Video,
  Award,
  HelpCircle,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { UserProgressState, MainViewTab } from '../types/game';
import { TopicScoreSummary } from '../types/scoring';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CompletionCelebrationModal } from './CompletionCelebrationModal';
import { soundManager } from '../utils/audio';

interface MyProgressViewProps {
  onNavigateToTab: (tab: MainViewTab, levelId?: number, chapterId?: string) => void;
}

export const MyProgressView: React.FC<MyProgressViewProps> = ({ onNavigateToTab }) => {
  useScrollReveal();
  const selectedTopicId = 'dll';
  const [, setProgressState] = useState<UserProgressState>(progressManager.getState());
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  useEffect(() => {
    progressManager.checkAndCompleteCertification();
    const unsubscribe = progressManager.subscribe((state) => {
      setProgressState(state);
    });
    return unsubscribe;
  }, []);

  const summary: TopicScoreSummary = progressManager.getTopicScoreSummary(selectedTopicId);
  const is100Percent = summary.completionPercentage === 100;

  const formatPoints = (pts: number) => {
    return Math.round(pts * 10) / 10;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans text-slate-900 dark:text-white animate-page-enter pb-24">
      {/* =========================================================================
          A. TOPIC HEADER AND OVERALL COMPLETION (Matching Reference Screenshot)
          Sole Topic: Doubly Linked List
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-[#2563EB] dark:text-blue-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-blue-400" />
              <span>DSA Curriculum Progress</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Doubly Linked List Learning Progress
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
                  You have successfully finished all learning activities for Doubly Linked List.
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
          B. TOPIC SCORE CARD (Matching Reference Screenshot)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Doubly Linked List Topic Score
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Calculated from eligible activities and recorded deductions.
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800 px-5 py-3.5 rounded-2xl shadow-xs self-start sm:self-auto">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] dark:text-blue-400 font-mono">
              {formatPoints(summary.earnedScore)}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 font-mono">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          C. THREE COMPETITION-SCORING SECTION CARDS (VISUALIZE, GAME, QUIZ)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. VISUALIZE CARD */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between reveal-on-scroll">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visualize
              </span>
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
                <Video className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                {formatPoints(summary.sections.visualize.earnedPoints)} / {formatPoints(summary.sections.visualize.pointBudget)}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5 font-mono">
                Points
              </div>
            </div>

            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              {summary.sections.visualize.completedCount} / {summary.sections.visualize.eligibleCount} videos completed
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Full video completion required (+8 raw each)
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                soundManager.playNav();
                onNavigateToTab('VIDEO');
              }}
              className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. GAME CARD */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between reveal-on-scroll stagger-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Game
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                <Gamepad2 className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                {formatPoints(summary.sections.game.earnedPoints)} / {formatPoints(summary.sections.game.pointBudget)}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5 font-mono">
                Points
              </div>
            </div>

            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              {summary.sections.game.completedCount} / {summary.sections.game.eligibleCount} tasks solved
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Unique task solves (+6 raw each, deductions recorded)
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                soundManager.playNav();
                onNavigateToTab('GAME', 1);
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Play Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. QUIZ CARD */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between reveal-on-scroll stagger-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quiz
              </span>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight leading-none">
                {formatPoints(summary.sections.quiz.earnedPoints)} / {formatPoints(summary.sections.quiz.pointBudget)}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5 font-mono">
                Points
              </div>
            </div>

            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              {summary.sections.quiz.completedCount} / {summary.sections.quiz.eligibleCount} questions completed
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Timed evaluation (+3 correct, -1 wrong, 0 timeout)
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                soundManager.playNav();
                onNavigateToTab('QUIZ');
              }}
              className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Take Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
