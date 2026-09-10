import React, { useState, useEffect } from 'react';
import { GameState, LevelConfig, ProbeStep, TableSlot, TechniqueType } from './types/game';
import { GAME_LEVELS } from './data/levels';
import {
  calculateBaseHash,
  calculateH2,
  computeDoubleHashSequence,
  computeLinearProbeSequence,
  computeQuadraticProbeSequence,
} from './utils/hashAlgorithms';
import { soundManager } from './utils/audio';
import { MainViewTab } from './types/game';
import { SidebarNav } from './components/SidebarNav';
import { TopHeader } from './components/TopHeader';
import { HomePage } from './components/HomePage';
import { CurrentKeyCard } from './components/CurrentKeyCard';
import { HashTable } from './components/HashTable';
import { ProbingController } from './components/ProbingController';
import { ExplanationPanel } from './components/ExplanationPanel';
import { CollisionModal } from './components/CollisionModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { SandboxMode } from './components/SandboxMode';
import { LearnHashingSection } from './components/LearnHashingSection';
import { VideoTutorialsView } from './components/VideoTutorialsView';
import { MyProgressView } from './components/MyProgressView';
import { QuizView } from './components/QuizView';
import { QuestCompletionView } from './components/QuestCompletionView';
import { FieldNotesBackground } from './components/FieldNotesBackground';
import { GameHintCard } from './components/GameHintCard';
import { GameLevelGuide } from './components/GameLevelGuide';
import { CompletionCelebrationModal } from './components/CompletionCelebrationModal';
import { ResetProgressModal } from './components/ResetProgressModal';
import { AIBotFloatingButton } from './components/AIBotFloatingButton';
import { DLLMasterGame } from './components/DLLMasterGame';
import { Sparkles } from 'lucide-react';
import { progressManager } from './utils/progressManager';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  // Navigation View State (Defaults to GAME for DLL Interactive Arena)
  const [activeTab, setActiveTab] = useState<MainViewTab>('GAME');
  const [activeTheoryTopic, setActiveTheoryTopic] = useState<string>('what-is-hashing');
  const [show100Celebration, setShow100Celebration] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setDesktopSidebarOpen((prev) => !prev);
    }
  };

  // Close sidebar on outside click across desktop and mobile
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      const isSidebarOpen = isDesktop ? desktopSidebarOpen : mobileSidebarOpen;
      if (!isSidebarOpen) return;

      const isInsideSidebar = target.closest('#app-sidebar-container') || target.closest('#app-sidebar-navigation');
      const isToggleButton = target.closest('#btn-sidebar-toggle');

      if (!isInsideSidebar && !isToggleButton) {
        if (isDesktop) {
          setDesktopSidebarOpen(false);
        } else {
          setMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [desktopSidebarOpen, mobileSidebarOpen]);

  // Game Configuration State
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    const state = progressManager.getState();
    return state.levelsCompleted;
  });
  const [score, setScore] = useState<number>(() => {
    return progressManager.getState().totalScore;
  });
  const [streak, setStreak] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Trigger scroll-to-reveal animations on tab and level changes
  useScrollReveal([activeTab, currentLevelIndex]);

  // Monitor for progress updates and 100% completion event across the application
  useEffect(() => {
    const syncProgress = () => {
      const stats = progressManager.getStats();
      const state = progressManager.getState();
      setCompletedLevels([...state.levelsCompleted]);
      setScore(state.totalScore);
      if (stats.percentage === 100 && !state.hasCelebrated100Percent) {
        setShow100Celebration(true);
        progressManager.setCelebrationAcknowledged();
      }
    };

    syncProgress();
    const unsubscribe = progressManager.subscribe(() => {
      syncProgress();
    });
    return unsubscribe;
  }, []);

  // Strict 5/5 game completion status
  const isAllLevelsCompleted = [1, 2, 3, 4, 5].every(
    (lvl) => completedLevels.includes(lvl) || progressManager.getState().levelsCompleted.includes(lvl)
  );

  // Guard against direct access to completion (Level 6) before all 5 levels are completed
  useEffect(() => {
    if (currentLevelIndex >= 5 && !isAllLevelsCompleted) {
      const safeIndex = Math.min(completedLevels.length, 4);
      setCurrentLevelIndex(safeIndex);
      initLevel(safeIndex);
    }
  }, [currentLevelIndex, isAllLevelsCompleted, completedLevels]);

  // Active Level State
  const currentLevel: LevelConfig = GAME_LEVELS[Math.min(currentLevelIndex, 4)] || GAME_LEVELS[0];
  const [slots, setSlots] = useState<TableSlot[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({
      index: i,
      items: [],
      status: 'idle',
    }))
  );
  const [keySequenceIndex, setKeySequenceIndex] = useState<number>(0);
  const [currentKey, setCurrentKey] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [calculatedIndex, setCalculatedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Collision & Probing State
  const [collidedSlotIndex, setCollidedSlotIndex] = useState<number | null>(null);
  const [collidingExistingKey, setCollidingExistingKey] = useState<number | null>(null);
  const [probeSteps, setProbeSteps] = useState<ProbeStep[]>([]);
  const [currentProbeStepIndex, setCurrentProbeStepIndex] = useState<number>(0);
  const [isProbing, setIsProbing] = useState<boolean>(false);

  // Modals & Interactive Overlays
  const [showCollisionModal, setShowCollisionModal] = useState<boolean>(false);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState<boolean>(false);

  // Sandbox pre-configuration
  const [sandboxTechnique, setSandboxTechnique] = useState<TechniqueType>('linear');

  // Initialize level
  const initLevel = (levelIdx: number, customKeys?: number[], customTechnique?: TechniqueType) => {
    const lvl = GAME_LEVELS[levelIdx] || GAME_LEVELS[0];
    const size = lvl.tableSize || 10;

    setSlots(
      Array.from({ length: size }, (_, i) => ({
        index: i,
        items: [],
        status: 'idle',
      }))
    );
    setKeySequenceIndex(0);
    const keys = customKeys || lvl.keysSequence;
    const firstKey = keys[0] ?? null;
    setCurrentKey(firstKey);
    setCalculatedIndex(null);
    setTargetIndex(null);
    setCollidedSlotIndex(null);
    setCollidingExistingKey(null);
    setProbeSteps([]);
    setCurrentProbeStepIndex(0);
    setIsProbing(false);
    setShowCollisionModal(false);
    setShowLevelCompleteModal(false);
    setGameState('KEY_APPEARS');

    if (firstKey !== null) {
      soundManager.playKeyAppear();
    }
  };

  // Level effect
  useEffect(() => {
    if (activeTab === 'GAME' || activeTab === 'QUEST') {
      initLevel(currentLevelIndex);
    }
  }, [currentLevelIndex, activeTab]);

  // Subscribe to progress manager
  useEffect(() => {
    const unsub = progressManager.subscribe((pState) => {
      setCompletedLevels(pState.levelsCompleted);
      setScore(pState.totalScore);
    });
    return () => unsub();
  }, []);

  // Handle calculation
  const performCalculation = (keyVal: number | string) => {
    setIsCalculating(true);
    const numKey = Number(keyVal);
    const m = Number(currentLevel.tableSize);
    const hash = calculateBaseHash(numKey, m);
    setCalculatedIndex(hash);
    setTargetIndex(hash);
    setIsCalculating(false);
    setGameState('INDEX_FOUND');
    soundManager.playCalcSuccess();
    setScore((s) => s + 10);
    setStreak((st) => st + 1);
  };

  const handleManualModulusSubmit = (userAnswer: number | string): boolean => {
    if (currentKey === null) return false;
    const numAns = Number(userAnswer);
    const numKey = Number(currentKey);
    const m = Number(currentLevel.tableSize);
    const correctHash = calculateBaseHash(numKey, m);
    if (numAns === correctHash) {
      setCalculatedIndex(correctHash);
      setTargetIndex(correctHash);
      setGameState('INDEX_FOUND');
      soundManager.playCalcSuccess();
      setScore((s) => s + 15);
      setStreak((st) => st + 1);
      return true;
    } else {
      soundManager.playError();
      setStreak(0);
      return false;
    }
  };

  // Drag handlers
  const handleDragStart = () => {
    if (calculatedIndex !== null && gameState === 'INDEX_FOUND') {
      soundManager.playDragStart();
      setGameState('DRAGGING');
    }
  };

  const handleDragEnd = () => {
    if (gameState === 'DRAGGING') {
      setGameState('INDEX_FOUND');
    }
  };

  // Cell interaction & Placement
  const handleCellClick = (cellIndex: number) => {
    if (gameState === 'INDEX_FOUND' || gameState === 'DRAGGING') {
      if (currentKey === null) return;
      const expectedHash = calculateBaseHash(currentKey, currentLevel.tableSize);
      if (cellIndex === expectedHash) {
        placeKeyInSlot(cellIndex);
      } else {
        soundManager.playDropInvalid();
      }
    }
  };

  const handleDropOnCell = (cellIndex: number) => {
    if (gameState === 'INDEX_FOUND' || gameState === 'DRAGGING') {
      if (currentKey === null) return;
      const expectedHash = calculateBaseHash(currentKey, currentLevel.tableSize);
      if (cellIndex === expectedHash) {
        placeKeyInSlot(cellIndex);
      } else {
        soundManager.playDropInvalid();
      }
    }
  };

  // Core Key Placement Logic
  const placeKeyInSlot = (slotIdx: number) => {
    if (currentKey === null) return;
    const baseHash = calculateBaseHash(currentKey, currentLevel.tableSize);
    const slot = slots[slotIdx];

    // Separate Chaining
    if (currentLevel.technique === 'chaining') {
      soundManager.playChain();
      setSlots((prev) =>
        prev.map((s) => {
          if (s.index === slotIdx) {
            return {
              ...s,
              status: 'occupied',
              items: [...s.items, { id: `key-${Date.now()}`, value: currentKey, initialHash: baseHash }],
            };
          }
          return s;
        })
      );
      advanceToNextKey(slotIdx);
      return;
    }

    // Open Addressing
    const isOccupied = slot.items.length > 0;

    if (!isOccupied) {
      soundManager.playInsert();
      setSlots((prev) =>
        prev.map((s) => {
          if (s.index === slotIdx) {
            return {
              ...s,
              status: 'occupied',
              items: [{ id: `key-${Date.now()}`, value: currentKey, initialHash: baseHash }],
            };
          }
          return s;
        })
      );
      advanceToNextKey(slotIdx);
    } else {
      // Collision detected
      soundManager.playCollision();
      setCollidedSlotIndex(slotIdx);
      setCollidingExistingKey(slot.items[0].value);
      setGameState('COLLISION_PAUSE');

      if (currentLevel.id === 1) {
        setShowCollisionModal(true);
      } else {
        startProbingSequence(slotIdx, currentKey);
      }
    }
  };

  // Start Probing
  const startProbingSequence = (_slotIdx: number, keyVal: number) => {
    setIsProbing(true);
    setCurrentProbeStepIndex(0);
    setGameState('PROBING_INTERACTION');

    let sequence: ProbeStep[] = [];
    if (currentLevel.technique === 'linear') {
      sequence = computeLinearProbeSequence(keyVal, currentLevel.tableSize, slots);
    } else if (currentLevel.technique === 'quadratic') {
      sequence = computeQuadraticProbeSequence(keyVal, currentLevel.tableSize, slots);
    } else if (currentLevel.technique === 'double_hashing') {
      sequence = computeDoubleHashSequence(keyVal, currentLevel.tableSize, slots);
    }

    setProbeSteps(sequence);
  };

  const handleNextProbeStep = () => {
    if (currentProbeStepIndex < probeSteps.length - 1) {
      soundManager.playProbeStep();
      setCurrentProbeStepIndex((prev) => prev + 1);
    }
  };

  const handleAutoSolveProbe = () => {
    if (probeSteps.length === 0) return;
    const finalStepIdx = probeSteps.length - 1;
    setCurrentProbeStepIndex(finalStepIdx);
    soundManager.playProbeStep();
  };

  const handleConfirmProbeInsertion = () => {
    if (currentKey === null || probeSteps.length === 0) return;
    const finalStep = probeSteps[currentProbeStepIndex];
    if (finalStep.isOccupied) {
      soundManager.playDropInvalid();
      return;
    }

    const baseHash = calculateBaseHash(currentKey, currentLevel.tableSize);
    soundManager.playResolution();
    setSlots((prev) =>
      prev.map((s) => {
        if (s.index === finalStep.targetIndex) {
          return {
            ...s,
            status: 'occupied',
            items: [
              {
                id: `key-${Date.now()}`,
                value: currentKey,
                probesCount: currentProbeStepIndex,
                initialHash: baseHash,
                finalIndex: finalStep.targetIndex,
              },
            ],
          };
        }
        return s;
      })
    );

    setIsProbing(false);
    setProbeSteps([]);
    advanceToNextKey(finalStep.targetIndex);
  };

  // Advance Sequence
  const advanceToNextKey = (lastInsertedSlot: number) => {
    const nextSeqIdx = keySequenceIndex + 1;
    const seq = currentLevel.keysSequence;

    if (nextSeqIdx < seq.length) {
      setKeySequenceIndex(nextSeqIdx);
      const nextKey = seq[nextSeqIdx];
      setCurrentKey(nextKey);
      setCalculatedIndex(null);
      setTargetIndex(null);
      setCollidedSlotIndex(null);
      setCollidingExistingKey(null);
      setGameState('KEY_APPEARS');
      soundManager.playKeyAppear();
    } else {
      // Level Completed
      setGameState('LEVEL_COMPLETE');
      soundManager.playLevelVictory();
      setShowLevelCompleteModal(true);

      progressManager.markLevelCompleted(currentLevel.id, 100, streak >= 3);
    }
  };

  const handleProceedFromCollision = () => {
    setShowCollisionModal(false);
    progressManager.markLevelCompleted(1, 100, streak >= 3);
    setCurrentLevelIndex(1); // Advance to Level 2
  };

  const handleNextLevel = () => {
    setShowLevelCompleteModal(false);
    if (currentLevelIndex < GAME_LEVELS.length - 1) {
      const nextIndex = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIndex);
      initLevel(nextIndex);
    } else {
      // All 5 levels completed! Move to Level 6: Completion Milestone
      setCurrentLevelIndex(5);
    }
  };

  // Smart Resume / Continue Learning Action
  const handleContinueLearning = () => {
    const stats = progressManager.getStats();
    const nextMod = stats.nextModule;

    if (!nextMod || nextMod.id === 'fn-01-basics' || nextMod.id === 'fn-02-modulo') {
      setActiveTheoryTopic(nextMod?.targetChapterId || 'theory-01');
      setActiveTab('THEORY');
      return;
    }

    if (nextMod.id === 'fn-10-completion') {
      if (isAllLevelsCompleted) {
        setCurrentLevelIndex(5);
        setActiveTab('GAME');
      } else {
        const targetLvl = Math.min(completedLevels.length, 4);
        setCurrentLevelIndex(targetLvl);
        initLevel(targetLvl);
        setActiveTab('GAME');
      }
      return;
    }

    if (nextMod.targetTab === 'GAME' || (nextMod.targetLevelId && nextMod.targetLevelId >= 1)) {
      const targetLvl = (nextMod.targetLevelId || 1) - 1;
      if (targetLvl >= 5 && !isAllLevelsCompleted) {
        const safeLvl = Math.min(completedLevels.length, 4);
        setCurrentLevelIndex(safeLvl);
        initLevel(safeLvl);
      } else {
        setCurrentLevelIndex(targetLvl);
        if (targetLvl < 5) initLevel(targetLvl);
      }
      setActiveTab('GAME');
      return;
    }

    if (nextMod.id === 'fn-09-quiz' || nextMod.targetChapterId === 'knowledge-quiz') {
      setActiveTab('QUIZ');
      return;
    }

    if (nextMod.targetTab === 'LEARN' || nextMod.targetTab === 'THEORY') {
      setActiveTheoryTopic(nextMod.targetChapterId || 'theory-01');
      setActiveTab('THEORY');
      return;
    }

    // Default fallback
    setActiveTab('GAME');
  };

  // Direct trigger to Theory from Topic card
  const handleNavigateToTheory = (chapterId?: string) => {
    if (chapterId) {
      setActiveTheoryTopic(chapterId);
    }
    setActiveTab('THEORY');
  };

  const handleNavigateToQuest = (levelId?: number) => {
    if (levelId) {
      if (levelId === 6 && !isAllLevelsCompleted) {
        const safeLvl = Math.min(completedLevels.length, 4);
        setCurrentLevelIndex(safeLvl);
        initLevel(safeLvl);
      } else {
        setCurrentLevelIndex(levelId - 1);
        if (levelId <= 5) initLevel(levelId - 1);
      }
    }
    setActiveTab('GAME');
  };

  const currentStep = probeSteps[currentProbeStepIndex];
  const h2Val = currentKey !== null ? calculateH2(currentKey) : 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-[#F8FAFC] font-sans flex antialiased selection:bg-[#2563EB] selection:text-white transition-colors duration-300">
      {/* Sticky Left Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isDesktopOpen={desktopSidebarOpen}
        onToggleDesktopCollapse={() => setDesktopSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          desktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        {/* Top Header Bar */}
        <TopHeader
          activeTab={activeTab}
          currentLevelId={currentLevelIndex >= 5 && isAllLevelsCompleted ? 6 : currentLevel.id}
          score={score}
          streak={streak}
          technique={currentLevel.technique}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundManager.setMuted(next);
          }}
          speed={speed}
          onChangeSpeed={(sp) => setSpeed(sp)}
          onResetLevel={() => initLevel(currentLevelIndex)}
          onResetAllProgress={() => setShowResetModal(true)}
          onToggleMobileSidebar={handleToggleSidebar}
          isDesktopSidebarOpen={desktopSidebarOpen}
          isMobileSidebarOpen={mobileSidebarOpen}
        />

        {/* Page Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-[76px] sm:pt-[84px] pb-8 flex flex-col gap-6">
          <div
            key={activeTab}
            className="w-full flex-1 flex flex-col gap-6 animate-page-enter"
          >
            {/* 1. HOME LANDING PAGE */}
            {activeTab === 'HOME' && (
              <HomePage
                onContinueLearning={handleContinueLearning}
                onExploreTopics={() => {
                  setActiveTheoryTopic('theory-01');
                  setActiveTab('THEORY');
                }}
                onNavigateToTab={(tab, targetOption) => {
                  if (tab === 'THEORY') {
                    if (typeof targetOption === 'string') {
                      setActiveTheoryTopic(targetOption);
                    }
                    setActiveTab('THEORY');
                  } else if (tab === 'GAME' || tab === 'QUEST') {
                    if (typeof targetOption === 'number') {
                      if (targetOption === 6 && !isAllLevelsCompleted) {
                        const safeLvl = Math.min(completedLevels.length, 4);
                        setCurrentLevelIndex(safeLvl);
                        initLevel(safeLvl);
                      } else {
                        setCurrentLevelIndex(targetOption - 1);
                        if (targetOption <= 5) initLevel(targetOption - 1);
                      }
                    }
                    setActiveTab('GAME');
                  } else if (tab === 'LAB') {
                    setActiveTab('LAB');
                  } else if (tab === 'QUIZ') {
                    setActiveTab('QUIZ');
                  } else if (tab === 'PROGRESS') {
                    setActiveTab('PROGRESS');
                  }
                }}
              />
            )}

            {/* 2. THEORY SECTION */}
            {activeTab === 'THEORY' && (
              <LearnHashingSection
                initialTopic={activeTheoryTopic}
                onStartLevel={(lvlId) => {
                  if (lvlId === 6 && !isAllLevelsCompleted) {
                    const safeLvl = Math.min(completedLevels.length, 4);
                    setCurrentLevelIndex(safeLvl);
                    initLevel(safeLvl);
                  } else {
                    setCurrentLevelIndex(lvlId - 1);
                    if (lvlId <= 5) initLevel(lvlId - 1);
                  }
                  setActiveTab('GAME');
                }}
                onOpenSandbox={(tech) => {
                  if (tech) setSandboxTechnique(tech);
                  setActiveTab('LAB');
                }}
              />
            )}

            {/* 2.5. VIDEO LEARNING SECTION */}
            {activeTab === 'VIDEO' && (
              <VideoTutorialsView />
            )}

            {/* 3. GAME PLAY SECTION - DLL MASTER ADVENTURE */}
            {(activeTab === 'GAME' || activeTab === 'QUEST') && (
              <div className="flex flex-col gap-6 animate-page-enter">
                <DLLMasterGame
                  onOpenTheory={() => {
                    setActiveTheoryTopic('theory-01');
                    setActiveTab('THEORY');
                  }}
                  onOpenQuiz={() => {
                    setActiveTab('QUIZ');
                  }}
                />
              </div>
            )}

            {/* 4. LAB WORKBENCH SECTION */}
            {activeTab === 'LAB' && (
              <SandboxMode
                initialTechnique={sandboxTechnique}
                onExit={() => setActiveTab('GAME')}
                onOpenTheory={() => {
                  setActiveTheoryTopic('theory-01');
                  setActiveTab('THEORY');
                }}
              />
            )}

            {/* 5. QUIZ EXAMINATION SECTION */}
            {activeTab === 'QUIZ' && (
              <QuizView
                onNavigateToTheory={handleNavigateToTheory}
                onNavigateToQuest={handleNavigateToQuest}
                onNavigateToProgress={() => setActiveTab('PROGRESS')}
                onNavigateToHome={() => setActiveTab('HOME')}
              />
            )}

            {/* 6. PROGRESS AUDIT SECTION */}
            {activeTab === 'PROGRESS' && (
              <MyProgressView
                onNavigateToTab={(tab, levelId, chapterId) => {
                  if (tab === 'THEORY' || tab === 'LEARN') {
                    if (chapterId) setActiveTheoryTopic(chapterId);
                    setActiveTab('THEORY');
                  } else if (tab === 'QUEST' || tab === 'GAME') {
                    if (levelId) setCurrentLevelIndex(levelId - 1);
                    setActiveTab('GAME');
                  } else if (tab === 'LAB' || tab === 'SANDBOX') {
                    setActiveTab('LAB');
                  } else if (tab === 'QUIZ' || tab === 'EXAM') {
                    setActiveTab('QUIZ');
                  } else {
                    setActiveTab(tab as MainViewTab);
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Collision Discovery Modal (Level 1 collision moment) */}
      {showCollisionModal && collidingExistingKey !== null && currentKey !== null && (
        <CollisionModal
          incomingKey={currentKey}
          existingKey={collidingExistingKey}
          index={collidedSlotIndex ?? 3}
          tableSize={currentLevel.tableSize}
          onProceedToResolution={handleProceedFromCollision}
        />
      )}

      {/* Level Completion Modal */}
      {showLevelCompleteModal && (
        <LevelCompleteModal
          level={currentLevel}
          score={score}
          onNextLevel={handleNextLevel}
          onOpenLab={() => {
            setShowLevelCompleteModal(false);
            setActiveTab('LAB');
          }}
          onReplayLevel={() => {
            setShowLevelCompleteModal(false);
            initLevel(currentLevelIndex);
          }}
          hasNextLevel={currentLevelIndex < GAME_LEVELS.length - 1}
        />
      )}

      {/* 100% Curriculum Completion Celebration Modal */}
      <CompletionCelebrationModal
        isOpen={show100Celebration}
        onClose={() => setShow100Celebration(false)}
        onNavigateToLab={() => {
          setShow100Celebration(false);
          setActiveTab('LAB');
        }}
        onNavigateToProgress={() => {
          setShow100Celebration(false);
          setActiveTab('PROGRESS');
        }}
      />

      {/* Centered Reset Progress Confirmation Modal */}
      <ResetProgressModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => {
          progressManager.resetProgress();
          setScore(0);
          setStreak(0);
          setCompletedLevels([]);
          setCurrentLevelIndex(0);
          initLevel(0);
          setShowResetModal(false);
        }}
      />

      {/* Global AI Bot Floating Icon */}
      <AIBotFloatingButton />
    </div>
  );
}
