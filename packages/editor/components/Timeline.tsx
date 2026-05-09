'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Clip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  track: number;
}

interface TimelineProps {
  clips?: Clip[];
  duration?: number;
  currentTime?: number;
  onTimeChange?: (time: number) => void;
  onClipSelect?: (clipId: string) => void;
  fps?: number;
}

export function Timeline({
  clips = [],
  duration = 30,
  currentTime = 0,
  onTimeChange,
  onClipSelect,
  fps = 30,
}: TimelineProps) {
  const [zoom, setZoom] = useState(1);
  const pixelsPerSecond = 50 * zoom;
  const totalWidth = duration * pixelsPerSecond;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * fps);
    return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-32 bg-monopol-darker border-t border-monopol-neon/20 flex flex-col">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-monopol-neon/10 flex items-center gap-2">
        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="text-sm px-2 py-1 hover:bg-monopol-neon/10 rounded">
          -
        </button>
        <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="text-sm px-2 py-1 hover:bg-monopol-neon/10 rounded">
          +
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="relative" style={{ width: totalWidth + 100, height: '100%' }}>
          {/* Ruler */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-monopol-darker/50 border-b border-monopol-neon/10 flex">
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
              <div key={i} className="flex-none" style={{ width: pixelsPerSecond }}>
                <span className="text-xs text-gray-500 px-1">{i}s</span>
              </div>
            ))}
          </div>

          {/* Playhead */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-monopol-neon z-10"
            style={{ left: currentTime * pixelsPerSecond }}
          />

          {/* Clips */}
          <div className="absolute top-6 left-0 w-full h-full">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="absolute h-12 bg-monopol-accent/20 border border-monopol-accent rounded cursor-pointer hover:bg-monopol-accent/30 transition-colors"
                style={{
                  left: clip.startTime * pixelsPerSecond,
                  width: clip.duration * pixelsPerSecond,
                  top: clip.track * 56,
                }}
                onClick={() => onClipSelect?.(clip.id)}
              >
                <span className="text-xs font-semibold px-2 py-1 block truncate">{clip.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
