'use client';

import { create } from 'zustand';

export interface TimelineState {
  clips: Array<{ id: string; name: string; startTime: number; duration: number }>;
  currentTime: number;
  isPlaying: boolean;

  addClip: (clip: any) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: any) => void;
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  clips: [],
  currentTime: 0,
  isPlaying: false,

  addClip: (clip) => set((state) => ({ clips: [...state.clips, clip] })),
  removeClip: (clipId) =>
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== clipId),
    })),
  updateClip: (clipId, updates) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
    })),
  setCurrentTime: (time) => set({ currentTime: time }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false, currentTime: 0 }),
}));
