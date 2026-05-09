import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import OpenAI from 'openai';
import Replicate from 'replicate';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import { authenticateToken, AuthRequest } from './auth';

const router = Router();
const prisma = new PrismaClient();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });
const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET ?? 'monopol-studio';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const BackgroundRemovalSchema = z.object({
  assetId: z.string(),
});

const GenerateSceneSchema = z.object({
  prompt: z.string().min(5).max(1000),
  style: z.enum(['cinematic', 'anime', 'cartoon', 'realistic', 'watercolor', 'comic']).optional(),
  width: z.number().min(512).max(2048).optional().default(1920),
  height: z.number().min(512).max(2048).optional().default(1080),
});

const DirectorChatSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.object({
    projectId: z.string().optional(),
    sceneId: z.string().optional(),
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

// ─── POST /api/ai/remove-background ──────────────────────────────────────────

router.post('/remove-background', authenticateToken, async (req: AuthRequest, res: Response) => {
  const parsed = BackgroundRemovalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const asset = await prisma.asset.findFirst({
      where: { id: parsed.data.assetId, userId: req.userId! },
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Create AI generation record
    const generation = await prisma.aIGeneration.create({
      data: {
        type: 'background_removal',
        input: { assetId: asset.id, url: asset.url },
        output: {},
        status: 'processing',
      },
    });

    // Fire off async processing via Python AI service
    fetch(`${AI_SERVICE_URL}/api/remove-background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: asset.url,
        generation_id: generation.id,
        callback_url: `${process.env.API_URL}/api/ai/callback/${generation.id}`,
      }),
    }).catch(console.error); // Non-blocking

    res.json({ processId: generation.id, status: 'processing' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start background removal' });
  }
});

// ─── GET /api/ai/status/:processId ───────────────────────────────────────────

router.get('/status/:processId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { processId } = req.params;
  try {
    const generation = await prisma.aIGeneration.findUnique({ where: { id: processId } });
    if (!generation) return res.status(404).json({ error: 'Process not found' });

    const output = generation.output as Record<string, any>;
    res.json({
      status: generation.status,
      progress: output?.progress ?? (generation.status === 'completed' ? 100 : 0),
      resultUrl: output?.resultUrl ?? null,
      error: generation.error ?? null,
    });
  } catch {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// ─── POST /api/ai/callback/:generationId ─────────────────────────────────────

router.post('/callback/:generationId', async (req, res) => {
  const { generationId } = req.params;
  const { status, result_url, progress, error } = req.body;

  try {
    await prisma.aIGeneration.update({
      where: { id: generationId },
      data: {
        status: status === 'success' ? 'completed' : status === 'error' ? 'failed' : 'processing',
        output: { resultUrl: result_url, progress },
        error: error ?? null,
      },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Callback failed' });
  }
});

// ─── POST /api/ai/generate-background ────────────────────────────────────────

router.post('/generate-background', authenticateToken, async (req: AuthRequest, res: Response) => {
  const parsed = GenerateSceneSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const stylePrompts: Record<string, string> = {
      cinematic: 'cinematic photography, dramatic lighting, film grain, professional',
      anime: 'anime art style, vibrant colors, cel shading, Studio Ghibli inspired',
      cartoon: 'cartoon style, bright colors, simple lines, children illustration',
      realistic: 'photorealistic, 8k, detailed, natural lighting',
      watercolor: 'watercolor painting, soft colors, artistic, loose brush strokes',
      comic: 'comic book style, bold lines, halftone, superhero',
    };

    const style = parsed.data.style ?? 'cinematic';
    const enhancedPrompt = `${parsed.data.prompt}, ${stylePrompts[style]}, high quality, detailed background scene, no characters`;

    const generation = await prisma.aIGeneration.create({
      data: {
        type: 'scene_generation',
        input: { prompt: enhancedPrompt, style },
        output: {},
        status: 'processing',
      },
    });

    // Use Replicate SDXL asynchronously
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: enhancedPrompt,
          width: Math.min(parsed.data.width!, 1024),
          height: Math.min(parsed.data.height!, 1024),
          num_outputs: 1,
          guidance_scale: 7.5,
        },
      }
    ) as string[];

    const imageUrl = output[0];

    await prisma.aIGeneration.update({
      where: { id: generation.id },
      data: { status: 'completed', output: { resultUrl: imageUrl } },
    });

    res.json({ generationId: generation.id, url: imageUrl, status: 'completed' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

// ─── POST /api/ai/director/chat (streaming) ───────────────────────────────────

router.post('/director/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  const parsed = DirectorChatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { message, context, history } = parsed.data;

  // Build scene context
  let sceneContext = '';
  if (context?.sceneId) {
    try {
      const scene = await prisma.scene.findUnique({
        where: { id: context.sceneId },
        include: { clips: { include: { asset: true } } },
      });
      if (scene) {
        sceneContext = `\n\nCurrent scene: "${scene.name}" (${scene.duration}s, ${scene.fps}fps, ${scene.width}x${scene.height}). ${scene.clips.length} clips in timeline.`;
      }
    } catch { /* ignore */ }
  }

  const systemPrompt = `You are the AI Director of MONOPOL STUDIO — an expert cinematic storytelling AI. You help creators build animated series and movies.

Your capabilities:
- Generate cinematic scene descriptions and camera directions
- Write compelling dialogue and screenplay
- Suggest animations, transitions, and visual effects
- Create storyboard breakdowns
- Direct character movements and expressions
- Compose cinematographic shots (wide, close-up, dolly, zoom)
- Generate background prompts for AI image generation
- Suggest lighting and mood

Always respond in a cinematic, professional yet inspiring tone. Be concise but impactful. Use film industry terminology.
When generating prompts for images, wrap them in \`[GENERATE: your prompt here]\` tags.
When suggesting timeline actions, wrap them in \`[ACTION: action description]\` tags.${sceneContext}`;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history!.map((h) => ({ role: h.role, content: h.content } as OpenAI.Chat.ChatCompletionMessageParam)),
      { role: 'user', content: message },
    ];

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      stream: true,
      max_tokens: 1500,
      temperature: 0.85,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? '';
      if (content) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Director chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.end();
  }
});

// ─── POST /api/ai/story/generate ─────────────────────────────────────────────

router.post('/story/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { concept, genre, targetLength } = req.body;

  if (!concept) return res.status(400).json({ error: 'concept is required' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional screenwriter and story architect. Generate structured story outlines in JSON format.',
        },
        {
          role: 'user',
          content: `Create a ${genre ?? 'adventure'} story outline for: "${concept}"
Target length: ${targetLength ?? '3 episodes'}

Return JSON with:
{
  "title": "Story title",
  "logline": "One sentence summary",
  "genre": "Genre",
  "themes": ["theme1", "theme2"],
  "characters": [{"name": "Name", "role": "hero/villain/etc", "description": "brief"}],
  "episodes": [{"number": 1, "title": "Title", "summary": "Summary", "scenes": ["Scene 1 brief", "Scene 2 brief"]}]
}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const story = JSON.parse(completion.choices[0].message.content ?? '{}');
    res.json({ story });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Story generation failed' });
  }
});

// ─── POST /api/ai/voice/generate ─────────────────────────────────────────────

router.post('/voice/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { text, voice, projectId } = req.body;

  if (!text || !voice) return res.status(400).json({ error: 'text and voice are required' });
  if (text.length > 2000) return res.status(400).json({ error: 'Text too long (max 2000 chars)' });

  try {
    const elevenLabsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!elevenLabsRes.ok) {
      throw new Error(`ElevenLabs error: ${elevenLabsRes.status}`);
    }

    const audioBuffer = await elevenLabsRes.arrayBuffer();
    const audioKey = `voice/${req.userId}/${nanoid()}.mp3`;

    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: audioKey,
      Body: Buffer.from(audioBuffer),
      ContentType: 'audio/mpeg',
    }));

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: audioKey }),
      { expiresIn: 3600 * 24 }
    );

    // Store as asset
    const asset = await prisma.asset.create({
      data: {
        userId: req.userId!,
        projectId: projectId ?? null,
        name: `Voice: ${text.slice(0, 40)}...`,
        type: 'audio',
        url: signedUrl,
        metadata: { voice, text, s3Key: audioKey },
      },
    });

    res.json({ assetId: asset.id, url: signedUrl });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Voice generation failed' });
  }
});

export default router;
