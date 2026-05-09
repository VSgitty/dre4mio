# Backend API Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/index.js"]
