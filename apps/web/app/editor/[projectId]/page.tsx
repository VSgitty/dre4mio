'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/lib/store/editor-store';
import { useAuth } from '@/lib/auth/auth-context';
import { CanvasEditor } from '@monopol/editor';
import { ProTimeline } from '@/components/editor/ProTimeline';
import { InspectorPanel } from '@/components/editor/InspectorPanel';
import { MediaLibrary } from '@/components/editor/MediaLibrary';
import { AIDirectorChat } from '@/components/editor/AIDirectorChat';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { ScanUploadModal } from '@/components/editor/ScanUploadModal';
import { ExportModal } from '@/components/editor/ExportModal';
import { useProject } from '@/lib/hooks/useProject';
import { useScene } from '@/lib/hooks/useScene';

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const store = useEditorStore();

  const { project, loading: projectLoading } = useProject(params.projectId);
  const { scene, assets, clips, loading: sceneLoading } = useScene(store.sceneId);

  const [showScanModal, setShowScanModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [timelineHeight, setTimelineHeight] = useState(200);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Set project in store on load
  useEffect(() => {
    if (params.projectId) {
      store.setProjectId(params.projectId);
    }
  }, [params.projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ') {
        e.preventDefault();
        store.setPlaybackState(store.playbackState === 'playing' ? 'paused' : 'playing');
      }
      if (e.key === 'Escape') {
        store.clearSelection();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        // TODO: undo
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        // TODO: redo
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedAssets.length > 0) {
          // TODO: delete selected
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.playbackState, store.selectedAssets]);

  const handleSave = useCallback(async () => {
    setSavingState('saving');
    try {
      // TODO: save scene data to API
      await new Promise((r) => setTimeout(r, 500));
      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 2000);
    } catch {
      setSavingState('idle');
    }
  }, []);

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-monopol-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-monopol-neon/30 border-t-monopol-neon rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-monopol-darker text-white flex flex-col overflow-hidden select-none">
      {/* ── Top Bar ── */}
      <EditorToolbar
        projectName={project?.name ?? 'Untitled'}
        savingState={savingState}
        onBack={() => router.push('/dashboard')}
        onSave={handleSave}
        onExport={() => setShowExportModal(true)}
        onScan={() => setShowScanModal(true)}
        onToggleTimeline={store.toggleTimeline}
        onToggleAssets={store.toggleAssets}
        onToggleInspector={store.toggleInspector}
        onToggleAIChat={() => setShowAIChat(!showAIChat)}
        showTimeline={store.showTimeline}
        showAssets={store.showAssets}
        showInspector={store.showInspector}
        showAIChat={showAIChat}
        playbackState={store.playbackState}
        onPlaybackToggle={() =>
          store.setPlaybackState(store.playbackState === 'playing' ? 'paused' : 'playing')
        }
      />

      {/* ── Main workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Media Library */}
        <AnimatePresence initial={false}>
          {store.showAssets && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-r border-white/5 bg-monopol-dark/60 overflow-hidden"
              style={{ width: leftPanelWidth }}
            >
              <MediaLibrary
                projectId={params.projectId}
                onAssetDrop={(asset) => {
                  // handled by canvas
                }}
                onScanClick={() => setShowScanModal(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Canvas + Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas viewport */}
          <div className="flex-1 overflow-hidden relative bg-[#050810]">
            {/* Canvas grid bg */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,217,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {sceneLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-600 text-sm">Select or create a scene to start editing</p>
              </div>
            ) : (
              <CanvasEditor
                assets={assets ?? []}
                onAssetSelect={store.selectAsset}
              />
            )}

            {/* Scene not selected prompt */}
            {!store.sceneId && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="border border-dashed border-monopol-neon/20 rounded-2xl p-12 text-center max-w-sm">
                  <div className="w-16 h-16 rounded-xl bg-monopol-neon/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-monopol-neon/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No Scene Selected</h3>
                  <p className="text-sm text-gray-600">
                    Create or select a scene from the media library to begin editing.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <AnimatePresence initial={false}>
            {store.showTimeline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: timelineHeight, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 border-t border-white/5 overflow-hidden"
                style={{ height: timelineHeight }}
              >
                <ProTimeline
                  clips={clips ?? []}
                  duration={scene?.duration ?? 30}
                  fps={scene?.fps ?? 30}
                  currentTime={store.currentTime}
                  onTimeChange={store.setCurrentTime}
                  onClipSelect={store.selectAsset}
                  playbackState={store.playbackState}
                  onPlaybackToggle={() =>
                    store.setPlaybackState(store.playbackState === 'playing' ? 'paused' : 'playing')
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Inspector + AI */}
        <div className="flex-shrink-0 flex" style={{ width: rightPanelWidth + (showAIChat ? 320 : 0) }}>
          {/* Inspector */}
          <AnimatePresence initial={false}>
            {store.showInspector && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: rightPanelWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-l border-white/5 bg-monopol-dark/60 overflow-hidden"
                style={{ width: rightPanelWidth }}
              >
                <InspectorPanel
                  selectedAssets={store.selectedAssets}
                  sceneData={scene}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Director Chat */}
          <AnimatePresence initial={false}>
            {showAIChat && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-l border-white/5 bg-monopol-dark/40 overflow-hidden"
                style={{ width: 320 }}
              >
                <AIDirectorChat
                  projectId={params.projectId}
                  sceneId={store.sceneId}
                  onClose={() => setShowAIChat(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showScanModal && (
          <ScanUploadModal
            projectId={params.projectId}
            onClose={() => setShowScanModal(false)}
            onComplete={(asset) => {
              setShowScanModal(false);
              // Asset lands in media library automatically via refetch
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExportModal && (
          <ExportModal
            projectId={params.projectId}
            sceneId={store.sceneId}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
