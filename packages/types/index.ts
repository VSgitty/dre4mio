// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Scene Types
export interface Scene {
  id: string;
  projectId: string;
  name: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Types
export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  thumbnail?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Clip Types
export interface Clip {
  id: string;
  sceneId: string;
  assetId?: string;
  name: string;
  startTime: number;
  duration: number;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Render Types
export interface Render {
  id: string;
  userId: string;
  sceneId?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  format: string;
  quality: string;
  progress: number;
  url?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Editor State
export interface EditorState {
  projectId: string | null;
  sceneId: string | null;
  selectedAssets: string[];
  selectedLayer: string | null;
  zoom: number;
  panX: number;
  panY: number;
}

// Canvas Transform
export interface CanvasTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

// Timeline Keyframe
export interface Keyframe {
  time: number;
  value: any;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Animation Timeline
export interface AnimationTimeline {
  clipId: string;
  property: string;
  keyframes: Keyframe[];
}
