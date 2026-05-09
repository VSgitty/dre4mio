'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface EditorState {
  projectId: string | null;
  sceneId: string | null;
  selectedAssets: string[];
  selectedLayer: string | null;
  zoom: number;
  panX: number;
  panY: number;
  showTimeline: boolean;
  showAssets: boolean;
  showInspector: boolean;
  playbackState: 'playing' | 'paused' | 'stopped';
  currentTime: number;
}

interface EditorStore extends EditorState {
  // Project actions
  setProjectId: (id: string) => void;
  setSceneId: (id: string) => void;

  // View actions
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;

  // UI toggles
  toggleTimeline: () => void;
  toggleAssets: () => void;
  toggleInspector: () => void;

  // Selection
  selectAsset: (id: string) => void;
  deselectAsset: (id: string) => void;
  clearSelection: () => void;
  selectLayer: (id: string) => void;

  // Playback
  setPlaybackState: (state: 'playing' | 'paused' | 'stopped') => void;
  setCurrentTime: (time: number) => void;

  // Reset
  reset: () => void;
}

const initialState: EditorState = {
  projectId: null,
  sceneId: null,
  selectedAssets: [],
  selectedLayer: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  showTimeline: true,
  showAssets: true,
  showInspector: true,
  playbackState: 'stopped',
  currentTime: 0,
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      ...initialState,

      setProjectId: (id) => set({ projectId: id }),
      setSceneId: (id) => set({ sceneId: id }),

      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(4, zoom)) }),
      setPan: (x, y) => set({ panX: x, panY: y }),

      toggleTimeline: () => set((state) => ({ showTimeline: !state.showTimeline })),
      toggleAssets: () => set((state) => ({ showAssets: !state.showAssets })),
      toggleInspector: () => set((state) => ({ showInspector: !state.showInspector })),

      selectAsset: (id) =>
        set((state) => ({
          selectedAssets: [...new Set([...state.selectedAssets, id])],
        })),
      deselectAsset: (id) =>
        set((state) => ({
          selectedAssets: state.selectedAssets.filter((aid) => aid !== id),
        })),
      clearSelection: () => set({ selectedAssets: [] }),
      selectLayer: (id) => set({ selectedLayer: id }),

      setPlaybackState: (state) => set({ playbackState: state }),
      setCurrentTime: (time) => set({ currentTime: time }),

      reset: () => set(initialState),
    }),
    {
      name: 'monopol-editor-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        zoom: state.zoom,
        showTimeline: state.showTimeline,
        showAssets: state.showAssets,
        showInspector: state.showInspector,
      }),
    }
  )
);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
