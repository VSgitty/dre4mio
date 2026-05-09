'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Clip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  track: number;
  type: 'video' | 'audio' | 'animation' | 'effect' | 'text';
  color?: string;
}

interface Track {
  id: string;
  label: string;
  type: 'video' | 'audio' | 'animation' | 'effect';
  muted?: boolean;
  locked?: boolean;
}

interface ProTimelineProps {
  clips?: Clip[];
  tracks?: Track[];
  duration?: number;
  currentTime?: number;
  fps?: number;
  playbackState?: 'playing' | 'paused' | 'stopped';
  onTimeChange?: (time: number) => void;
  onClipSelect?: (clipId: string) => void;
  onPlaybackToggle?: () => void;
}

const TRACK_HEIGHT = 44;
const LABEL_WIDTH = 140;
const MIN_ZOOM = 20;
const MAX_ZOOM = 400;

const CLIP_COLORS: Record<Clip['type'], string> = {
  video: 'bg-blue-500/30 border-blue-500',
  audio: 'bg-green-500/30 border-green-500',
  animation: 'bg-monopol-accent/30 border-monopol-accent',
  effect: 'bg-purple-500/30 border-purple-500',
  text: 'bg-yellow-500/30 border-yellow-500',
};

const DEFAULT_TRACKS: Track[] = [
  { id: 'video', label: 'Video', type: 'video' },
  { id: 'animations', label: 'Animationen', type: 'animation' },
  { id: 'effects', label: 'Effekte', type: 'effect' },
  { id: 'audio', label: 'Audio', type: 'audio' },
];

export function ProTimeline({
  clips = [],
  tracks = DEFAULT_TRACKS,
  duration = 30,
  currentTime = 0,
  fps = 30,
  playbackState = 'stopped',
  onTimeChange,
  onClipSelect,
  onPlaybackToggle,
}: ProTimelineProps) {
  const [zoom, setZoom] = useState(60); // pixels per second
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalWidth = Math.max(duration * zoom + 200, 800);

  const formatTimecode = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * fps);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  // Ruler tick interval logic
  const getTickInterval = () => {
    if (zoom < 30) return 5;
    if (zoom < 60) return 2;
    if (zoom < 120) return 1;
    return 0.5;
  };

  const tickInterval = getTickInterval();
  const tickCount = Math.ceil(duration / tickInterval) + 1;

  const handleRulerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = x / zoom;
      onTimeChange?.(Math.max(0, Math.min(duration, time)));
    },
    [zoom, duration, onTimeChange]
  );

  const handleWheelZoom = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((prev) => {
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * factor));
      });
    }
  }, []);

  return (
    <div
      className="w-full h-full flex flex-col bg-monopol-darker overflow-hidden"
      onWheel={handleWheelZoom}
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-monopol-dark/50">
        {/* Transport controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTimeChange?.(0)}
            title="Go to start"
            className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
          >
            <SkipBackIcon />
          </button>

          <button
            onClick={onPlaybackToggle}
            className="p-1.5 hover:bg-white/5 rounded text-white transition-colors"
          >
            {playbackState === 'playing' ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={() => onTimeChange?.(duration)}
            title="Go to end"
            className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
          >
            <SkipForwardIcon />
          </button>
        </div>

        {/* Timecode */}
        <div className="font-mono text-xs text-monopol-neon bg-monopol-darker/80 px-2 py-1 rounded border border-monopol-neon/20 min-w-[90px] text-center">
          {formatTimecode(currentTime)}
        </div>

        <div className="flex-1" />

        {/* Zoom control */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2))}
            className="px-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded py-0.5 transition-colors"
          >
            −
          </button>
          <span className="text-xs text-gray-500 font-mono w-10 text-center">
            {Math.round(zoom)}px
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2))}
            className="px-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded py-0.5 transition-colors"
          >
            +
          </button>
        </div>

        <div className="text-xs text-gray-600 font-mono">{fps}fps</div>
      </div>

      {/* ── Timeline body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Track labels */}
        <div
          className="flex-shrink-0 flex flex-col border-r border-white/5 bg-monopol-dark/30"
          style={{ width: LABEL_WIDTH }}
        >
          {/* Ruler spacer */}
          <div className="h-7 border-b border-white/5 bg-monopol-darker/50" />

          {/* Track label rows */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between px-2 border-b border-white/5"
              style={{ height: TRACK_HEIGHT }}
            >
              <span className="text-xs text-gray-400 font-medium truncate">{track.label}</span>
              <div className="flex gap-1">
                <button
                  title={track.muted ? 'Unmute' : 'Mute'}
                  className={`p-0.5 rounded text-xs transition-colors ${
                    track.muted ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  <MuteIcon />
                </button>
                <button
                  title={track.locked ? 'Unlock' : 'Lock'}
                  className={`p-0.5 rounded text-xs transition-colors ${
                    track.locked ? 'text-monopol-neon' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  <LockIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable track area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={scrollRef}>
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {/* Ruler */}
            <div
              ref={rulerRef}
              className="h-7 border-b border-white/5 bg-monopol-darker/50 relative cursor-pointer select-none sticky top-0"
              onClick={handleRulerClick}
            >
              {Array.from({ length: tickCount }).map((_, i) => {
                const t = i * tickInterval;
                const x = t * zoom;
                const isMajor = t % 1 === 0;
                return (
                  <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: x }}>
                    <div
                      className={`w-px ${isMajor ? 'h-4 bg-white/20' : 'h-2 bg-white/10'}`}
                    />
                    {isMajor && (
                      <span className="text-[9px] text-gray-600 font-mono mt-0.5 select-none">
                        {formatTimecode(t)}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Playhead on ruler */}
              <div
                className="absolute top-0 bottom-0 w-px bg-monopol-neon z-20 pointer-events-none"
                style={{ left: currentTime * zoom }}
              >
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-monopol-neon" />
              </div>
            </div>

            {/* Track rows */}
            <div className="relative">
              {tracks.map((track, trackIdx) => (
                <div
                  key={track.id}
                  className="relative border-b border-white/5"
                  style={{ height: TRACK_HEIGHT }}
                >
                  {/* Background zebra */}
                  <div
                    className={`absolute inset-0 ${trackIdx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                  />

                  {/* Clips on this track */}
                  {clips
                    .filter((c) => c.track === trackIdx)
                    .map((clip) => (
                      <ClipBlock
                        key={clip.id}
                        clip={clip}
                        zoom={zoom}
                        trackHeight={TRACK_HEIGHT}
                        isSelected={selectedClip === clip.id}
                        onSelect={() => {
                          setSelectedClip(clip.id);
                          onClipSelect?.(clip.id);
                        }}
                      />
                    ))}
                </div>
              ))}

              {/* Playhead line through tracks */}
              <div
                className="absolute top-0 bottom-0 w-px bg-monopol-neon/60 z-10 pointer-events-none"
                style={{ left: currentTime * zoom }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clip block ──────────────────────────────────────────────────────────────

function ClipBlock({
  clip,
  zoom,
  trackHeight,
  isSelected,
  onSelect,
}: {
  clip: Clip;
  zoom: number;
  trackHeight: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colorClass = CLIP_COLORS[clip.type] ?? 'bg-white/20 border-white/40';
  const width = Math.max(clip.duration * zoom, 4);
  const left = clip.startTime * zoom;

  return (
    <motion.div
      layout
      className={`absolute top-1.5 bottom-1.5 border rounded cursor-pointer transition-all select-none ${colorClass} ${
        isSelected ? 'ring-1 ring-white/60 ring-offset-0' : ''
      }`}
      style={{ left, width }}
      onClick={onSelect}
      title={clip.name}
    >
      <div className="px-1.5 py-0.5 overflow-hidden h-full flex items-center">
        <span className="text-[10px] font-medium text-white/80 truncate">{clip.name}</span>
      </div>
      {/* Resize handles */}
      <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/20 rounded-l" />
      <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/20 rounded-r" />
    </motion.div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
function SkipBackIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}
function SkipForwardIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
