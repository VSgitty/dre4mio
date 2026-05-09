#!/bin/bash

# MONOPOL STUDIO - Local Development Setup
# Usage: ./scripts/setup.sh

set -e

echo "🎬 MONOPOL STUDIO - Development Setup"
echo "======================================"

# Check Node version
NODE_VERSION=$(node -v)
echo "✓ Node.js: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️  Setting up database..."
npm run db:push

# Setup environment files
echo "🔐 Creating environment files..."
if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo "  ✓ Created apps/web/.env.local"
fi

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo "  ✓ Created apps/api/.env"
fi

if [ ! -f apps/ai-services/.env ]; then
  cp apps/ai-services/.env.example apps/ai-services/.env
  echo "  ✓ Created apps/ai-services/.env"
fi

# Start services
echo ""
echo "🚀 Starting services..."
echo "Available commands:"
echo "  npm run dev       - Start all services"
echo "  npm run dev:web   - Start frontend only"
echo "  npm run dev:api   - Start backend only"
echo "  npm run dev:ai    - Start AI services only"
echo ""
echo "Services will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:3001"
echo "  AI:       http://localhost:5000"
echo ""
echo "✅ Setup complete!"
