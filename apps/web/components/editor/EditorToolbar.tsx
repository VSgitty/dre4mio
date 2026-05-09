'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface EditorToolbarProps {
  projectName: string;
  savingState: 'idle' | 'saving' | 'saved';
  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
  onScan: () => void;
  onToggleTimeline: () => void;
  onToggleAssets: () => void;
  onToggleInspector: () => void;
  onToggleAIChat: () => void;
  showTimeline: boolean;
  showAssets: boolean;
  showInspector: boolean;
  showAIChat: boolean;
  playbackState: 'playing' | 'paused' | 'stopped';
  onPlaybackToggle: () => void;
}

export function EditorToolbar({
  projectName,
  savingState,
  onBack,
  onSave,
  onExport,
  onScan,
  onToggleTimeline,
  onToggleAssets,
  onToggleInspector,
  onToggleAIChat,
  showTimeline,
  showAssets,
  showInspector,
  showAIChat,
  playbackState,
  onPlaybackToggle,
}: EditorToolbarProps) {
  return (
    <header className="h-10 flex items-center bg-monopol-dark border-b border-white/5 px-3 gap-2 flex-shrink-0 z-30">
      {/* Logo / Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
      >
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-xs font-bold text-monopol-neon tracking-wide">M</span>
      </button>

      <div className="w-px h-4 bg-white/10" />

      {/* Menu items */}
      {['Datei', 'Bearbeiten', 'Ansicht', 'KI Tools', 'Projekt', 'Hilfe'].map((item) => (
        <button
          key={item}
          className="text-[11px] text-gray-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
        >
          {item}
        </button>
      ))}

      <div className="flex-1" />

      {/* Project name + save state */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-300 max-w-[160px] truncate">
          {projectName}
        </span>
        {savingState === 'saving' && (
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </span>
        )}
        {savingState === 'saved' && (
          <span className="text-[10px] text-green-400">✓ Saved</span>
        )}
      </div>

      <div className="flex-1" />

      {/* View toggles */}
      <div className="flex items-center gap-0.5">
        <ToggleButton
          label="Assets"
          active={showAssets}
          onClick={onToggleAssets}
          icon={<LibraryIcon />}
        />
        <ToggleButton
          label="Inspector"
          active={showInspector}
          onClick={onToggleInspector}
          icon={<InspectorIcon />}
        />
        <ToggleButton
          label="Timeline"
          active={showTimeline}
          onClick={onToggleTimeline}
          icon={<TimelineIcon />}
        />
        <ToggleButton
          label="KI Chat"
          active={showAIChat}
          onClick={onToggleAIChat}
          icon={<AIIcon />}
          highlight={showAIChat}
        />
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* Scan button */}
      <button
        onClick={onScan}
        title="Scan drawing"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-monopol-neon border border-monopol-neon/25 rounded-md hover:bg-monopol-neon/10 transition-all"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9V4a1 1 0 011-1h4M3 15v5a1 1 0 001 1h4m10-16h4a1 1 0 011 1v4m0 10v5a1 1 0 01-1 1h-4M8 12h8" />
        </svg>
        Scannen
      </button>

      {/* Export */}
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-gradient-to-r from-monopol-accent to-monopol-neon text-white rounded-md hover:shadow-lg hover:shadow-monopol-accent/25 transition-all"
      >
        Exportieren
      </button>
    </header>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
  icon,
  highlight,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded transition-all ${
        active
          ? highlight
            ? 'bg-monopol-neon/15 text-monopol-neon'
            : 'bg-white/10 text-white'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
      }`}
    >
      {icon}
    </button>
  );
}

function LibraryIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}
function InspectorIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function TimelineIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  );
}
function AIIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
