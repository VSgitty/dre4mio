# 🚀 MONOPOL STUDIO - Quick Start Guide

**The AI Cinematic Creation Operating System**

## 5-Minute Setup

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/monopolstudio/monopol-studio.git
cd monopol-studio

# Start services
docker compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Access platform
# Frontend: http://localhost:3000
# API: http://localhost:3001
# AI Services: http://localhost:5000
```

### Option 2: Local Development

```bash
# Prerequisites
# - Node.js 18+
# - PostgreSQL
# - Redis

# Install dependencies
npm install

# Setup database
npm run db:push

# Start all services
npm run dev

# Frontend: http://localhost:3000
# API: http://localhost:3001
# AI Services: http://localhost:5000
```

## First Steps

### 1. Create an Account

Visit http://localhost:3000 and click **"Start Creating Free"**

```
Email: your@email.com
Password: secure_password
Confirm Password: secure_password
```

### 2. Create Your First Project

1. Click **"+ New Project"**
2. Enter project name: "My First Film"
3. Click **"Create"**

### 3. Start Editing

1. Click on your project
2. Click **"+ New Scene"**
3. Select canvas size (1920x1080 recommended)
4. Click **"Create Scene"**

### 4. Add Assets

**Option A: Upload Image**
```bash
1. Click "Assets" panel
2. Click "Upload"
3. Select your image
4. Drag onto canvas
```

**Option B: Generate with AI**
```bash
1. Click "AI Director"
2. Type: "Generate a futuristic city background"
3. Click "Generate"
4. Wait for image
5. Drag onto canvas
```

### 5. Arrange & Animate

```bash
1. Select asset on canvas
2. Drag to position
3. Resize using handles
4. Add to timeline
5. Adjust duration
```

### 6. Export Video

```bash
1. Click "Export"
2. Select quality (1080p)
3. Select format (MP4)
4. Click "Start Render"
5. Wait for completion
```

## Key Features

### Canvas Editor
- Infinite canvas
- Pan/zoom with mouse wheel
- Select and transform objects
- Keyboard shortcuts: Delete, Copy, Paste

### Timeline
- Frame-accurate playback
- Add clips and keyframes
- Adjust timing
- Add transitions

### AI Director
- Chat-based commands
- "Make the character jump"
- "Generate a sunset scene"
- "Add camera zoom"

### Asset Library
- Browse assets
- Search by name
- Organize by project
- Drag and drop to canvas

## Common Workflows

### Workflow 1: Paper to Animation

```
1. Sketch on paper
2. Take photo with phone
3. Upload image to MONOPOL
4. AI removes background → PNG asset
5. Add to canvas
6. Animate in timeline
7. Export video
```

### Workflow 2: Prompt to Scene

```
1. Type scene description in AI Director
2. AI generates background image
3. Add characters/assets
4. Arrange and animate
5. Add audio/voiceover
6. Export
```

### Workflow 3: Photo Collage to Video

```
1. Upload multiple photos
2. Arrange on canvas
3. Add effects and transitions
4. Create timeline with Ken Burns effect
5. Add music
6. Export
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` | Remove selected object |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+D` | Duplicate |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Space` | Pan canvas |
| `Scroll` | Zoom |
| `Arrow Keys` | Move object |

## Troubleshooting

### "Cannot connect to API"
```bash
# Check if API is running
curl http://localhost:3001/health

# If not, restart Docker
docker compose restart api
```

### "Database connection error"
```bash
# Ensure PostgreSQL is running
docker compose logs postgres

# Reset database
npm run db:push
```

### "AI services unavailable"
```bash
# Check AI service status
curl http://localhost:5000/health

# Restart AI service
docker compose restart ai
```

### "Out of storage"
```bash
# Free up space
rm -rf .next build dist

# Clear Docker cache
docker system prune -a
```

## Next Steps

1. **Explore Templates**: Check out example projects
2. **Watch Tutorials**: See how to use advanced features
3. **Join Community**: Connect with other creators
4. **Read Docs**: Learn about API and advanced features
5. **Upgrade Plan**: Unlock more features

## Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Architecture](./ARCHITECTURE.md) - System design
- [API Documentation](./API.md) - REST & WebSocket APIs
- [Deployment](./DEPLOYMENT.md) - Production deployment
- [Product Spec](./PRODUCT_SPEC.md) - Full specifications

## Support

- **Issues**: Report on GitHub
- **Discussions**: Ask questions on GitHub Discussions
- **Email**: support@monopolstudio.com
- **Discord**: Join our community server

## Community

- **GitHub**: Star us ⭐
- **Twitter**: @monopolstudio
- **Instagram**: @monopolstudio.art

---

**Ready to create cinematic masterpieces?** 🎬

Let's go! Start with your first scene now.
