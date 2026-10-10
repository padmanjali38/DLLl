import React, { useState, useEffect } from 'react';
import { DLL_LEVELS, DLLLevel, DLLTask } from './game/dllGameData';
import { DLLLevelSelectScreen } from './game/DLLLevelSelectScreen';
import { DLLTaskSelectScreen } from './game/DLLTaskSelectScreen';
import { DLLInteractiveTaskWorkspace } from './game/DLLInteractiveTaskWorkspace';
import { progressManager } from '../utils/progressManager';
import { pointsManager } from '../utils/pointsManager';
import { soundManager } from '../utils/audio';

interface DLLMasterGameProps {
  onOpenTheory?: () => void;
  onOpenQuiz?: () => void;
  resetTrigger?: number;
}

const STORAGE_COMPLETED_TASKS_KEY = 'dll_master_game_completed_tasks_v4';

export const DLLMasterGame: React.FC<DLLMasterGameProps> = ({
  onOpenTheory,
  onOpenQuiz,
  resetTrigger,
}) => {
  // Screen views: 'levels' (Screen 1) | 'tasks' (Screen 2) | 'workspace' (Screen 3)
  const [currentScreen, setCurrentScreen] = useState<'levels' | 'tasks' | 'workspace'>('levels');

  // Active level and task selections
  const [selectedLevel, setSelectedLevel] = useState<DLLLevel>(DLL_LEVELS[0]);
  const [selectedTask, setSelectedTask] = useState<DLLTask>(DLL_LEVELS[0].tasks[0]);

  // Total XP from progress manager
  const [totalXP, setTotalXP] = useState<number>(() => progressManager.getTotalScore());

  // Completed task IDs persisted in localStorage
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COMPLETED_TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Key to force clean remount of the workspace
  const [workspaceKey, setWorkspaceKey] = useState<number>(0);

  // Synchronize when external resetTrigger fires (e.g. from global App reset)
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      try {
        localStorage.removeItem(STORAGE_COMPLETED_TASKS_KEY);
        localStorage.removeItem('dsa_game_completed_tasks_v1');
      } catch {
        // ignore
      }
      setCompletedTaskIds([]);
      setTotalXP(0);
      setCurrentScreen('levels');
      setSelectedLevel(DLL_LEVELS[0]);
      setSelectedTask(DLL_LEVELS[0].tasks[0]);
      setWorkspaceKey((k) => k + 1);
    }
  }, [resetTrigger]);

  // Persist completed task IDs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPLETED_TASKS_KEY, JSON.stringify(completedTaskIds));
    } catch {
      // ignore storage error
    }

    // Ensure any fully completed level is marked in progressManager
    DLL_LEVELS.forEach((level) => {
      const isLevelComplete = level.tasks.length > 0 && level.tasks.every((t) => completedTaskIds.includes(t.id));
      if (isLevelComplete) {
        const state = progressManager.getState();
        if (!state.levelsCompleted?.includes(level.number)) {
          progressManager.markLevelCompleted(level.number, 50, true);
        }
      }
    });
  }, [completedTaskIds]);

  // Sync totalXP
  const refreshXP = () => {
    setTotalXP(progressManager.getTotalScore());
  };

  // ---------------------------------------------------------------------------
  // Navigation Handlers
  // ---------------------------------------------------------------------------
  // Screen 1 -> Screen 2
  const handleSelectLevel = (level: DLLLevel) => {
    setSelectedLevel(level);
    setCurrentScreen('tasks');
  };

  // Screen 2 -> Screen 1
  const handleBackToLevels = () => {
    setCurrentScreen('levels');
  };

  // Screen 2 -> Screen 3
  const handleSelectTask = (task: DLLTask) => {
    setSelectedTask(task);
    setCurrentScreen('workspace');
  };

  // Screen 3 -> Screen 2
  const handleBackToTasks = () => {
    setCurrentScreen('tasks');
  };

  // Handle task solved: award +6 raw points in persistent scoring system
  const handleTaskSolved = (taskId: string, xpAwarded: number) => {
    const isNewlyCompleted = !completedTaskIds.includes(taskId);

    if (isNewlyCompleted) {
      const updated = [...completedTaskIds, taskId];
      setCompletedTaskIds(updated);

      // Award +6 raw points in persistent scoring system
      progressManager.recordGameTaskCompleted('dll', taskId);
      pointsManager.recordEvent('GAME_TASK_COMPLETED', taskId, { taskId });
      progressManager.addScore(xpAwarded);
      refreshXP();

      // Check if all tasks for the current level are now completed
      const allLevelTasksCompleted = selectedLevel.tasks.every(
        (t) => t.id === taskId || updated.includes(t.id)
      );
      if (allLevelTasksCompleted) {
        progressManager.markLevelCompleted(selectedLevel.number, 50, true);
      }
    }
  };

  // Move to next task in the level if available
  const handleNextTask = () => {
    const currentIndex = selectedLevel.tasks.findIndex((t) => t.id === selectedTask.id);
    if (currentIndex >= 0 && currentIndex < selectedLevel.tasks.length - 1) {
      setSelectedTask(selectedLevel.tasks[currentIndex + 1]);
    } else {
      // All tasks completed in this level, return to tasks screen
      soundManager.playLevelComplete();
      setCurrentScreen('tasks');
    }
  };

  return (
    <div id="game-section" className="w-full min-h-[560px] py-2 sm:py-4">
      {/* SCREEN 1: LEVEL SELECTION */}
      {currentScreen === 'levels' && (
        <DLLLevelSelectScreen
          completedTaskIds={completedTaskIds}
          totalXP={totalXP}
          onSelectLevel={handleSelectLevel}
        />
      )}

      {/* SCREEN 2: TASK SELECTION */}
      {currentScreen === 'tasks' && (
        <DLLTaskSelectScreen
          level={selectedLevel}
          completedTaskIds={completedTaskIds}
          onBackToLevels={handleBackToLevels}
          onSelectTask={handleSelectTask}
        />
      )}

      {/* SCREEN 3: INTERACTIVE WORKSPACE */}
      {currentScreen === 'workspace' && (
        <DLLInteractiveTaskWorkspace
          key={`task-workspace-${selectedTask.id}-${workspaceKey}`}
          task={selectedTask}
          isAlreadyCompleted={completedTaskIds.includes(selectedTask.id)}
          isFinalTask={
            selectedLevel.tasks.findIndex((t) => t.id === selectedTask.id) ===
            selectedLevel.tasks.length - 1
          }
          onBackToTasks={handleBackToTasks}
          onTaskSolved={handleTaskSolved}
          onNextTask={handleNextTask}
        />
      )}
    </div>
  );
};

export const GameSection = DLLMasterGame;
export default DLLMasterGame;
