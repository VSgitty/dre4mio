'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanUploadModalProps {
  projectId: string;
  onClose: () => void;
  onComplete: (asset: any) => void;
}

type PipelineStep = 'upload' | 'preprocessing' | 'background_removal' | 'segmentation' | 'extraction' | 'done' | 'error';

const STEPS: { key: PipelineStep; label: string; description: string }[] = [
  { key: 'upload', label: 'Hochladen', description: 'Bild wird hochgeladen...' },
  { key: 'preprocessing', label: 'Vorverarbeitung', description: 'Bild wird optimiert...' },
  { key: 'background_removal', label: 'Hintergrund entfernen', description: 'KI entfernt den Hintergrund...' },
  { key: 'segmentation', label: 'Segmentierung', description: 'Objekte werden erkannt...' },
  { key: 'extraction', label: 'Extraktion', description: 'Charakter wird extrahiert...' },
];

export function ScanUploadModal({ projectId, onClose, onComplete }: ScanUploadModalProps) {
  const [step, setStep] = useState<PipelineStep>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Bitte lade ein Bild hoch (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('Die Datei darf maximal 20MB groß sein.');
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        // ── Step 1: Upload ─────────────────────────────────────────
        setStep('upload');
        setProcessingProgress(10);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/assets/upload`,
          { method: 'POST', body: formData }
        );
        if (!uploadRes.ok) throw new Error('Upload fehlgeschlagen.');
        const { assetId, uploadUrl } = await uploadRes.json();

        setProcessingProgress(25);

        // ── Step 2: Trigger AI pipeline ────────────────────────────
        setStep('background_removal');
        setProcessingProgress(40);

        const processRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ai/remove-background`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId }),
          }
        );
        if (!processRes.ok) throw new Error('Verarbeitung fehlgeschlagen.');
        const { processId } = await processRes.json();

        // ── Step 3: Poll for result ────────────────────────────────
        setStep('segmentation');

        await new Promise<void>((resolve, reject) => {
          let attempts = 0;
          pollRef.current = setInterval(async () => {
            attempts++;
            if (attempts > 60) {
              clearInterval(pollRef.current!);
              reject(new Error('Timeout. Bitte versuche es erneut.'));
              return;
            }

            try {
              const statusRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ai/status/${processId}`
              );
              const { status, resultUrl: url, progress } = await statusRes.json();

              setProcessingProgress(40 + Math.min(progress ?? 0, 50));

              if (status === 'completed') {
                clearInterval(pollRef.current!);
                setResultUrl(url);
                resolve();
              } else if (status === 'failed') {
                clearInterval(pollRef.current!);
                reject(new Error('KI-Verarbeitung fehlgeschlagen.'));
              }
            } catch {
              // retry
            }
          }, 2000);
        });

        // ── Done ───────────────────────────────────────────────────
        setStep('extraction');
        setProcessingProgress(90);
        await new Promise((r) => setTimeout(r, 500));
        setStep('done');
        setProcessingProgress(100);

        onComplete({ assetId, url: resultUrl });
      } catch (err: any) {
        if (pollRef.current) clearInterval(pollRef.current);
        setError(err.message ?? 'Unbekannter Fehler.');
        setStep('error');
      }
    },
    [projectId, onComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const isProcessing =
    step !== 'upload' && step !== 'done' && step !== 'error' && !!preview;

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-2xl bg-monopol-dark border border-monopol-neon/20 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold">Zeichnung scannen</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Lade ein Foto deiner Zeichnung hoch – KI erkennt & extrahiert alles automatisch.
            </p>
          </div>
          {!isProcessing && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 'done' ? (
            // ── Done state ──────────────────────────────────────
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-bold mb-2">Fertig!</h3>
              <p className="text-sm text-gray-400 mb-6">Dein Charakter wurde erfolgreich extrahiert.</p>

              <div className="flex gap-4 justify-center mb-6">
                {preview && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Original</p>
                    <img src={preview} alt="Original" className="w-32 h-32 object-contain rounded-lg border border-white/10" />
                  </div>
                )}
                {resultUrl && (
                  <div className="text-center">
                    <p className="text-xs text-green-400 mb-2">Extrahiert ✓</p>
                    <div className="w-32 h-32 rounded-lg border border-green-500/30 bg-monopol-darker/50 flex items-center justify-center"
                         style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="10" height="10" fill="%23333"%3E%3C/rect%3E%3Crect x="10" y="10" width="10" height="10" fill="%23333"%3E%3C/rect%3E%3Crect x="10" y="0" width="10" height="10" fill="%23222"%3E%3C/rect%3E%3Crect x="0" y="10" width="10" height="10" fill="%23222"%3E%3C/rect%3E%3C/svg%3E")' }}>
                      <img src={resultUrl} alt="Extracted" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onComplete({ url: resultUrl })}
                className="px-6 py-3 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Zur Mediathek hinzufügen
              </button>
            </div>
          ) : step === 'error' ? (
            // ── Error state ─────────────────────────────────────
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-red-400">Fehler</h3>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => {
                  setStep('upload');
                  setPreview(null);
                  setError(null);
                  setProcessingProgress(0);
                }}
                className="px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-all"
              >
                Erneut versuchen
              </button>
            </div>
          ) : isProcessing ? (
            // ── Processing state ────────────────────────────────
            <div>
              <div className="flex gap-6">
                {/* Preview */}
                {preview && (
                  <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 relative">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain bg-monopol-darker" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-monopol-neon/30 border-t-monopol-neon rounded-full animate-spin" />
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div className="flex-1">
                  <div className="space-y-3">
                    {STEPS.map((s, i) => {
                      const isDone = i < currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div key={s.key} className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isDone
                                ? 'bg-green-500/20 border border-green-500/40'
                                : isCurrent
                                ? 'bg-monopol-neon/20 border border-monopol-neon/40'
                                : 'bg-white/5 border border-white/10'
                            }`}
                          >
                            {isDone ? (
                              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : isCurrent ? (
                              <div className="w-2 h-2 rounded-full bg-monopol-neon animate-pulse" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-white/20" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-medium ${
                                isDone ? 'text-green-400' : isCurrent ? 'text-monopol-neon' : 'text-gray-600'
                              }`}
                            >
                              {s.label}
                            </p>
                            {isCurrent && (
                              <p className="text-[10px] text-gray-500">{s.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-monopol-accent to-monopol-neon rounded-full"
                        animate={{ width: `${processingProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1 text-right">{processingProgress}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ── Upload state ─────────────────────────────────────
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-monopol-neon bg-monopol-neon/5'
                    : 'border-white/10 hover:border-monopol-neon/40 hover:bg-white/2'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-monopol-neon/10 border border-monopol-neon/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-monopol-neon/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <h3 className="text-base font-semibold mb-1">Zeichnung hochladen</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Foto ziehen & ablegen, oder klicken zum Auswählen
                </p>
                <p className="text-xs text-gray-600">JPG, PNG, WEBP bis zu 20MB</p>

                {isDragging && (
                  <div className="absolute inset-0 rounded-xl bg-monopol-neon/10 flex items-center justify-center">
                    <p className="text-monopol-neon font-bold">Loslassen zum Hochladen</p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: '✏️', title: 'Papier & Bleistift', desc: 'Zeichne auf normales Papier' },
                  { icon: '📷', title: 'Foto aufnehmen', desc: 'Fotografiere deine Zeichnung' },
                  { icon: '🤖', title: 'KI extrahiert', desc: 'Automatische Digitalisierung' },
                ].map((tip) => (
                  <div key={tip.title} className="p-3 bg-monopol-darker/50 rounded-lg border border-white/5 text-center">
                    <div className="text-2xl mb-1">{tip.icon}</div>
                    <p className="text-xs font-medium text-gray-300">{tip.title}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </motion.div>
  );
}
