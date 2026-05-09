import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from './auth';

const router = Router();
const prisma = new PrismaClient();

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
});

// GET /api/projects
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId!, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, name: true, description: true, thumbnail: true,
        createdAt: true, updatedAt: true,
        _count: { select: { scenes: true } },
      },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const project = await prisma.project.create({
      data: { userId: req.userId!, ...parsed.data },
    });
    // Create default first scene
    await prisma.scene.create({
      data: { projectId: project.id, name: 'Szene 01', duration: 30, fps: 30, width: 1920, height: 1080 },
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects/:projectId
router.get('/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId!, deletedAt: null },
      include: {
        scenes: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, duration: true, fps: true, width: true, height: true, updatedAt: true },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PATCH /api/projects/:projectId
router.patch('/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  const parsed = UpdateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const existing = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId!, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    const project = await prisma.project.update({ where: { id: projectId }, data: parsed.data });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:projectId
router.delete('/:projectId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  try {
    const existing = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId!, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    await prisma.project.update({ where: { id: projectId }, data: { deletedAt: new Date() } });
    res.json({ message: 'Project deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
