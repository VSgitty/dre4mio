import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from './auth';

const router = Router();
const prisma = new PrismaClient();

const RENDER_SERVICE_URL = process.env.RENDER_SERVICE_URL ?? 'http://localhost:5000';

const StartRenderSchema = z.object({
  sceneId: z.string(),
  format: z.enum(['mp4_1080p', 'mp4_4k', 'shorts_1080', 'tiktok_1080', 'gif']),
  quality: z.enum(['draft', 'high', 'cinematic']),
});

// POST /api/render (start render)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const parsed = StartRenderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const scene = await prisma.scene.findUnique({
      where: { id: parsed.data.sceneId },
      include: { project: { select: { userId: true } }, clips: { include: { asset: true } } },
    });
    if (!scene || scene.project.userId !== req.userId) return res.status(404).json({ error: 'Scene not found' });

    // Check subscription/credits
    const sub = await prisma.subscription.findUnique({ where: { userId: req.userId! } });
    const creditCost = { draft: 1, high: 5, cinematic: 20 }[parsed.data.quality];
    if (!sub || sub.credits < creditCost) return res.status(402).json({ error: 'Insufficient credits' });

    const render = await prisma.render.create({
      data: {
        userId: req.userId!,
        sceneId: parsed.data.sceneId,
        format: parsed.data.format,
        quality: parsed.data.quality,
        status: 'queued',
      },
    });

    // Deduct credits
    await prisma.subscription.update({
      where: { userId: req.userId! },
      data: { credits: { decrement: creditCost } },
    });

    // Dispatch to render service (non-blocking)
    fetch(`${RENDER_SERVICE_URL}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        renderId: render.id,
        sceneData: scene,
        format: parsed.data.format,
        quality: parsed.data.quality,
        callbackUrl: `${process.env.API_URL}/api/render/callback/${render.id}`,
      }),
    }).catch(console.error);

    res.status(202).json({ renderId: render.id, status: 'queued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start render' });
  }
});

// GET /api/render/:renderId
router.get('/:renderId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { renderId } = req.params;
  try {
    const render = await prisma.render.findFirst({ where: { id: renderId, userId: req.userId! } });
    if (!render) return res.status(404).json({ error: 'Render not found' });
    res.json(render);
  } catch {
    res.status(500).json({ error: 'Failed to fetch render' });
  }
});

// POST /api/render/callback/:renderId (called by render worker)
router.post('/callback/:renderId', async (req, res) => {
  const { renderId } = req.params;
  const { status, url, progress, error } = req.body;
  try {
    await prisma.render.update({
      where: { id: renderId },
      data: { status, url: url ?? undefined, progress: progress ?? undefined, error: error ?? undefined },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Callback failed' });
  }
});

// GET /api/render (history)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const renders = await prisma.render.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(renders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch renders' });
  }
});

export default router;
