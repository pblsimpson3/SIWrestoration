import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Settings, RotateCcw, RotateCw, HelpCircle, Eye, EyeOff, CheckCircle, HelpCircle as HintIcon
} from 'lucide-react';
import { Quote, RoleId } from '../types';
import { QUOTES, getQuoteForTime } from '../data';

interface VideoPlayerProps {
  currentQuote: Quote;
  onQuoteChange: (quote: Quote) => void;
  onTimeUpdate: (time: number) => void;
  userRatingStatus: Record<number, { isLiked: boolean | null; explanation: string }>;
  selectedRoleId: RoleId | null;
}

export default function VideoPlayer({ 
  currentQuote, 
  onQuoteChange, 
  onTimeUpdate,
  userRatingStatus,
  selectedRoleId
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [youtubeId, setYoutubeId] = useState('KrHYLh64-qU'); // Authentic Full Video ID
  const [isMuted, setIsMuted] = useState(false);
  const [autoPause, setAutoPause] = useState(true);
  const [showHelperPanel, setShowHelperPanel] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const preciseTimeRef = useRef(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  const duration = 900; // 15 minutes = 900 seconds

  // Maintain actual time reference to prevent stale interval closures and avoid setState-in-render behavior
  const currentTimeRef = useRef(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
    preciseTimeRef.current = currentTime;
  }, [currentTime]);

  // Load YouTube script on mount once
  useEffect(() => {
    const win = window as any;
    if (!win.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YT Player on the placeholder element
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let initTimeout: NodeJS.Timeout;
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted) return;
      if (embedInfo.type !== 'youtube') return;
      
      const win = window as any;
      if (win.YT && win.YT.Player) {
        if (checkInterval) clearInterval(checkInterval);

        const element = document.getElementById('saugus-video-player');
        if (!element) {
          // If the React component mounted but DOM isn't completely painted yet, allow short retry loop
          initTimeout = setTimeout(initPlayer, 50);
          return;
        }

        try {
          if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            try { playerRef.current.destroy(); } catch (e) {}
          }

          playerRef.current = new win.YT.Player('saugus-video-player', {
            videoId: youtubeId,
            playerVars: {
              enablejsapi: 1,
              autoplay: 0,
              mute: isMuted ? 1 : 0,
              origin: window.location.origin
            },
            events: {
              onReady: (event: any) => {
                if (!isMounted) return;
                if (currentTimeRef.current > 0) {
                  try {
                    event.target.seekTo(currentTimeRef.current, true);
                  } catch (e) {
                    console.warn("Initial onReady seek failed", e);
                  }
                }
              },
              onStateChange: (event: any) => {
                if (!isMounted) return;
                const state = event.data;
                // Player State codes: 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (state === 1) {
                  setIsPlaying(true);
                } else if (state === 2 || state === 0) {
                  setIsPlaying(false);
                }
              }
            }
          });
        } catch (err) {
          console.error("Error instantiating YT Player wrapper:", err);
        }
      }
    };

    const win = window as any;
    if (win.YT && win.YT.Player) {
      initTimeout = setTimeout(initPlayer, 100);
    } else {
      const previousCallback = win.onYouTubeIframeAPIReady;
      win.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        if (isMounted) initTimeout = setTimeout(initPlayer, 100);
      };

      checkInterval = setInterval(() => {
        if (win.YT && win.YT.Player) {
          if (isMounted) initPlayer();
          clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (initTimeout) clearTimeout(initTimeout);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          // ignore
        }
      }
    };
  }, [youtubeId]);

  // Send postMessage commands directly to the YouTube iframe API,
  // or use the loaded playerRef object if available.
  const controlPlayer = (func: string, args: any = '') => {
    if (playerRef.current) {
      try {
        if (func === 'playVideo' && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
          return;
        }
        if (func === 'pauseVideo' && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
          return;
        }
        if (func === 'mute' && typeof playerRef.current.mute === 'function') {
          playerRef.current.mute();
          return;
        }
        if (func === 'unMute' && typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
          return;
        }
        if (func === 'seekTo' && typeof playerRef.current.seekTo === 'function') {
          const seekArgs = Array.isArray(args) ? args : [args, true];
          playerRef.current.seekTo(...seekArgs);
          return;
        }
      } catch (e) {
        console.warn('Direct player call failed, falling back to message:', e);
      }
    }

    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (err) {
        console.warn('Unable to communicate with the YouTube frame:', err);
      }
    }
  };

  // Sync state changes with physical player
  useEffect(() => {
    controlPlayer(isPlaying ? 'playVideo' : 'pauseVideo');
  }, [isPlaying]);

  useEffect(() => {
    controlPlayer(isMuted ? 'mute' : 'unMute');
  }, [isMuted]);

  // Handle Play/Pause timer synchronization safely
  useEffect(() => {
    if (isPlaying) {
      let lastTimestamp = performance.now();

      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsedSeconds = (now - lastTimestamp) / 1000;
        lastTimestamp = now;

        const prevTime = currentTimeRef.current;
        let nextTime = prevTime;

        // Try to read actual playback position from YouTube SDK
        let hasYtTime = false;
        if (embedInfo.type === 'youtube' && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const actualYtTime = playerRef.current.getCurrentTime();
            if (typeof actualYtTime === 'number' && !isNaN(actualYtTime)) {
              // Lock on active playhead from YouTube directly. No artificial simulation forward.
              nextTime = Math.min(Math.floor(actualYtTime), duration);
              preciseTimeRef.current = actualYtTime;
              hasYtTime = true;
            }
          } catch (e) {
            // fallback
          }
        }

        if (!hasYtTime) {
          // Precise delta math for fallback/Google Drive/sandboxed frames!
          preciseTimeRef.current = Math.min(preciseTimeRef.current + elapsedSeconds, duration);
          nextTime = Math.min(Math.floor(preciseTimeRef.current), duration);
        }

        // Only update states if the time has actually advanced (or changed)
        if (nextTime !== prevTime) {
          setCurrentTime(nextTime);
          onTimeUpdate(nextTime);

          // Find if we crossed any Quote's endTime and pause appropriately
          const activeQuote = QUOTES.find(q => prevTime < q.endTime && nextTime >= q.endTime);
          if (activeQuote && autoPause) {
            setIsPlaying(false);
            if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
              try {
                playerRef.current.pauseVideo();
              } catch (e) {}
            }
            setCurrentTime(activeQuote.endTime);
            preciseTimeRef.current = activeQuote.endTime;
            onQuoteChange(activeQuote);
          } else {
            // Check if we need to transition to another quote or gap state (via getQuoteForTime)
            const targetQuote = getQuoteForTime(nextTime);
            if (targetQuote.id !== currentQuote.id) {
              onQuoteChange(targetQuote);
            }
          }
        }

        if (nextTime >= duration) {
          setIsPlaying(false);
          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
            try { playerRef.current.pauseVideo(); } catch (e) {}
          }
        }
      }, 100); // Poll every 100ms for fast feedback
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, autoPause, currentQuote, onQuoteChange, onTimeUpdate]);

  // Jump to specific quote
  const handleQuoteClick = (quote: Quote) => {
    setCurrentTime(quote.startTime);
    onQuoteChange(quote);
    onTimeUpdate(quote.startTime);
    controlPlayer('seekTo', [quote.startTime, true]);
  };

  const handleNextQuote = () => {
    const currentIndex = QUOTES.findIndex(q => q.id === currentQuote.id);
    if (currentIndex < QUOTES.length - 1) {
      handleQuoteClick(QUOTES[currentIndex + 1]);
    }
  };

  const handlePrevQuote = () => {
    const currentIndex = QUOTES.findIndex(q => q.id === currentQuote.id);
    if (currentIndex > 0) {
      handleQuoteClick(QUOTES[currentIndex - 1]);
    }
  };

  // Safe seek commands that update state outside loop/functional updaters
  const seekForward = () => {
    const target = Math.min(currentTime + 10, duration);
    setCurrentTime(target);
    onTimeUpdate(target);
    controlPlayer('seekTo', [target, true]);
    
    const targetQuote = getQuoteForTime(target);
    if (targetQuote.id !== currentQuote.id) {
      onQuoteChange(targetQuote);
    }
  };

  const seekBackward = () => {
    const target = Math.max(currentTime - 10, 0);
    setCurrentTime(target);
    onTimeUpdate(target);
    controlPlayer('seekTo', [target, true]);
    
    const targetQuote = getQuoteForTime(target);
    if (targetQuote.id !== currentQuote.id) {
      onQuoteChange(targetQuote);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Find if current time is within active quote range
  const isQuoteTimelineActive = currentTime >= currentQuote.startTime && currentTime <= currentQuote.endTime;

  // Helper to parse YouTube IDs, YouTube URLs, or Google Drive file links/IDs
  const getEmbedInfo = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        type: 'youtube',
        src: `https://www.youtube.com/embed/KrHYLh64-qU?enablejsapi=1&autoplay=0&mute=${isMuted ? 1 : 0}`
      };
    }

    // Google Drive URL/ID check
    const isDrive = trimmed.includes('drive.google.com') || 
                    trimmed.includes('docs.google.com') || 
                    trimmed.includes('/file/d/') || 
                    (trimmed.length >= 25 && !trimmed.includes('youtube') && !trimmed.includes('youtu.be'));

    if (isDrive) {
      // Try to extract Google Drive internal file ID
      const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      let fileId = trimmed;
      if (fileIdMatch && fileIdMatch[1]) {
        fileId = fileIdMatch[1];
      } else if (idParamMatch && idParamMatch[1]) {
        fileId = idParamMatch[1];
      }
      return {
        type: 'drive',
        src: `https://drive.google.com/file/d/${fileId}/preview`
      };
    }

    // YouTube ID or URL
    let ytId = trimmed;
    const urlYtMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (urlYtMatch && urlYtMatch[1]) {
      ytId = urlYtMatch[1];
    }
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=0&mute=${isMuted ? 1 : 0}`
    };
  };

  const embedInfo = getEmbedInfo(youtubeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Col 1 & 2: Video + Captions + Subtitle Controls */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* Film Theater Frame */}
        <div className="relative bg-[#1A1613] rounded-xl overflow-hidden aspect-video shadow-lg border border-natural-darker">
          
          {/* Universal Video IFrame Embed (YouTube or Google Drive Preview) */}
          {embedInfo.type === 'drive' ? (
            <iframe
              ref={iframeRef}
              id="saugus-video-player"
              title="The Saugus Iron Works Restoration Film"
              src={embedInfo.src}
              className="w-full h-full object-cover opacity-90"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              id="saugus-video-player"
              className="w-full h-full opacity-90"
            />
          )}

          {/* Subtitles Overlay Removed */}


        </div>

        {/* Playback Control Deck Card */}
        <div className="bg-[#FEFDFB] border border-natural-sand-dark rounded-xl p-5 shadow-sm">
          
          {/* Progress Slider */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-stone-600">{formatTime(currentTime)}</span>
            <input 
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                const targetTime = Number(e.target.value);
                setCurrentTime(targetTime);
                onTimeUpdate(targetTime);
                controlPlayer('seekTo', [targetTime, true]);
                
                // Set appropriate current quote (handles gaps automatically)
                const targetQuote = getQuoteForTime(targetTime);
                onQuoteChange(targetQuote);
              }}
              className="flex-1 accent-natural-accent h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-stone-600">{formatTime(duration)}</span>
          </div>

          {/* Buttons Deck */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Play controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevQuote}
                title="Jump to Previous Quote"
                className="p-2 border border-natural-sand-dark text-natural-dark bg-white hover:bg-natural-bg rounded-lg active:scale-95 transition"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button 
                onClick={seekBackward}
                title="Rewind 10 seconds"
                className="p-2 border border-natural-sand-dark text-natural-dark bg-white hover:bg-natural-bg rounded-lg active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`py-2 px-6 rounded-lg text-sm font-serif font-bold tracking-wide flex items-center gap-1.5 transition active:scale-95 text-white ${
                  isPlaying 
                    ? 'bg-natural-accent hover:bg-natural-accent-hover' 
                    : 'bg-natural-sage hover:bg-natural-sage-hover'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause Lesson' : 'Start SIW Film'}
              </button>

              <button 
                onClick={seekForward}
                title="Forward 10 seconds"
                className="p-2 border border-natural-sand-dark text-natural-dark bg-white hover:bg-natural-bg rounded-lg active:scale-95 transition"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button 
                onClick={handleNextQuote}
                title="Jump to Next Quote"
                className="p-2 border border-natural-sand-dark text-natural-dark bg-white hover:bg-natural-bg rounded-lg active:scale-95 transition"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitles & Volume settings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#F5F2ED] border border-natural-sand-dark py-1.5 px-3 rounded-lg">
                <input 
                  type="checkbox" 
                  id="auto-pause-toggle"
                  checked={autoPause}
                  onChange={(e) => setAutoPause(e.target.checked)}
                  className="accent-natural-accent w-3.5 h-3.5"
                />
                <label htmlFor="auto-pause-toggle" className="text-xs font-serif font-bold text-natural-dark select-none cursor-pointer">
                  Pause at Quote End
                </label>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-natural-dark hover:bg-[#F5F2ED] rounded focus:outline-none"
                title={isMuted ? "Unmute Movie" : "Mute Movie"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1 bg-[#F5F2ED] border border-natural-sand-dark px-3 py-1.5 rounded-lg max-w-sm">
                <span className="text-[9px] text-[#5A5A40] font-mono font-bold tracking-wider shrink-0">SOURCE ID/URL:</span>
                <input
                  type="text"
                  value={youtubeId}
                  onChange={(e) => setYoutubeId(e.target.value)}
                  placeholder="Paste YouTube ID, Drive link, or direct video path"
                  className="w-40 text-[9px] bg-transparent border-none text-natural-dark font-mono font-bold focus:outline-none truncate"
                  title="Paste any YouTube video ID/URL or Google Drive file URL/ID"
                />
              </div>
            </div>

          </div>

          <div className="mt-4 border-t border-natural-sand pt-3 flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-natural-dark" style={{ fontSize: '18pt' }}>
                  Quote {currentQuote.id} of 19
                </span>
                {currentTime >= currentQuote.startTime && currentTime <= currentQuote.endTime ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                    Now Playing
                  </span>
                ) : currentTime < currentQuote.startTime ? (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Upcoming (Starts in {formatTime(currentQuote.startTime - currentTime)})
                  </span>
                ) : (
                  <span className="bg-stone-100 text-stone-600 border border-stone-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Quote Completed
                  </span>
                )}
              </div>
              <span className="text-stone-500 text-[11px] font-mono">
                Range: {formatTime(currentQuote.startTime)} to {formatTime(currentQuote.endTime)}
              </span>
            </div>
            
            <div className="bg-[#F5F2ED] border border-natural-sand-dark rounded-xl p-4 text-stone-850 font-serif text-sm leading-relaxed italic shadow-inner">
              {currentQuote.text}
            </div>
          </div>

        </div>

      </div>

      {/* Col 3: Lesson Milestone Progress & Selected Quote Metadata */}
      <div className="flex flex-col gap-4">
        
        {/* Jump-to-Timeline list */}
        <div className="bg-[#FEFDFB] border border-natural-sand-dark rounded-xl p-5 shadow-md h-full flex flex-col min-h-[360px]">
          <h4 className="text-xs font-serif font-bold text-natural-dark mb-2.5 pb-2 border-b border-natural-sand flex items-center justify-between">
            <span>Film Quotes Timeline</span>
          </h4>
          
          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1">
            {QUOTES.map((q) => {
              const status = userRatingStatus[q.id];
              const isRated = status?.isLiked !== null;
              const isActive = q.id === currentQuote.id;
              const isCurrentlyPlayingThisQuote = currentTime >= q.startTime && currentTime <= q.endTime;

              return (
                <button
                  key={q.id}
                  onClick={() => handleQuoteClick(q)}
                  className={`w-full text-left p-2 rounded text-xs leading-tight transition flex items-center justify-between gap-1.5 cursor-pointer ${
                    isCurrentlyPlayingThisQuote
                      ? 'bg-natural-accent text-white font-serif font-bold ring-2 ring-natural-accent/30 ring-offset-1 animate-pulse'
                      : isActive
                      ? 'bg-natural-sage text-[#FEFDFB] font-serif font-bold border border-natural-sand-dark'
                      : 'bg-[#F2EDE4] hover:bg-[#E6E0D4] text-natural-text border border-natural-sand-dark'
                  }`}
                >
                  <span className="truncate pr-1 flex-1">
                    <span className="font-mono font-bold mr-1 inline-block w-4">{q.id}.</span> 
                    {q.text.replace(/“|”/g, '')}
                  </span>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`font-mono text-[9px] px-1 py-0.5 rounded ${isCurrentlyPlayingThisQuote || isActive ? 'bg-white/20 text-white' : 'bg-[#D1C7B7]/40 text-stone-600'}`}>
                      {formatTime(q.startTime)}
                    </span>
                    {isRated ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyPlayingThisQuote || isActive ? 'bg-white' : status.isLiked ? 'bg-emerald-600' : 'bg-[#8B4513]'}`} title="Submitted"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300" title="Unrated"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
