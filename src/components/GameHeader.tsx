import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Layers,
  CheckCircle2,
  Award,
  Flame,
  Gauge,
  Gamepad2,
  Check,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { TechniqueType, MainViewTab } from '../types/game';
export type { MainViewTab };
import { progressManager } from '../utils/progressManager';
import { soundManager } from '../utils/audio';

interface GameHeaderProps {
  activeTab: MainViewTab;
  onChangeTab: (tab: MainViewTab) => void;
  currentLevelId: number;
  score: number;
  streak: number;
  technique: TechniqueType;
  isMuted: boolean;
  onToggleMute: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  onResetLevel: () => void;
  onSelectLevel: (levelId: number) => void;
  onResetAllProgress?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  activeTab,
  onChangeTab,
  currentLevelId,
  score,
  streak,
  technique,
  isMuted,
  onToggleMute,
  speed,
  onChangeSpeed,
  onResetLevel,
  onSelectLevel,
  onResetAllProgress,
}) => {
  const [stats, setStats] = useState(progressManager.getStats());
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  useEffect(() => {
    const unsub = progressManager.subscribe(() => {
      setStats(progressManager.getStats());
    });
    return unsub;
  }, []);

  const getTechniqueBadge = () => {
    switch (technique) {
      case 'basic':
        return { code: 'TECH-01', label: 'BASIC MODULO' };
      case 'chaining':
        return { code: 'TECH-02', label: 'SEPARATE CHAINING' };
      case 'linear':
        return { code: 'TECH-03', label: 'LINEAR PROBING' };
      case 'quadratic':
        return { code: 'TECH-04', label: 'QUADRATIC PROBING' };
      case 'double_hashing':
        return { code: 'TECH-05', label: 'DOUBLE HASHING' };
    }
  };

  const techBadge = getTechniqueBadge();

  // Navigation Items Specification (Increased font & icon sizes for effortless readability)
  const NAV_ITEMS: { id: MainViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'HOME', label: 'HOME', icon: <Home className="w-4 h-4" /> },
    { id: 'THEORY', label: 'THEORY', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'GAME', label: 'GAME', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'LAB', label: 'LAB', icon: <Layers className="w-4 h-4" /> },
    { id: 'QUIZ', label: 'QUIZ', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'PROGRESS', label: 'PROGRESS', icon: <Award className="w-4 h-4" /> },
  ];

  const isGameActive = activeTab === 'GAME' || activeTab === 'QUEST';

  const handleTabClick = (tabId: MainViewTab) => {
    soundManager.playNav();
    onChangeTab(tabId);
  };

  const handleConfirmResetAll = () => {
    soundManager.playReset();
    progressManager.resetProgress();
    setStats(progressManager.getStats());
    if (onResetAllProgress) {
      onResetAllProgress();
    }
    setShowResetConfirmModal(false);
  };

  return (
    <header className="w-full bg-[#FAF6EE] border-b-2 border-[#181818] sticky top-0 z-50">
      {/* Top Thin Editorial Masthead Bar */}
      <div className="bg-[#181818] text-[#FAF6EE] px-4 sm:px-6 py-1 text-[11px] font-mono tracking-widest flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[#E85A1D] font-bold">FIELD NOTES // DSA SERIES</span>
          <span className="hidden sm:inline text-white/50">VOL. 01: HASH FUNCTIONS & RESOLUTIONS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60">EDITION 2026.1</span>
          <span className="text-[#E85A1D] font-bold">
            {stats.completed}/{stats.total} COMPLETED ({stats.percentage}%)
          </span>
        </div>
      </div>

      {/* Main Brand Title Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div
            onClick={() => handleTabClick('HOME')}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#E85A1D] text-white border-2 border-[#181818] shadow-[2px_2px_0px_#181818] flex items-center justify-center font-display font-extrabold text-lg sm:text-xl cursor-pointer select-none"
          >
            #
          </div>
          <div className="flex items-center gap-2">
            <h1
              onClick={() => handleTabClick('HOME')}
              className="text-lg sm:text-xl lg:text-[22px] font-extrabold font-display text-[#181818] tracking-[0.02em] cursor-pointer leading-none"
            >
              HASH QUEST
            </h1>
            <span className="text-[10px] font-mono font-medium tracking-[0.04em] px-1.5 py-0.5 bg-[#ECE5D8] border border-[#181818]/20 text-[#66625B]">
              FIELD GUIDE // VOL. 01
            </span>
          </div>
        </div>
      </div>

      {/* Whole Navigation & Controls Bar Placed Below HASH QUEST Text */}
      <div className="border-t border-[#181818]/15 bg-[#FAF6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar whitespace-nowrap font-mono">
          {/* Primary Navigation Tabs - Quiet & Systematic */}
          <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0 font-mono">
            {NAV_ITEMS.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === 'GAME' && activeTab === 'QUEST') ||
                (item.id === 'QUEST' && activeTab === 'GAME');
              return (
                <button
                  key={item.id}
                  id={`tab-btn-${item.id.toLowerCase()}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-[12.5px] font-semibold uppercase tracking-[0.04em] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#181818] font-bold'
                      : 'text-[#66625B] hover:text-[#181818] hover:bg-[#ECE5D8]/60'
                  }`}
                >
                  {item.icon}
                  <span className="leading-none">{item.label}</span>
                  {/* Active Indicator: Thin orange underline & small dot */}
                  {isActive && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E85A1D] -ml-0.5" />
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#E85A1D]" />
                    </>
                  )}
                  {item.id === 'PROGRESS' && (
                    <span className="text-[10px] bg-[#181818] text-[#FAF6EE] px-1.5 py-0.5 font-bold rounded-xs">
                      {stats.percentage}%
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Streak, Speed, Sound, Reset 0%, Reset Level (Quiet Metadata) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#ECE5D8] border border-[#181818]/30 text-[#E85A1D] text-[11px] font-mono font-semibold">
                <Flame className="w-3 h-3 fill-[#E85A1D]" />
                <span>{streak}x</span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={() => {
                onToggleMute();
              }}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-1 bg-[#FAF6EE] border border-[#181818]/30 text-[#66625B] hover:text-[#181818] hover:bg-[#ECE5D8] cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#66625B]" /> : <Volume2 className="w-3.5 h-3.5 text-[#E85A1D]" />}
            </button>

            {/* Reset Whole Progress to 0 Button */}
            <button
              id="btn-reset-all-progress"
              onClick={() => setShowResetConfirmModal(true)}
              title="Reset whole progress to 0"
              aria-label="Reset whole progress to 0"
              className="p-1 px-1.5 bg-[#FAF6EE] border border-[#181818]/30 text-[#66625B] hover:bg-red-50 hover:text-red-600 text-[11px] font-mono font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-red-600" />
              <span>0%</span>
            </button>

            {/* Reset Level (if in GAME mode) */}
            {isGameActive && (
              <button
                id="btn-reset-level"
                onClick={() => {
                  soundManager.playReset();
                  onResetLevel();
                }}
                title="Restart Current Level"
                className="p-1 bg-[#FAF6EE] border border-[#181818]/30 text-[#66625B] hover:text-[#181818] hover:bg-[#ECE5D8] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Reset All Progress to 0 */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF6EE] border-2 border-[#181818] p-6 max-w-md w-full shadow-[6px_6px_0px_#181818] font-mono space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-wider">
              <RotateCcw className="w-5 h-5" />
              <span>RESET WHOLE PROGRESS TO 0%</span>
            </div>
            <p className="text-xs sm:text-sm text-[#181818] leading-relaxed">
              Are you sure you want to reset all progress? This will permanently clear all field notes completion, reset completed quest levels, clear quiz records, and reset your mastery progress.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 border border-[#181818] text-xs font-bold uppercase tracking-wider hover:bg-[#ECE5D8] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                id="btn-confirm-reset-all"
                onClick={handleConfirmResetAll}
                className="px-4 py-2 bg-red-600 text-white border border-[#181818] text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#181818] hover:bg-red-700 cursor-pointer"
              >
                CONFIRM RESET (0%)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-bar: Level Selectors & Technique Info if in GAME mode */}
      {isGameActive && (
        <div className="border-t border-[#181818]/15 bg-[#ECE5D8] px-4 sm:px-6 py-1.5 overflow-x-auto flex items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-bold text-[#66625B] uppercase mr-1">LEVELS:</span>
            {[1, 2, 3, 4, 5].map((lvl) => {
              const isCompleted = progressManager.getState().levelsCompleted.includes(lvl);
              return (
                <button
                  key={lvl}
                  id={`btn-nav-level-${lvl}`}
                  onClick={() => {
                    soundManager.playTab();
                    onSelectLevel(lvl);
                  }}
                  className={`px-2.5 py-0.5 text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                    currentLevelId === lvl
                      ? 'bg-[#181818] text-[#FAF6EE] border-[#181818] shadow-[1.5px_2px_0px_#181818]'
                      : isCompleted
                      ? 'bg-[#FAF6EE] text-[#181818] border-[#181818]/40'
                      : 'bg-[#ECE5D8] text-[#66625B] border-[#181818]/15 hover:bg-[#FAF6EE]'
                  }`}
                >
                  <span>{lvl}.</span>
                  <span>{lvl === 1 ? 'Basic' : lvl === 2 ? 'Chaining' : lvl === 3 ? 'Linear' : lvl === 4 ? 'Quadratic' : 'Double'}</span>
                  {isCompleted && <Check className="w-3 h-3 text-[#E85A1D] stroke-[3]" />}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#181818]">
            <span className="px-1.5 py-0.2 bg-[#E85A1D] text-white font-bold text-[10px]">
              {techBadge.code}
            </span>
            <span className="font-bold">{techBadge.label}</span>
          </div>
        </div>
      )}
    </header>
  );
};
