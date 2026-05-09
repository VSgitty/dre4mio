import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from './auth';

const router = Router();
const prisma = new PrismaClient();

const UpdateSceneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  duration: z.number().min(1).max(3600).optional(),
  fps: z.number().int().min(12).max(120).optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  data: z.record(z.any()).optional(),
});

// GET /api/scenes/:sceneId
router.get('/:sceneId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { sceneId } = req.params;
  try {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        clips: { include: { asset: { select: { id: true, name: true, type: true, url: true, thumbnail: true } } } },
        project: { select: { userId: true } },
      },
    });
    if (!scene || scene.project.userId !== req.userId) return res.status(404).json({ error: 'Scene not found' });
    res.json({ scene, clips: scene.clips, assets: scene.clips.map((c) => c.asset).filter(Boolean) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch scene' });
  }
});

// PATCH /api/scenes/:sceneId
router.patch('/:sceneId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { sceneId } = req.params;
  const parsed = UpdateSceneSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const scene = await prisma.scene.findUnique({ where: { id: sceneId }, include: { project: { select: { userId: true } } } });
    if (!scene || scene.project.userId !== req.userId) return res.status(404).json({ error: 'Scene not found' });
    const updated = await prisma.scene.update({ where: { id: sceneId }, data: parsed.data as any });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update scene' });
  }
});

// DELETE /api/scenes/:sceneId
router.delete('/:sceneId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { sceneId } = req.params;
  try {
    const scene = await prisma.scene.findUnique({ where: { id: sceneId }, include: { project: { select: { userId: true } } } });
    if (!scene || scene.project.userId !== req.userId) return res.status(404).json({ error: 'Scene not found' });
    await prisma.scene.update({ where: { id: sceneId }, data: { deletedAt: new Date() } });
    res.json({ message: 'Scene deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete scene' });
  }
});

export default router;
