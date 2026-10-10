import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  Video as VideoIcon,
  Tv,
  Check,
  Loader2,
} from 'lucide-react';
import { LessonItem, VIDEO_LESSONS } from '../data/videoLessons';
import { soundManager } from '../utils/audio';
import { progressManager } from '../utils/progressManager';
import { pointsManager } from '../utils/pointsManager';

export const VideoTutorialsView: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<LessonItem>(VIDEO_LESSONS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFullscreenControlsVisible, setIsFullscreenControlsVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [completedVideos, setCompletedVideos] = useState<string[]>(() => {
    return progressManager.getVideoStats().completedVideos;
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Maximum continuous watched position (prevents seeking forward to cheat completion)
  const maxWatchedTimeRef = useRef<number>(0);

  // Sync completion state from progressManager
  useEffect(() => {
    const unsub = progressManager.subscribe((state) => {
      setCompletedVideos(state.completedVideos || []);
    });
    return unsub;
  }, []);

  // Format time in mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Immediate, robust video loading when selected lesson changes
  useEffect(() => {
    if (!selectedLesson) return;
    const video = videoRef.current;
    if (!video) return;

    setHasError(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    maxWatchedTimeRef.current = 0;

    video.src = selectedLesson.videoSrc;
    video.load();

    const handleReadyToPlay = () => {
      setIsLoading(false);
      setHasError(false);
      if (isPlaying) {
        video.play().catch(() => {
          setIsPlaying(false);
        });
      }
    };

    video.addEventListener('loadeddata', handleReadyToPlay, { once: true });
    video.addEventListener('canplay', handleReadyToPlay, { once: true });

    return () => {
      video.removeEventListener('loadeddata', handleReadyToPlay);
      video.removeEventListener('canplay', handleReadyToPlay);
    };
  }, [selectedLesson?.id]);

  // Select lesson and trigger immediate load + play
  const handleSelectLesson = useCallback((lesson: LessonItem, autoPlay: boolean = true) => {
    soundManager.playSelect();
    setHasError(false);
    maxWatchedTimeRef.current = 0;

    if (selectedLesson?.id === lesson.id && videoRef.current) {
      if (!isPlaying && autoPlay) {
        soundManager.playVideoPlay();
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    setSelectedLesson(lesson);
    setIsPlaying(autoPlay);
  }, [isPlaying, selectedLesson?.id]);

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current || !selectedLesson) return;

    if (isPlaying) {
      soundManager.playVideoPause();
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      soundManager.playVideoPlay();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  }, [isPlaying, selectedLesson]);

  // Strict Pause (for 'K' keyboard shortcut)
  const pauseVideoStrict = useCallback(() => {
    if (!videoRef.current || !selectedLesson) return;
    if (isPlaying) {
      soundManager.playVideoPause();
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying, selectedLesson]);

  // BACKWARD NAVIGATION ONLY: Rewind 10s (seeks to 0:00 if < 10s)
  const handleRewind = useCallback(() => {
    if (!videoRef.current) return;
    soundManager.playVideoSeek();
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // Timeline scrubber seek: ALLOW BACKWARD SEEKING ONLY
  // Do NOT allow seeking forward or jumping directly to the end.
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (!videoRef.current) return;

    // Allow seeking backward to re-watch previously viewed content
    if (targetTime <= currentTime) {
      soundManager.playVideoSeek();
      setCurrentTime(targetTime);
      videoRef.current.currentTime = targetTime;
    } else {
      // Forward seeking is blocked to prevent cheating completion
      // Clamp back to current playback position
      videoRef.current.currentTime = currentTime;
    }
  };

  // Prevent seeking forward via media controls or programmatic tampering: backward navigation only
  const handleSeeking = () => {
    if (!videoRef.current) return;
    // Strictly prevent jumping ahead of the furthest continuous watched position
    if (videoRef.current.currentTime > maxWatchedTimeRef.current + 0.3) {
      videoRef.current.currentTime = maxWatchedTimeRef.current;
      setCurrentTime(maxWatchedTimeRef.current);
    }
  };

  // Speed selector: prevent fast-forwarding (speeds > 1x strictly disallowed)
  const handleChangeSpeed = useCallback((spd: number) => {
    if (spd > 1) return; // Prevent fast-forwarding
    soundManager.playVideoSpeed();
    setPlaybackSpeed(spd);
    if (videoRef.current) {
      videoRef.current.playbackRate = spd;
    }
  }, []);

  // Volume slider
  const handleVolumeChange = (newVol: number) => {
    soundManager.playVideoSeek();
    setVolume(newVol);
    const muted = newVol === 0;
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = muted;
    }
  };

  // Mute / Unmute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    soundManager.playVideoSeek();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  }, [isMuted]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    const isDocFs = !!document.fullscreenElement;
    soundManager.playVideoFullscreen(!isDocFs);

    if (!isDocFs) {
      playerContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setIsFullscreenControlsVisible(true);
        })
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          setIsFullscreenControlsVisible(true);
        })
        .catch(() => {});
    }
  }, []);

  // HTML5 Video Lifecycle Handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsLoading(false);
      setHasError(false);
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;

      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setIsLoading(false);
            });
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      // Track valid continuous playback (allow forward advancement only via continuous playback)
      if (t > maxWatchedTimeRef.current && t - maxWatchedTimeRef.current < 2) {
        maxWatchedTimeRef.current = t;
      }
    }
  };

  // MANDATORY FULL VIDEO COMPLETION:
  // Award +8 raw points ONLY upon actual full video finish.
  // Replaying does not duplicate points.
  const handleEnded = () => {
    setIsPlaying(false);
    if (selectedLesson && videoRef.current) {
      const totalDur = duration || videoRef.current.duration || 0;
      // Ensure genuine full playback through to the end (within 2s of end)
      const isGenuineCompletion = totalDur > 0 && maxWatchedTimeRef.current >= totalDur - 2.5;

      if (isGenuineCompletion) {
        soundManager.playVideoComplete();
        progressManager.completeVideo(selectedLesson.id, 'dll');
        pointsManager.recordEvent('VIDEO_LESSON_COMPLETED', selectedLesson.id);
        setCompletedVideos(progressManager.getVideoStats().completedVideos);
      }
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setHasError(true);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  // Activity trigger for auto-hiding fullscreen controls
  const triggerFullscreenActivity = useCallback(() => {
    if (!isFullscreen) return;
    setIsFullscreenControlsVisible(true);

    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }

    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsFullscreenControlsVisible(false);
      }, 2800);
    }
  }, [isFullscreen, isPlaying]);

  // Keep controls visible when interacting with control elements directly
  const handleControlsInteraction = () => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setIsFullscreenControlsVisible(true);
  };

  // Automatically start hide timer upon playing in fullscreen
  useEffect(() => {
    if (isFullscreen && isPlaying) {
      triggerFullscreenActivity();
    } else if (!isPlaying) {
      setIsFullscreenControlsVisible(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    }
  }, [isFullscreen, isPlaying, triggerFullscreenActivity]);

  // Keyboard Shortcuts Listener (Space for Play/Pause, J for Rewind, K for Pause, F for Fullscreen)
  // Forward shortcut 'L' removed to enforce backward-navigation only!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleRewind();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        pauseVideoStrict();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, handleRewind, pauseVideoStrict, toggleFullscreen]);

  // Sync document fullscreen state
  useEffect(() => {
    const onFsChange = () => {
      const isDocFs = !!document.fullscreenElement;
      setIsFullscreen(isDocFs);
      setIsFullscreenControlsVisible(true);
      if (!isDocFs && hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  const completedVideosCount = ['lesson-01', 'lesson-02'].filter((id) =>
    completedVideos.includes(id)
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* =========================================================================
          TOP SECTION — HEADER & COMPLETION COUNTER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider bg-blue-50 dark:bg-blue-950/70 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 mb-2">
            VISUALIZE SECTION (+8 RAW PTS PER VIDEO)
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-sans text-slate-900 dark:text-white tracking-tight">
            Interactive Video Masterclasses
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mt-2 leading-relaxed">
            High-definition video lessons and visual animations that make Doubly Linked Lists easy to understand. Watch videos fully to earn competition points.
          </p>
        </div>

        <div className="shrink-0 self-start md:self-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold font-mono text-slate-700 dark:text-slate-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Completed: {completedVideosCount} / 2 Lessons</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TWO LESSON CARDS SIDE BY SIDE
          ========================================================================= */}
      <section aria-label="Video Lessons Selection">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VIDEO_LESSONS.map((lesson) => {
            const isSelected = selectedLesson?.id === lesson.id;
            const isCompleted = completedVideos.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                id={`video-card-${lesson.id}`}
                onClick={() => handleSelectLesson(lesson, true)}
                className={`p-6 sm:p-7 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-white dark:bg-[#111827] border-[#2563EB] dark:border-blue-500 shadow-md dark:shadow-[0_0_24px_rgba(37,99,235,0.2)] ring-2 ring-[#2563EB]/20 dark:ring-blue-500/30'
                    : 'bg-white dark:bg-[#111827]/85 border-[#E5E7EB] dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 shadow-xs'
                }`}
              >
                <div>
                  {/* Lesson Header Pill & Completion Indicator */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold font-mono border tracking-wide transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300 border-blue-200 dark:border-slate-700'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                        }`}
                      >
                        {lesson.lessonNumber}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                        {lesson.filename}
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Completed (+8 pts)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 dark:bg-blue-950/70 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                        <span>+8 pts</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900 dark:text-white mb-2 leading-snug">
                    {lesson.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {lesson.description}
                  </p>

                  {/* Topic Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {lesson.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 dark:bg-[#0B1120] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    <span>Video Lesson</span>
                  </span>

                  <button
                    id={`btn-play-card-${lesson.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLesson(lesson, true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm ${
                      isSelected && isPlaying
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                        : 'bg-primary-gradient text-white shadow-primary-gradient hover:brightness-110'
                    }`}
                  >
                    {isSelected && isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Now Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? 'Watch Again' : 'Start Video'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          VIDEO PLAYER CONTAINER
          ========================================================================= */}
      <section
        aria-label="Video Player Workspace"
        className="space-y-4"
      >
        {/* Now Playing Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#111827] p-4 sm:px-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-slate-800">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
                NOW ACTIVE: {selectedLesson.lessonNumber}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-sans">
                {selectedLesson.nowPlayingTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {completedVideos.includes(selectedLesson.id) ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Rewarded (+8 pts)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-300 border border-blue-100 dark:border-slate-800 font-mono">
                <span>Watch full video for +8 pts</span>
              </span>
            )}
          </div>
        </div>

        {/* Video Player Box */}
        <div
          ref={playerContainerRef}
          onMouseMove={triggerFullscreenActivity}
          onClick={triggerFullscreenActivity}
          className={`relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(37,99,235,0.12)] flex items-center justify-center group select-none ${
            isFullscreen
              ? `fixed inset-0 z-50 rounded-none w-screen h-screen ${
                  !isFullscreenControlsVisible ? 'cursor-none' : 'cursor-default'
                }`
              : 'aspect-video'
          }`}
        >
          {/* Error State */}
          {selectedLesson && hasError && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-[#070B18] text-slate-200 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-sans">
                  VIDEO COULD NOT BE LOADED
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
                  Please check the provided video file: <code className="text-rose-300 font-mono">{selectedLesson.filename}</code>
                </p>
              </div>
            </div>
          )}

          {/* Inner 16:9 Frame Wrapper */}
          <div className="relative w-full h-full max-w-full max-h-full aspect-video flex items-center justify-center">
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              preload="metadata"
              playsInline
              className={`w-full h-full object-contain ${
                selectedLesson && !hasError ? 'block' : 'hidden'
              }`}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onSeeking={handleSeeking}
              onEnded={handleEnded}
              onError={handleError}
              onWaiting={handleWaiting}
              onCanPlay={handleCanPlay}
              onClick={togglePlay}
            />

            {/* AlgoLearn Logo Overlay: completely covers the Gemini watermark in the video */}
            {selectedLesson && !hasError && (
              <div
                className="absolute z-20 pointer-events-none flex items-center justify-center select-none"
                style={{
                  bottom: 'calc(1.8% + 1cm)',
                  right: '1.2%',
                  width: '16.5%',
                  minWidth: '120px',
                  maxWidth: '210px',
                  height: '16%',
                  minHeight: '52px',
                  maxHeight: '112px',
                }}
              >
                <div className="w-full h-full bg-[#0d162d] rounded-xl border border-blue-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center p-2 sm:p-2.5 overflow-hidden">
                  <img
                    src="/algolearn-logo-dark.png"
                    alt="AlgoLearn"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clean Professional Loading State */}
          {selectedLesson && isLoading && !hasError && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 pointer-events-none text-white">
              <Loader2 className="w-8 h-8 text-[#2563EB] dark:text-blue-400 animate-spin" />
              <span className="text-xs font-bold font-mono tracking-wider uppercase">
                LOADING VIDEO...
              </span>
            </div>
          )}

          {/* FULLSCREEN CONTROLS OVERLAY (BACKWARD NAVIGATION ONLY) */}
          {isFullscreen && selectedLesson && !hasError && (
            <div
              onMouseMove={handleControlsInteraction}
              onClick={(e) => {
                e.stopPropagation();
                handleControlsInteraction();
              }}
              className={`absolute inset-x-0 bottom-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 ${
                isFullscreenControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Timeline scrubber: BACKWARD NAVIGATION ONLY */}
              <div className="space-y-1.5 mb-4">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#2563EB] transition-all"
                  aria-label="Video timeline scrubber (backward navigation only)"
                />
                <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls: LEFT ([REWIND 10s] [PLAY/PAUSE]) | MIDDLE (Speed) | RIGHT (Volume, Fullscreen) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3">
                  {/* REWIND BUTTON (BACKWARD NAVIGATION ONLY) */}
                  <button
                    onClick={handleRewind}
                    className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-blue-950/40 text-slate-200 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                    title="Rewind 10s (J)"
                    aria-label="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* PLAY / PAUSE BUTTON */}
                  <button
                    onClick={togglePlay}
                    className="h-11 sm:h-10 px-5 sm:px-6 rounded-xl bg-primary-gradient text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary-gradient active:scale-95 transition-all hover:brightness-110"
                    title={isPlaying ? 'Pause video (Space/K)' : 'Play video (Space)'}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />}
                    <span className="uppercase font-bold text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </div>

                {/* Right Side: Speed + Volume + Exit Fullscreen */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-black/40 border border-white/10 dark:border-slate-800 rounded-xl p-1 shadow-inner shrink-0">
                    {[0.5, 1].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleChangeSpeed(spd)}
                        className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
                          playbackSpeed === spd
                            ? 'bg-primary-gradient text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white cursor-pointer"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16 sm:w-20 h-1 bg-white/20 accent-[#2563EB] cursor-pointer"
                      aria-label="Volume slider"
                    />
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white cursor-pointer"
                    title="Exit Fullscreen (F/Esc)"
                    aria-label="Exit Fullscreen"
                  >
                    <Minimize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            INLINE VIDEO CONTROL BAR (WHEN NOT FULLSCREEN)
            BACKWARD NAVIGATION ONLY — NO SKIP / FORWARD BUTTONS
            ========================================================================= */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* Timeline Scrubber: BACKWARD SEEKING ONLY */}
          <div className="space-y-1.5">
            <input
              id="video-timeline-scrubber"
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={hasError}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2563EB] transition-all disabled:opacity-50"
              aria-label="Video timeline scrubber (backward navigation only)"
            />
            <div className="flex justify-between items-center text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Primary Controls (LEFT: Rewind + Play/Pause | RIGHT: Speed, Volume, Fullscreen) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3">
              {/* REWIND BUTTON (BACKWARD NAVIGATION ONLY) */}
              <button
                id="btn-video-rewind"
                onClick={handleRewind}
                disabled={hasError}
                className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0B1120] dark:hover:bg-blue-950/40 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center shrink-0"
                title="Rewind 10 seconds (J)"
                aria-label="Rewind 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* PLAY / PAUSE BUTTON */}
              <button
                id="btn-video-play-pause"
                onClick={togglePlay}
                disabled={hasError}
                className="h-11 sm:h-10 px-5 sm:px-6 rounded-xl bg-primary-gradient text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-gradient active:scale-95 cursor-pointer disabled:opacity-50 hover:brightness-110"
                title={isPlaying ? 'Pause video (Space/K)' : 'Play video (Space)'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />}
                <span className="tracking-wide uppercase font-bold text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>

            {/* SECONDARY CONTROLS: Speed Selector + Volume + Fullscreen */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3.5 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-0">
              {/* PLAYBACK SPEED SELECTOR (0.5x, 1x — NO FAST-FORWARDING ALLOWED) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-xl p-1 shadow-inner shrink-0">
                {[0.5, 1].map((spd) => (
                  <button
                    key={spd}
                    id={`btn-speed-${spd}x`}
                    onClick={() => handleChangeSpeed(spd)}
                    disabled={hasError}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50 ${
                      playbackSpeed === spd
                        ? 'bg-primary-gradient text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* VOLUME SLIDER */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="btn-video-mute-toggle"
                  onClick={toggleMute}
                  disabled={hasError}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-50"
                  title={isMuted ? 'Unmute' : 'Mute'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                  )}
                </button>
                <input
                  id="video-volume-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  disabled={hasError}
                  className="w-16 sm:w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2563EB] disabled:opacity-50"
                  aria-label="Volume slider"
                />
              </div>

              {/* FULLSCREEN BUTTON */}
              <button
                id="btn-video-fullscreen"
                onClick={toggleFullscreen}
                disabled={hasError}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0B1120] dark:hover:bg-blue-950/40 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                title="Fullscreen (F)"
                aria-label="Toggle Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoTutorialsView;
