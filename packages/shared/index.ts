import { z } from 'zod';

// Validation schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const CreateSceneSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1).max(255),
  duration: z.number().positive().optional(),
  fps: z.number().int().min(1).max(60).optional(),
});

export const CreateClipSchema = z.object({
  sceneId: z.string().cuid(),
  assetId: z.string().cuid().optional(),
  name: z.string().min(1).max(255),
  startTime: z.number().nonnegative(),
  duration: z.number().positive(),
});

export const UpdateTransformSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  rotation: z.number().optional(),
  scaleX: z.number().positive().optional(),
  scaleY: z.number().positive().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}

// API client helpers
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PROJECTS: '/api/projects',
  SCENES: '/api/scenes',
  ASSETS: '/api/assets',
  RENDER: '/api/render',
  AI: '/api/ai',
  SUBSCRIPTIONS: '/api/subscriptions',
};

// Constants
export const SCENE_DEFAULTS = {
  WIDTH: 1920,
  HEIGHT: 1080,
  FPS: 30,
  DURATION: 30,
};

export const EXPORT_FORMATS = [
  { id: 'mp4', label: 'MP4 (H.264)', mimeType: 'video/mp4' },
  { id: 'webm', label: 'WebM (VP9)', mimeType: 'video/webm' },
  { id: 'mov', label: 'MOV (ProRes)', mimeType: 'video/quicktime' },
  { id: 'gif', label: 'Animated GIF', mimeType: 'image/gif' },
];

export const QUALITY_PRESETS = [
  { id: '480p', label: '480p (0.9 MP)', bitrate: '1500k' },
  { id: '720p', label: '720p (2.1 MP)', bitrate: '5000k' },
  { id: '1080p', label: '1080p (4.7 MP)', bitrate: '10000k' },
  { id: '4k', label: '4K (20.9 MP)', bitrate: '50000k' },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 100,
    features: ['Basic editing', '480p export', 'Cloud storage', '3 projects'],
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 9.99,
    credits: 1000,
    features: ['AI Director', '1080p export', 'Unlimited storage', 'Unlimited projects'],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 29.99,
    credits: 10000,
    features: ['All Creator features', '4K export', 'Priority rendering', 'API access'],
  },
];
