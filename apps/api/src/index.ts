import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';

dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import scenesRoutes from './routes/scenes';
import assetsRoutes from './routes/assets';
import renderRoutes from './routes/render';
import aiRoutes from './routes/ai';
import subscriptionRoutes from './routes/subscriptions';

const app: Express = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});

// Logger
const logger = pino();

// Middleware
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scenes', scenesRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/render', renderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// WebSocket events
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('scene-update', (data) => {
    io.to(`project:${data.projectId}`).emit('scene-updated', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`🚀 MONOPOL API Server running on http://localhost:${PORT}`);
});

export { app, server, io, logger };
