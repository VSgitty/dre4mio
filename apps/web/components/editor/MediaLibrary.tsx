'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'all' | 'drawings' | 'objects' | 'scenes' | 'backgrounds';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'character' | 'background' | 'audio' | 'scene';
  url: string;
  thumbnail?: string;
  createdAt: string;
}

interface MediaLibraryProps {
  projectId: string;
  onAssetDrop?: (asset: Asset) => void;
  onScanClick?: () => void;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'drawings', label: 'Zeichnungen' },
  { key: 'objects', label: 'Objekte' },
  { key: 'scenes', label: 'Szenen' },
  { key: 'backgrounds', label: 'Hintergründe' },
];

export function MediaLibrary({ projectId, onAssetDrop, onScanClick }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data – replace with useAssets hook
  const mockAssets: Asset[] = [];

  const filtered = mockAssets.filter(
    (a) =>
      (activeTab === 'all' ||
        (activeTab === 'drawings' && a.type === 'character') ||
        (activeTab === 'objects' && a.type === 'image') ||
        (activeTab === 'scenes' && a.type === 'scene') ||
        (activeTab === 'backgrounds' && a.type === 'background')) &&
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // TODO: upload to API
      await new Promise((r) => setTimeout(r, 1000));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-monopol-dark/40">
      {/* Header */}
      <div className="p-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Mediathek</span>
          <div className="flex gap-1">
            <button
              onClick={onScanClick}
              title="Scan drawing"
              className="p-1.5 rounded hover:bg-monopol-neon/10 text-monopol-neon/60 hover:text-monopol-neon transition-colors"
            >
              <ScanIcon />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload file"
              className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              disabled={uploading}
            >
              {uploading ? <SpinnerIcon /> : <UploadIcon />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 bg-monopol-darker/60 border border-white/5 rounded text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-monopol-neon/30"
          />
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-white/5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-3 py-2 text-[10px] font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-monopol-neon border-b-2 border-monopol-neon -mb-px'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-12 h-12 rounded-xl bg-monopol-neon/5 border border-monopol-neon/10 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6 text-monopol-neon/30" />
            </div>
            <p className="text-xs text-gray-600 mb-3">
              {searchQuery ? 'No assets match your search.' : 'No assets yet.'}
            </p>
            {!searchQuery && (
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={onScanClick}
                  className="w-full py-2 text-xs bg-monopol-neon/10 border border-monopol-neon/20 text-monopol-neon rounded-lg hover:bg-monopol-neon/20 transition-colors"
                >
                  Scan Drawing
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 text-xs bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Upload File
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((asset) => (
              <AssetThumbnail
                key={asset.id}
                asset={asset}
                onDragStart={() => onAssetDrop?.(asset)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Online asset library button */}
      <div className="p-2 border-t border-white/5">
        <button className="w-full py-2 text-xs text-center text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          + Mehr Inhalte holen
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

function AssetThumbnail({ asset, onDragStart }: { asset: Asset; onDragStart: () => void }) {
  return (
    <motion.div
      draggable
      onDragStart={onDragStart}
      className="group relative aspect-square bg-monopol-darker/60 rounded-lg overflow-hidden border border-white/5 hover:border-monopol-neon/30 cursor-grab active:cursor-grabbing transition-all"
      whileHover={{ scale: 1.02 }}
    >
      {asset.thumbnail || asset.url ? (
        <img
          src={asset.thumbnail ?? asset.url}
          alt={asset.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-gray-700" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[9px] text-white font-medium truncate">{asset.name}</p>
      </div>
    </motion.div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ScanIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9V4a1 1 0 011-1h4M3 15v5a1 1 0 001 1h4m10-16h4a1 1 0 011 1v4m0 10v5a1 1 0 01-1 1h-4M8 12h8" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
