# MONOPOL STUDIO - Architecture Guide

## System Overview

MONOPOL STUDIO is a full-stack, scalable AI-powered cinematic creation platform built with:

- **Frontend**: Next.js 14 (React, TypeScript, TailwindCSS)
- **Backend**: Express.js (Node.js, PostgreSQL, Redis)
- **AI Services**: FastAPI (Python, PyTorch, OpenAI)
- **Deployment**: Docker, Vercel, Railway, Fly.io

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MONOPOL STUDIO PLATFORM                   │
├─────────────────────────────────────────────────────────────┤
│
├─ Frontend Layer (Vercel)
│  ├─ Next.js App Router
│  ├─ Canvas Editor (Konva.js)
│  ├─ Timeline UI
│  ├─ Real-time Collaboration (Socket.io)
│  └─ State Management (Zustand + React Query)
│
├─ API Gateway (Express)
│  ├─ Authentication (Supabase + JWT)
│  ├─ REST API (CRUD operations)
│  ├─ WebSocket Server
│  └─ File Upload Handler (S3/R2)
│
├─ Data Layer
│  ├─ PostgreSQL (Prisma ORM)
│  ├─ Redis Cache
│  ├─ S3/R2 Object Storage
│  └─ CDN (Cloudflare)
│
├─ AI Services (FastAPI)
│  ├─ Background Removal (SAM)
│  ├─ Character Extraction
│  ├─ Scene Generation (OpenAI, Replicate)
│  ├─ Video Rendering (Remotion + FFmpeg)
│  └─ Job Queue (Celery)
│
└─ Infrastructure
   ├─ Monitoring (Sentry, PostHog)
   ├─ Logging (Pino, CloudWatch)
   ├─ CI/CD (GitHub Actions)
   └─ Infrastructure as Code (Terraform)
```

## Component Breakdown

### Frontend (apps/web)

**Key Pages:**
- `/` - Landing page
- `/auth/login` - Authentication
- `/dashboard` - Project list
- `/editor/[projectId]` - Main editor
- `/api/upload` - Upload handler

**Key Components:**
- `CanvasEditor` - Infinite canvas with Konva.js
- `Timeline` - Professional timeline editor
- `AssetPanel` - Media library
- `Inspector` - Property panel
- `AIDirector` - Chat interface

**State Management:**
- `useEditorStore` (Zustand) - Editor state
- `useAuthContext` - Auth state
- `useProjectQuery` - Project data (React Query)

### Backend (apps/api)

**API Routes:**
```
/api/auth/
  POST /signup
  POST /signin
  POST /refresh

/api/projects/
  GET / - List projects
  POST / - Create project
  GET /:id - Get project
  PATCH /:id - Update project
  DELETE /:id - Delete project

/api/scenes/
  GET /:projectId/scenes
  POST / - Create scene
  PATCH /:id - Update scene
  DELETE /:id - Delete scene

/api/assets/
  POST /upload - Upload asset
  GET /:id - Get asset
  DELETE /:id - Delete asset

/api/render/
  POST /jobs - Start render
  GET /jobs/:id - Get status

/api/ai/
  POST /remove-background
  POST /extract-character
  POST /generate-scene
  POST /director/chat

/api/subscriptions/
  GET /plans
  POST / - Create subscription
  GET /current
```

**Database Schema:**
- Users
- Projects
- Scenes
- Clips
- Assets
- Renders
- AIGenerations
- Subscriptions

**Key Features:**
- JWT authentication
- WebSocket for real-time updates
- File upload to S3/R2
- Background job processing
- Role-based access control

### AI Services (apps/ai-services)

**Endpoints:**
- `POST /api/remove-background` - Remove background
- `POST /api/extract-character` - Extract character
- `POST /api/generate-scene` - Generate scene
- `POST /api/process-status/{id}` - Check status

**Pipeline:**
1. Image upload
2. Processing (background removal, SAM)
3. Character extraction
4. Asset generation
5. Result return

**Models Used:**
- Segment Anything Model (SAM)
- DALL-E 3 / Stable Diffusion
- Whisper (audio)
- ElevenLabs (TTS)

### Shared Packages

**@monopol/types**
- TypeScript interfaces
- API response types
- Database models

**@monopol/shared**
- Validation schemas (Zod)
- API constants
- Utility functions

**@monopol/ui**
- Reusable components
- Design system
- TailwindCSS config

**@monopol/editor**
- Canvas editor
- Timeline component
- Asset management

## Data Flow

### Project Creation
```
Frontend -> API POST /api/projects
  -> Prisma create project
  -> Return project data
  -> Update Zustand store
  -> Redirect to editor
```

### Asset Upload
```
Frontend -> S3 signed URL
Frontend -> Upload to S3
Frontend -> API POST /api/assets
  -> Prisma create asset
  -> Cache in Redis
  -> WebSocket broadcast
  -> Update editor state
```

### Scene Rendering
```
Frontend -> API POST /api/render/jobs
  -> Create render job
  -> Queue job in Bull
  -> AI service fetches job
  -> Remotion renders video
  -> FFmpeg processes video
  -> Upload to S3
  -> Update job status
  -> WebSocket notification
  -> Frontend shows download link
```

## Scalability Strategy

### Database
- Connection pooling (PgBouncer)
- Read replicas for analytics
- Vertical partitioning by user/project
- Indexing on frequently queried fields

### Cache
- Redis for session storage
- Cache project/scene data
- Cache generated images
- Invalidate on updates

### API
- Horizontal scaling with load balancer
- Rate limiting per user
- API caching headers
- Compression (gzip)

### AI Services
- Auto-scaling based on queue depth
- GPU instances for inference
- Batch processing for efficiency
- Model caching in memory

### Frontend
- Code splitting by route
- Lazy loading of components
- Image optimization
- Service worker for offline
- CDN for assets

## Security

### Authentication
- Supabase handles OAuth/JWT
- Sessions stored in Redis
- HTTPS enforcement
- CORS properly configured

### Authorization
- Row-level security (Prisma + policies)
- User can only access own projects
- Admin dashboard for moderation

### Data Protection
- Encrypt sensitive fields
- Hash passwords
- Secure file uploads (validation)
- Rate limiting

### API Security
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- CSRF protection
- DDoS protection (Cloudflare)

## Deployment Architecture

### Development
```
Local → GitHub → CI/CD Tests → Preview Deploy
```

### Production
```
GitHub → CI/CD Pipeline
  ├─ Frontend → Vercel
  ├─ API → Railway/Render
  ├─ AI Services → ECR/GCR
  ├─ Database → RDS/CloudSQL
  ├─ Cache → ElastiCache/Memorystore
  └─ Storage → S3/R2
```

## Cost Optimization

- **Compute**: Use spot instances for AI services
- **Storage**: Archive old renders, use R2 for cheaper bandwidth
- **Database**: Use RDS Reserved Instances
- **CDN**: Use Cloudflare R2 for bandwidth savings
- **AI APIs**: Cache results, batch requests

## Monitoring & Observability

### Application Metrics
- Request latency
- Error rates
- Active users
- Database query times

### User Metrics
- Feature usage
- Render completion rates
- Subscription conversion
- User retention

### Infrastructure
- CPU/Memory usage
- Network bandwidth
- Database connections
- Redis memory usage

### Tools
- Sentry for errors
- PostHog for analytics
- OpenTelemetry for tracing
- CloudWatch for logs

## Future Enhancements

- [ ] Real-time collaboration (multiplayer editing)
- [ ] Advanced AI Director with long-context memory
- [ ] Custom model training
- [ ] Mobile app (React Native)
- [ ] Plugin marketplace
- [ ] Enterprise SSO
- [ ] Advanced analytics dashboard
- [ ] Team workspace management

---

**MONOPOL STUDIO - Cinematic Creation Platform Architecture**
