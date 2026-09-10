import React, { useState, useEffect } from 'react';
import { DLL_LEVELS, DLLLevel, DLLTask } from './game/dllGameData';
import { DLLLevelSelectScreen } from './game/DLLLevelSelectScreen';
import { DLLTaskSelectScreen } from './game/DLLTaskSelectScreen';
import { DLLInteractiveTaskWorkspace } from './game/DLLInteractiveTaskWorkspace';
import { progressManager } from '../utils/progressManager';

interface DLLMasterGameProps {
  onOpenTheory?: () => void;
  onOpenQuiz?: () => void;
}

const STORAGE_COMPLETED_TASKS_KEY = 'dll_master_game_completed_tasks_v4';

export const DLLMasterGame: React.FC<DLLMasterGameProps> = () => {
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

  // Persist completed task IDs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPLETED_TASKS_KEY, JSON.stringify(completedTaskIds));
    } catch {
      // ignore storage error
    }
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

  // Handle task solved
  const handleTaskSolved = (taskId: string, xpAwarded: number) => {
    const isNewlyCompleted = !completedTaskIds.includes(taskId);

    if (isNewlyCompleted) {
      const updated = [...completedTaskIds, taskId];
      setCompletedTaskIds(updated);

      // Award XP
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
          task={selectedTask}
          isAlreadyCompleted={completedTaskIds.includes(selectedTask.id)}
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
