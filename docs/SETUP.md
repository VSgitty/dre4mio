# MONOPOL STUDIO - SETUP & DEPLOYMENT GUIDE

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- Python 3.11 (for AI services)

### Local Development

1. **Clone & Install**
```bash
git clone https://github.com/monopolstudio/monopol-studio.git
cd monopol-studio
npm install
```

2. **Configure Environment**
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
cp apps/ai-services/.env.example apps/ai-services/.env
```

3. **Start Development**
```bash
# Option 1: Docker (recommended)
docker compose up -d

# Option 2: Local
npm run db:push  # Setup database
npm run dev      # Start all services
```

4. **Access**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- AI Services: http://localhost:5000

## 📦 Project Structure

```
monopol-studio/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Express backend
│   └── ai-services/      # Python microservices
├── packages/
│   ├── ui/               # Shared UI components
│   ├── editor/           # Canvas & timeline editor
│   ├── timeline/         # Timeline state management
│   ├── types/            # TypeScript types
│   └── shared/           # Shared utilities
├── infrastructure/
│   ├── docker/           # Dockerfiles
│   ├── terraform/        # IaC for cloud deployment
│   └── k8s/             # Kubernetes configs
└── docs/                 # Documentation
```

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 App Router
- **State**: Zustand + React Query
- **Styling**: TailwindCSS + Framer Motion
- **Canvas**: Konva.js + Fabric.js
- **Auth**: Supabase

### Backend (Express/Node)
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Auth**: JWT + Supabase
- **Queue**: Bull (job processing)
- **Real-time**: Socket.io

### AI Services (Python)
- **Framework**: FastAPI
- **Vision**: Segment Anything Model (SAM)
- **Generation**: OpenAI, Replicate, Stability AI
- **Video**: FFmpeg, OpenCV
- **Queue**: Celery + Redis

## 🗄️ Database

### Tables
- **users** - User accounts & profiles
- **projects** - Creative projects
- **scenes** - Individual scenes
- **clips** - Timeline clips
- **assets** - Media files
- **renders** - Video export jobs
- **subscriptions** - User subscriptions
- **ai_generations** - AI processing results

### Migrations
```bash
npm run db:migrate    # Run migrations
npm run db:push      # Sync schema
npm run db:studio    # Open Prisma Studio
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `POST /api/auth/refresh` - Refresh token

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Scenes
- `GET /api/scenes/:projectId/scenes` - List scenes
- `POST /api/scenes` - Create scene
- `PATCH /api/scenes/:id` - Update scene
- `DELETE /api/scenes/:id` - Delete scene

### Assets
- `POST /api/assets/upload` - Upload asset
- `GET /api/assets/:id` - Get asset
- `DELETE /api/assets/:id` - Delete asset

### Rendering
- `POST /api/render/jobs` - Start render job
- `GET /api/render/jobs/:id` - Get job status
- `GET /api/render` - Render history

### AI Services
- `POST /api/ai/remove-background` - Remove background
- `POST /api/ai/extract-character` - Extract character
- `POST /api/ai/generate-scene` - Generate scene
- `POST /api/ai/director/chat` - AI Director chat

## 🐳 Docker Deployment

### Local Docker
```bash
docker compose up -d
docker compose logs -f
docker compose down
```

### Production Build
```bash
docker compose -f docker-compose.yml build
docker tag monopol-studio:latest your-registry/monopol-studio:latest
docker push your-registry/monopol-studio:latest
```

## ☁️ Cloud Deployment

### Vercel (Frontend)
```bash
# Connect GitHub repo to Vercel
# Set environment variables
# Deploy: `git push` to main
```

### Railway/Render (Backend)
```bash
# Create service
# Connect GitHub
# Set DATABASE_URL, REDIS_URL
# Deploy
```

### AWS/GCP/Azure (AI Services)
- Deploy as container on ECR/Artifact Registry
- Configure auto-scaling based on queue depth
- Use GPU instances for inference

## 🔐 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Backend (.env)
```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
S3_BUCKET_NAME=
```

## 📊 Monitoring

### Logs
- Frontend: Vercel Dashboard
- Backend: Railway/Render Dashboard
- AI Services: CloudWatch/Stackdriver

### Metrics
- Sentry for error tracking
- PostHog for analytics
- OpenTelemetry for tracing

## 💳 Payments

### Stripe Integration
```bash
# Create Stripe account
# Add webhook: stripe listen --forward-to localhost:3001/webhook
# Configure in backend
```

### Subscription Plans
- **Free**: 100 credits/month, 480p export
- **Creator**: $9.99/mo, 1000 credits, 1080p export
- **Studio**: $29.99/mo, 10000 credits, 4K export

## 🧪 Testing

```bash
npm run test                # Run all tests
npm run test -- --watch    # Watch mode
npm run test:e2e           # End-to-end tests
```

## 📝 Git Workflow

```bash
# Feature branch
git checkout -b feature/amazing-feature

# Commit
git commit -m "feat: add amazing feature"

# Push & create PR
git push origin feature/amazing-feature
```

## 🚀 Performance Tips

- Enable image optimization in Next.js
- Use Redis for caching
- Implement CDN for assets (Cloudflare R2)
- Lazy load editor components
- Virtual scrolling for timeline
- Server-side rendering for metadata

## 🔗 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Socket.io Docs](https://socket.io/docs)

## 📞 Support

- GitHub Issues: Report bugs
- Discussions: Ask questions
- Discord: Community chat

---

**MONOPOL STUDIO - The AI Cinematic Creation Operating System**
