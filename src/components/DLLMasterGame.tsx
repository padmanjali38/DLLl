import React, { useState, useEffect } from 'react';
import { DLLGameLanding } from './game/DLLGameLanding';
import { DLLArenaWorkspaceView } from './game/DLLArenaWorkspaceView';
import { DLLTopNavHeader } from './game/DLLTopNavHeader';
import { DLL_ARENA_LEVELS } from '../data/dllArenaLevelsData';
import { progressManager } from '../utils/progressManager';
import { soundManager } from '../utils/audio';
import { AlertCircle } from 'lucide-react';

interface DLLMasterGameProps {
  onOpenTheory?: () => void;
  onOpenQuiz?: () => void;
}

export const DLLMasterGame: React.FC<DLLMasterGameProps> = ({
  onOpenTheory,
  onOpenQuiz,
}) => {
  // Navigation / View Modes: 'normal_play' (default workspace) | 'landing' | 'guided_solve'
  const [currentView, setCurrentView] = useState<'landing' | 'normal_play' | 'guided_solve'>('normal_play');
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('arena-l1-t1');
  const [initialGuidedMode, setInitialGuidedMode] = useState<boolean>(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Completed Tasks & Completed Levels
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dsa_game_completed_tasks_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedLevelNumbers, setCompletedLevelNumbers] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('dsa_game_completed_levels_v2');
      if (saved) return JSON.parse(saved);
      const pState = progressManager.getState().levelsCompleted || [];
      return pState.length > 0 ? pState : [];
    } catch {
      return [];
    }
  });

  // Total XP
  const [totalXp, setTotalXp] = useState<number>(() => {
    return progressManager.getState().totalScore || 0;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dsa_game_completed_tasks_v1', JSON.stringify(completedTaskIds));
      localStorage.setItem('dsa_game_completed_levels_v2', JSON.stringify(completedLevelNumbers));
    } catch {
      // ignore
    }
  }, [completedTaskIds, completedLevelNumbers]);

  const handleLockedClick = (requiredLevel: number) => {
    soundManager.playError();
    setLockedNotice(`Level ${requiredLevel + 1} is locked. Complete Level ${requiredLevel} first to unlock!`);
    setTimeout(() => {
      setLockedNotice(null);
    }, 3500);
  };

  // Handler: Select and Play a Task
  const handlePlayTask = (taskId: string, levelId?: number) => {
    soundManager.playClick();
    setSelectedTaskId(taskId);
    if (levelId) setSelectedLevelNumber(levelId);
    setInitialGuidedMode(false);
    setCurrentView('normal_play');
  };

  // Handler: Play a Level
  const handlePlayLevel = (levelNum: number) => {
    soundManager.playClick();
    setSelectedLevelNumber(levelNum);
    const targetLevel = DLL_ARENA_LEVELS.find((l) => l.id === levelNum) || DLL_ARENA_LEVELS[0];
    if (targetLevel.tasks.length > 0) {
      setSelectedTaskId(targetLevel.tasks[0].id);
    }
    setInitialGuidedMode(false);
    setCurrentView('normal_play');
  };

  // Handler: Task Completed
  const handleTaskCompleted = (taskId: string, earnedXp: number) => {
    if (!completedTaskIds.includes(taskId)) {
      const updatedTasks = [...completedTaskIds, taskId];
      setCompletedTaskIds(updatedTasks);
      setTotalXp((prev) => prev + earnedXp);
      progressManager.markLevelCompleted(selectedLevelNumber, earnedXp, true);

      // Check if all tasks in active level are completed
      const currentLevelDef =
        DLL_ARENA_LEVELS.find((l) => l.id === selectedLevelNumber) || DLL_ARENA_LEVELS[0];
      const allTasksInLevelDone = currentLevelDef.tasks.every((t) =>
        updatedTasks.includes(t.id)
      );

      if (allTasksInLevelDone && !completedLevelNumbers.includes(selectedLevelNumber)) {
        setCompletedLevelNumbers((prev) => [...prev, selectedLevelNumber]);
      }
    }
  };

  // Active level definition for normal/guided views
  const activeLevelDef =
    DLL_ARENA_LEVELS.find((l) => l.id === selectedLevelNumber) || DLL_ARENA_LEVELS[0];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Modern Navigation Header with 5 Level Tabs (Photo 3) */}
      <DLLTopNavHeader
        selectedLevel={selectedLevelNumber}
        completedLevelNumbers={completedLevelNumbers}
        totalXp={totalXp}
        currentView={currentView}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          soundManager.setMuted(next);
        }}
        onSelectLevel={(lvl) => handlePlayLevel(lvl)}
        onToggleView={(view) => {
          soundManager.playClick();
          setCurrentView(view);
        }}
        onLockedClick={handleLockedClick}
      />

      {/* Floating Locked Notice Toast */}
      {lockedNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-bold flex items-center gap-3 shadow-md animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* 1. LANDING SCREEN: Level 01 Header (Photo 3) + 4 Task Cards Grid (Photo 2) */}
      {currentView === 'landing' && (
        <DLLGameLanding
          completedLevelNumbers={completedLevelNumbers}
          completedTaskIds={completedTaskIds}
          totalXp={totalXp}
          activeLevelId={selectedLevelNumber}
          onSelectLevel={(lvl) => setSelectedLevelNumber(lvl)}
          onPlayTask={handlePlayTask}
          onPlayLevel={handlePlayLevel}
        />
      )}

      {/* 2. INTERACTIVE GAMEPLAY SCREEN: RAM Heap Workspace + Task Details (Photo 1) */}
      {(currentView === 'normal_play' || currentView === 'guided_solve') && (
        <DLLArenaWorkspaceView
          level={activeLevelDef}
          taskId={selectedTaskId}
          initialGuidedMode={initialGuidedMode || currentView === 'guided_solve'}
          completedTaskIds={completedTaskIds}
          onBackToLevels={() => {
            soundManager.playClick();
            setInitialGuidedMode(false);
            setCurrentView('landing');
          }}
          onTaskCompleted={handleTaskCompleted}
          onSelectTask={(newTaskId) => {
            setSelectedTaskId(newTaskId);
          }}
          onNextLevel={(nextLevelNum) => {
            handlePlayLevel(nextLevelNum);
          }}
        />
      )}
    </div>
  );
};
