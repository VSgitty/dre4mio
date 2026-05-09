'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ExportModalProps {
  projectId: string;
  sceneId: string | null;
  onClose: () => void;
}

type Format = 'mp4_1080p' | 'mp4_4k' | 'shorts_1080' | 'tiktok_1080' | 'gif';
type Quality = 'draft' | 'high' | 'cinematic';

const FORMATS: { key: Format; label: string; resolution: string; fps: string; icon: string }[] = [
  { key: 'mp4_1080p', label: 'YouTube HD', resolution: '1920×1080', fps: '30fps', icon: '▶' },
  { key: 'mp4_4k', label: '4K Cinema', resolution: '3840×2160', fps: '24fps', icon: '🎬' },
  { key: 'shorts_1080', label: 'Shorts / Reels', resolution: '1080×1920', fps: '30fps', icon: '📱' },
  { key: 'tiktok_1080', label: 'TikTok', resolution: '1080×1920', fps: '60fps', icon: '♪' },
  { key: 'gif', label: 'GIF', resolution: '480×270', fps: '24fps', icon: '🖼' },
];

const QUALITIES: { key: Quality; label: string; desc: string; credits: number }[] = [
  { key: 'draft', label: 'Entwurf', desc: 'Schnell, niedrige Qualität', credits: 1 },
  { key: 'high', label: 'Hoch', desc: 'Ausgewogene Qualität', credits: 5 },
  { key: 'cinematic', label: 'Kinematisch', desc: 'Hollywood-Qualität', credits: 20 },
];

type ExportStatus = 'idle' | 'queued' | 'rendering' | 'done' | 'error';

export function ExportModal({ projectId, sceneId, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<Format>('mp4_1080p');
  const [selectedQuality, setSelectedQuality] = useState<Quality>('high');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedFormatData = FORMATS.find((f) => f.key === selectedFormat)!;
  const selectedQualityData = QUALITIES.find((q) => q.key === selectedQuality)!;

  const handleExport = async () => {
    if (!sceneId) {
      setError('Keine Szene ausgewählt.');
      return;
    }

    setStatus('queued');
    setProgress(0);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId,
          format: selectedFormat,
          quality: selectedQuality,
        }),
      });

      if (!res.ok) throw new Error('Export fehlgeschlagen');
      const { renderId } = await res.json();

      setStatus('rendering');

      // Poll render status
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/render/${renderId}`
          );
          const data = await statusRes.json();
          setProgress(data.progress ?? 0);

          if (data.status === 'completed') {
            clearInterval(poll);
            setDownloadUrl(data.url);
            setStatus('done');
          } else if (data.status === 'failed') {
            clearInterval(poll);
            setError(data.error ?? 'Render-Fehler');
            setStatus('error');
          }
        } catch {
          // retry
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && status !== 'rendering' && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-lg bg-monopol-dark border border-monopol-neon/20 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold">Serie exportieren</h2>
          {status !== 'rendering' && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6">
          {status === 'done' ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Export abgeschlossen!</h3>
              <p className="text-gray-400 text-sm mb-6">
                {selectedFormatData.label} · {selectedFormatData.resolution} · {selectedQualityData.label}
              </p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Video herunterladen
                </a>
              )}
            </div>
          ) : status === 'rendering' || status === 'queued' ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-monopol-neon/10 border border-monopol-neon/20 flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-monopol-neon/30 border-t-monopol-neon rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-bold mb-1">
                {status === 'queued' ? 'Wird eingereiht...' : 'Rendering läuft...'}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {selectedFormatData.label} · {selectedFormatData.resolution}
              </p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-monopol-accent to-monopol-neon rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-600">{progress}% abgeschlossen</p>
            </div>
          ) : (
            <>
              {/* Format selection */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt.key}
                      onClick={() => setSelectedFormat(fmt.key)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedFormat === fmt.key
                          ? 'border-monopol-neon/50 bg-monopol-neon/10 text-white'
                          : 'border-white/5 bg-monopol-darker/50 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      <div className="text-lg mb-1">{fmt.icon}</div>
                      <div className="text-xs font-semibold">{fmt.label}</div>
                      <div className="text-[10px] text-gray-500">{fmt.resolution}</div>
                      <div className="text-[10px] text-gray-600">{fmt.fps}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality selection */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Qualität
                </label>
                <div className="space-y-2">
                  {QUALITIES.map((q) => (
                    <button
                      key={q.key}
                      onClick={() => setSelectedQuality(q.key)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                        selectedQuality === q.key
                          ? 'border-monopol-neon/50 bg-monopol-neon/10'
                          : 'border-white/5 bg-monopol-darker/50 hover:border-white/15'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">{q.label}</p>
                        <p className="text-[11px] text-gray-500">{q.desc}</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            selectedQuality === q.key
                              ? 'bg-monopol-neon/20 text-monopol-neon'
                              : 'bg-white/5 text-gray-500'
                          }`}
                        >
                          {q.credits} Credits
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Summary + render button */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-xs text-gray-500">
                  {selectedFormatData.resolution} · {selectedFormatData.fps} ·{' '}
                  <span className="text-monopol-neon">{selectedQualityData.credits} Credits</span>
                </div>
                <button
                  onClick={handleExport}
                  disabled={!sceneId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-monopol-accent/30 transition-all disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Render starten
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
