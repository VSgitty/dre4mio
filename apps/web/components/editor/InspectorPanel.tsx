'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InspectorPanelProps {
  selectedAssets: string[];
  sceneData: any;
}

export function InspectorPanel({ selectedAssets, sceneData }: InspectorPanelProps) {
  const hasSelection = selectedAssets.length > 0;

  return (
    <div className="h-full flex flex-col bg-monopol-dark/40 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
          {hasSelection
            ? `${selectedAssets.length} Object${selectedAssets.length > 1 ? 's' : ''} Selected`
            : 'Eigenschaften'}
        </h3>
      </div>

      {hasSelection ? (
        <ObjectInspector assetIds={selectedAssets} />
      ) : sceneData ? (
        <SceneInspector scene={sceneData} />
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <p className="text-xs text-gray-600">Wähle ein Objekt oder eine Szene aus.</p>
        </div>
      )}

      {/* Animation section - always visible */}
      <div className="border-t border-white/5">
        <CollapsibleSection title="Animation" defaultOpen>
          <div className="space-y-2">
            <SelectField label="Eingang" options={['Einblenden', 'Schieben', 'Skalieren', 'Keine']} />
            <SelectField label="Ausgang" options={['Ausblenden', 'Schieben', 'Skalieren', 'Keine']} />
            <SelectField label="Bewegung" options={['Gehen', 'Laufen', 'Schweben', 'Stehen']} />
          </div>
          <button className="mt-3 w-full py-2 text-xs border border-monopol-neon/20 text-monopol-neon rounded-lg hover:bg-monopol-neon/10 transition-colors flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            + KI Verbessern
          </button>
        </CollapsibleSection>
      </div>
    </div>
  );
}

function ObjectInspector({ assetIds }: { assetIds: string[] }) {
  return (
    <div className="flex-1">
      <CollapsibleSection title="Transform" defaultOpen>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="X" value={540} unit="px" />
            <NumberField label="Y" value={320} unit="px" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Breite" value={200} unit="px" />
            <NumberField label="Höhe" value={300} unit="px" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Skalierung" value={100} unit="%" />
            <NumberField label="Rotation" value={0} unit="°" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Darstellung">
        <div className="space-y-2">
          <SliderField label="Deckkraft" value={100} min={0} max={100} unit="%" />
          <SelectField label="Überblendung" options={['Normal', 'Multiplizieren', 'Aufhellen', 'Bildschirm']} />
        </div>
      </CollapsibleSection>
    </div>
  );
}

function SceneInspector({ scene }: { scene: any }) {
  return (
    <div className="flex-1">
      <CollapsibleSection title="Szene" defaultOpen>
        <div className="space-y-2">
          <InputField label="Name" value={scene?.name ?? ''} />
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Breite" value={scene?.width ?? 1920} unit="px" />
            <NumberField label="Höhe" value={scene?.height ?? 1080} unit="px" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Dauer" value={scene?.duration ?? 30} unit="s" />
            <NumberField label="FPS" value={scene?.fps ?? 30} unit="" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="KI Stil">
        <div className="space-y-2">
          <SelectField
            label="Stil"
            options={['Kino', 'Anime', 'Cartoon', 'Realistisch', 'Aquarell', 'Comic']}
          />
          <SelectField
            label="Beleuchtung"
            options={['Natürlich', 'Dramatisch', 'Weich', 'Neon', 'Golden Hour']}
          />
          <div className="grid grid-cols-3 gap-1 mt-2">
            {['🎬', '🌅', '🌃', '🏔️', '🌊', '🌲'].map((emoji, i) => (
              <button
                key={i}
                className="aspect-square bg-monopol-darker rounded-lg text-lg hover:bg-monopol-neon/10 border border-white/5 hover:border-monopol-neon/30 transition-all flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NumberField({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          defaultValue={value}
          className="w-full px-2 py-1.5 bg-monopol-darker border border-white/5 rounded text-xs text-gray-200 focus:outline-none focus:border-monopol-neon/30 appearance-none"
        />
        {unit && <span className="text-[10px] text-gray-600 ml-1 flex-shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function InputField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full px-2 py-1.5 bg-monopol-darker border border-white/5 rounded text-xs text-gray-200 focus:outline-none focus:border-monopol-neon/30"
      />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <select className="w-full px-2 py-1.5 bg-monopol-darker border border-white/5 rounded text-xs text-gray-200 focus:outline-none focus:border-monopol-neon/30 appearance-none cursor-pointer">
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}) {
  const [val, setVal] = React.useState(value);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] text-gray-500">{label}</label>
        <span className="text-[10px] text-gray-400">
          {val}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full accent-monopol-neon"
      />
    </div>
  );
}
