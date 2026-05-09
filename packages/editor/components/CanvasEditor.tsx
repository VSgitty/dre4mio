'use client';

import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';

interface CanvasEditorProps {
  width?: number;
  height?: number;
  onAssetSelect?: (assetId: string) => void;
  assets?: Array<{ id: string; url: string; x: number; y: number }>;
}

export function CanvasEditor({
  width = 1920,
  height = 1080,
  onAssetSelect,
  assets = [],
}: CanvasEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.5);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition()!.x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition()!.y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);

    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition()!.x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition()!.y / newScale) * newScale,
    };

    stage.position(newPos);
    stage.scale({ x: newScale, y: newScale });
  };

  return (
    <div className="w-full h-full bg-monopol-darker rounded-lg overflow-hidden border border-monopol-neon/20">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        draggable
        style={{ backgroundColor: '#050810' }}
      >
        <Layer>
          {assets.map((asset) => (
            <AssetItem
              key={asset.id}
              asset={asset}
              isSelected={selectedId === asset.id}
              onSelect={() => {
                setSelectedId(asset.id);
                onAssetSelect?.(asset.id);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

function AssetItem({
  asset,
  isSelected,
  onSelect,
}: {
  asset: { id: string; url: string; x: number; y: number };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [image] = useImage(asset.url);
  const imageRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={asset.x}
        y={asset.y}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        onDragEnd={(e) => {
          // Sync position back to store
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
}
