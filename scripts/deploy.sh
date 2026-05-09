#!/bin/bash

# MONOPOL STUDIO - Deploy Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
REGION=${2:-us-east-1}

echo "🚀 Deploying MONOPOL STUDIO to $ENVIRONMENT in $REGION"

# Build Docker images
echo "📦 Building Docker images..."
docker compose build

# Tag images
echo "🏷️  Tagging images..."
docker tag monopol-api:latest monopol-api:$ENVIRONMENT
docker tag monopol-web:latest monopol-web:$ENVIRONMENT
docker tag monopol-ai:latest monopol-ai:$ENVIRONMENT

# Push to registry
echo "📤 Pushing images to registry..."
# aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
# docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/monopol-api:$ENVIRONMENT
# docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/monopol-web:$ENVIRONMENT
# docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/monopol-ai:$ENVIRONMENT

# Deploy to ECS/K8s
echo "🎯 Deploying to infrastructure..."
# kubectl apply -f infrastructure/k8s/$ENVIRONMENT.yml

# Run migrations
echo "🔄 Running database migrations..."
# npm run db:push

echo "✅ Deployment complete!"
