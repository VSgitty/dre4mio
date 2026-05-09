# Main README

# 🎬 MONOPOL STUDIO
**The AI Cinematic Creation Operating System**

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-20%2B-green)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

Transform your creative vision into cinematic reality. MONOPOL STUDIO is the world's first AI-native platform that lets anyone create animated series, movies, and cinematic stories from sketches, photos, and ideas.

## ✨ Features

- 🎨 **Paper to Digital** - Sketch on paper, photograph, and watch AI digitize your creation
- 🤖 **AI Director** - Chat-based cinematography assistant that understands filmmaking
- 🎬 **Professional Canvas** - Industry-standard scene editor with infinite canvas
- ⏱️ **Timeline Engine** - Frame-accurate timeline inspired by Premiere Pro and DaVinci Resolve
- 🎞️ **Cinematic Export** - Export to MP4, shorts, or social media formats
- ☁️ **Cloud Collaboration** - Real-time sync and collaboration features
- 🚀 **AI Powered** - Integration with OpenAI, Replicate, Stability AI, and more

## 🏗️ Architecture

```
┌─────────────────────────┐
│   MONOPOL STUDIO        │
├─────────────────────────┤
│  Frontend (Next.js)     │
│  Canvas + Timeline      │
├─────────────────────────┤
│  Backend (Express)      │
│  API + WebSocket        │
├─────────────────────────┤
│  AI Services (FastAPI)  │
│  Image & Video Gen      │
├─────────────────────────┤
│  Data Layer             │
│  PostgreSQL + Redis     │
└─────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup

```bash
# Clone repository
git clone https://github.com/monopolstudio/monopol-studio.git
cd monopol-studio

# Install dependencies
npm install

# Start with Docker (recommended)
docker compose up -d

# Or start locally
npm run db:push
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- AI Services: http://localhost:5000

## 📁 Project Structure

```
monopol-studio/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Express backend
│   └── ai-services/      # Python microservices
├── packages/
│   ├── ui/               # Shared components
│   ├── editor/           # Canvas editor
│   ├── timeline/         # Timeline manager
│   ├── types/            # TypeScript types
│   └── shared/           # Utilities
├── infrastructure/
│   ├── docker/
│   ├── terraform/
│   └── k8s/
├── docs/
└── scripts/
```

## 🛠️ Tech Stack

### Frontend
- Next.js 14 with App Router
- React 18 + TypeScript
- TailwindCSS + Framer Motion
- Konva.js + Fabric.js for canvas
- Zustand + React Query for state
- Supabase for auth

### Backend
- Express.js on Node.js
- PostgreSQL + Prisma ORM
- Redis for caching
- Socket.io for real-time
- Bull for job queues
- JWT + Supabase Auth

### AI/ML
- FastAPI (Python)
- PyTorch + OpenCV
- Segment Anything Model (SAM)
- OpenAI GPT-4 + DALL-E
- Replicate API
- Stability AI

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Vercel (frontend)
- Railway/Render (backend)
- AWS/GCP for AI services

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Local development & deployment
- [Architecture](docs/ARCHITECTURE.md) - System design & scalability
- [API Documentation](docs/API.md) - REST & WebSocket APIs

## 🔌 API Endpoints

### Authentication
```http
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/refresh
```

### Projects & Scenes
```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

GET    /api/scenes/:projectId/scenes
POST   /api/scenes
PATCH  /api/scenes/:id
DELETE /api/scenes/:id
```

### Assets & Rendering
```http
POST   /api/assets/upload
GET    /api/assets/:id
DELETE /api/assets/:id

POST   /api/render/jobs
GET    /api/render/jobs/:id
GET    /api/render
```

### AI Services
```http
POST   /api/ai/remove-background
POST   /api/ai/extract-character
POST   /api/ai/generate-scene
POST   /api/ai/director/chat
```

## 🚀 Deployment

### Docker Compose (Local)
```bash
docker compose up -d
docker compose logs -f
```

### Production
```bash
# Deploy frontend to Vercel
vercel deploy

# Deploy API to Railway/Render
git push main

# Deploy AI services to AWS ECR
./scripts/deploy.sh production
```

## 💳 Subscription Plans

| Feature | Free | Creator | Studio |
|---------|------|---------|--------|
| Price | Free | $9.99/mo | $29.99/mo |
| Credits | 100 | 1,000 | 10,000 |
| Export | 480p | 1080p | 4K |
| Storage | 1GB | 100GB | Unlimited |
| Projects | 3 | Unlimited | Unlimited |
| AI Features | Basic | Advanced | Premium |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📊 Monitoring

- **Errors**: Sentry
- **Analytics**: PostHog
- **Performance**: OpenTelemetry
- **Logs**: CloudWatch / Stackdriver

## 🔐 Security

- JWT-based authentication
- Row-level security in database
- HTTPS enforcement
- Rate limiting
- Input validation with Zod
- Regular security audits

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md)

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "feat: add amazing feature"

# Push to branch
git push origin feature/amazing-feature

# Create Pull Request
```

## 📄 License

MONOPOL STUDIO is open source and available under the MIT License. See [LICENSE](LICENSE) for details.

## 🙋 Support

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and ideas
- **Discord Community** - Real-time chat and support
- **Email** - support@monopolstudio.com

## 🎯 Roadmap

- [x] MVP: Canvas editor + basic export
- [ ] V1: AI Director + collaboration
- [ ] V2: Advanced AI features + plugins
- [ ] V3: Mobile app + marketplace
- [ ] V4: Enterprise features

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## 🙏 Acknowledgments

- Inspired by Figma, Unreal Engine, Pixar
- Built with open source tools and libraries
- Community feedback and contributions

---

**Made with ❤️ by the MONOPOL STUDIO team**

🌟 If you find this helpful, please star us on GitHub!

For more information, visit [monopolstudio.com](https://monopolstudio.com)
