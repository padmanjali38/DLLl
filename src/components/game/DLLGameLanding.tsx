import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowLeftRight,
  AlertCircle,
} from 'lucide-react';
import { DLL_ARENA_LEVELS } from '../../data/dllArenaLevelsData';
import { TaskCardGrid } from './TaskCardGrid';
import { soundManager } from '../../utils/audio';

interface DLLGameLandingProps {
  completedLevelNumbers?: number[];
  completedTaskIds?: string[];
  totalXp?: number;
  activeLevelId?: number;
  onSelectLevel?: (levelNumber: number) => void;
  onPlayTask: (taskId: string, levelId?: number) => void;
  onPlayLevel?: (levelNumber: number) => void;
  onGuidedSolve?: (levelNumber: number) => void;
}

export const DLLGameLanding: React.FC<DLLGameLandingProps> = ({
  completedLevelNumbers = [],
  completedTaskIds = [],
  totalXp = 0,
  activeLevelId = 1,
  onSelectLevel,
  onPlayTask,
  onPlayLevel,
  onGuidedSolve,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(activeLevelId || 1);

  React.useEffect(() => {
    if (activeLevelId && activeLevelId !== selectedLevelId) {
      setSelectedLevelId(activeLevelId);
    }
  }, [activeLevelId]);

  const handleLevelSelect = (lvlId: number | 'all') => {
    soundManager.playClick();
    if (typeof lvlId === 'number') {
      setSelectedLevelId(lvlId);
      if (onSelectLevel) onSelectLevel(lvlId);
    }
  };

  const handlePlayTask = (taskId: string, levelId?: number) => {
    soundManager.playClick();
    onPlayTask(taskId, levelId || selectedLevelId);
  };

  return (
    <div id="dll-game-landing-screen" className="flex flex-col gap-6 w-full">
      {/* Renders exact Reference Level Header & Task Cards Grid */}
      <TaskCardGrid
        levels={DLL_ARENA_LEVELS}
        activeLevelId={selectedLevelId}
        onSelectLevel={handleLevelSelect}
        activeTaskId=""
        onPlayTask={handlePlayTask}
        completedTaskIds={completedTaskIds}
        completedLevelNumbers={completedLevelNumbers}
      />
    </div>
  );
};
