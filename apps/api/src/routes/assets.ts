import { Router, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { authenticateToken, AuthRequest } from './auth';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const S3_BUCKET = process.env.S3_BUCKET ?? 'monopol-studio';
const CDN_URL = process.env.CDN_URL ?? '';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4']);

// POST /api/assets/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  if (!ALLOWED_MIME.has(req.file.mimetype)) return res.status(400).json({ error: 'File type not allowed' });

  const { projectId } = req.body;
  const ext = req.file.originalname.split('.').pop()?.toLowerCase() ?? 'bin';
  const key = `assets/${req.userId}/${nanoid()}.${ext}`;
  const thumbKey = `thumbnails/${req.userId}/${nanoid()}.webp`;

  try {
    // Upload original
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET, Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    // Generate thumbnail for images
    let thumbnailUrl: string | undefined;
    if (req.file.mimetype.startsWith('image/')) {
      const thumb = await sharp(req.file.buffer).resize(400, 300, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
      await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: thumbKey, Body: thumb, ContentType: 'image/webp' }));
      thumbnailUrl = CDN_URL ? `${CDN_URL}/${thumbKey}` : await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: thumbKey }), { expiresIn: 3600 * 24 * 7 });
    }

    const assetUrl = CDN_URL ? `${CDN_URL}/${key}` : await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn: 3600 * 24 * 7 });
    const type = req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('audio/') ? 'audio' : 'video';

    const asset = await prisma.asset.create({
      data: {
        userId: req.userId!,
        projectId: projectId ?? null,
        name: req.file.originalname,
        type,
        url: assetUrl,
        thumbnail: thumbnailUrl,
        metadata: { size: req.file.size, mimeType: req.file.mimetype, s3Key: key },
      },
    });

    res.status(201).json({ assetId: asset.id, url: assetUrl, thumbnail: thumbnailUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/assets (list user assets)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { projectId, type } = req.query;
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId: req.userId!,
        deletedAt: null,
        ...(projectId ? { projectId: String(projectId) } : {}),
        ...(type ? { type: String(type) } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(assets);
  } catch {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// DELETE /api/assets/:assetId
router.delete('/:assetId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { assetId } = req.params;
  try {
    const asset = await prisma.asset.findFirst({ where: { id: assetId, userId: req.userId!, deletedAt: null } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    const meta = asset.metadata as Record<string, any>;
    if (meta?.s3Key) {
      await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: meta.s3Key })).catch(console.error);
    }
    await prisma.asset.update({ where: { id: assetId }, data: { deletedAt: new Date() } });
    res.json({ message: 'Asset deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default router;
