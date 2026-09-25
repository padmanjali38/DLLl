import React from 'react';
import {
  Play,
  Lightbulb,
  Lock,
  CheckCircle2,
  Sparkles,
  Link,
  ArrowLeftRight,
  Layers,
  Box,
  PlusCircle,
  CornerDownRight,
  Split,
  Trash2,
  Scissors,
} from 'lucide-react';
import { DLLLevelConfig } from '../../data/dllGameLevelsConfig';

interface DLLGameCardProps {
  level: DLLLevelConfig;
  isUnlocked: boolean;
  isCompleted: boolean;
  onPlayLevel: (levelNumber: number) => void;
  onGuidedSolve: (levelNumber: number) => void;
  onLockedClick: (requiredLevel: number) => void;
}

export const DLLGameCard: React.FC<DLLGameCardProps> = ({
  level,
  isUnlocked,
  isCompleted,
  onPlayLevel,
  onGuidedSolve,
  onLockedClick,
}) => {
  const renderIcon = () => {
    switch (level.iconName) {
      case 'Link':
        return <Link className="w-4 h-4 text-indigo-600" />;
      case 'Box':
        return <Box className="w-4 h-4 text-indigo-600" />;
      case 'ArrowLeftRight':
        return <ArrowLeftRight className="w-4 h-4 text-indigo-600" />;
      case 'Split':
        return <Split className="w-4 h-4 text-indigo-600" />;
      case 'PlusCircle':
        return <PlusCircle className="w-4 h-4 text-indigo-600" />;
      case 'CornerDownRight':
        return <CornerDownRight className="w-4 h-4 text-indigo-600" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'Trash2':
        return <Trash2 className="w-4 h-4 text-indigo-600" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4 text-indigo-600" />;
      default:
        return <Link className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getCodeSnippet = (): string => {
    if (level.preview) return level.preview;
    return 'Node* newNode = (Node*)malloc(sizeof(Node));';
  };

  const handleCardClick = () => {
    if (!isUnlocked) {
      onLockedClick(level.level - 1);
    }
  };

  return (
    <div
      id={`dll-task-card-${level.level}`}
      onClick={handleCardClick}
      className={`bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 border ${
        isUnlocked
          ? 'border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md'
          : 'border-slate-200/80 bg-slate-50/50 opacity-80 cursor-not-allowed'
      }`}
    >
      <div>
        {/* Top Row: Icon + Task # Pill on left, XP Badge on right (Photo 2) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0">
              {renderIcon()}
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
              Task #{level.level}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Done</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold border border-indigo-100">
              +{level.xp} XP
            </span>
          </div>
        </div>

        {/* Title (Photo 2) */}
        <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-4 mb-2">
          {level.cardTitle || level.title}
        </h4>

        {/* Description (Photo 2) */}
        <p className="text-sm text-slate-500 leading-relaxed min-h-[44px]">
          {level.goal || level.description}
        </p>

        {/* Dark Code Box (Photo 2) */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#0B132B] font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre border border-slate-800 font-medium leading-relaxed">
          <code>{getCodeSnippet()}</code>
        </div>
      </div>

      {/* Bottom Button Row (Photo 2) */}
      <div className="mt-5 pt-2">
        {isUnlocked ? (
          <div className="flex items-center gap-2">
            <button
              id={`btn-play-task-${level.level}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlayLevel(level.level);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Task</span>
            </button>

            <button
              id={`btn-guided-solve-${level.level}`}
              onClick={(e) => {
                e.stopPropagation();
                onGuidedSolve(level.level);
              }}
              className="px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              title="Step-by-step Guided Solve"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Unlock after Task #{level.level - 1}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLockedClick(level.level - 1);
              }}
              className="font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Go to #{level.level - 1}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
