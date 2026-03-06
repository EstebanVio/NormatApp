import express, { Express } from 'express';
import 'express-async-errors';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyAccessToken } from './utils/jwt';
import logger from './utils/logger';
import { errorHandler, notFoundHandler, rateLimiter } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import remitoRoutes from './routes/remitoRoutes';
import entregaRoutes from './routes/entregaRoutes';
import transporteRoutes from './routes/transporteRoutes';
import userRoutes from './routes/userRoutes';
import fs from 'fs/promises';

import path from 'path';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  },
});

// Middleware global
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' ? true : (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(rateLimiter);

// Crear directorio de uploads si no existe
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
  logger.warn('No se pudo crear directorio de uploads:', { error: err.message });
});

// Servir archivos estáticos
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/remitos', remitoRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/transportes', transporteRoutes);
app.use('/api/users', userRoutes);

// WebSocket - Autenticación y conexiones
io.use(async (socket: Socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    const payload = await verifyAccessToken(token);
    socket.data.user = payload;
    next();
  } catch (error) {
    logger.error('WebSocket auth error:', { error });
    next(new Error('Autenticación fallida'));
  }
});

io.on('connection', (socket: Socket) => {
  logger.info('Cliente conectado:', {
    socketId: socket.id,
    userId: socket.data.user?.sub,
    role: socket.data.user?.role,
  });

  // Unirse a sala por rol
  if (socket.data.user?.role === 'DRIVER') {
    socket.join(`driver:${socket.data.user.sub}`);
  } else if (socket.data.user?.role === 'ADMIN' || socket.data.user?.role === 'OPERATOR') {
    socket.join('admin');
  }

  // Notificar nueva entrega (transportista)
  socket.on('remito:assigned', (data) => {
    io.to('admin').emit('notification:remito_assigned', {
      remitoId: data.remitoId,
      transporteId: data.transporteId,
      timestamp: new Date().toISOString(),
    });
  });

  // Notificar entrega completada (admin)
  socket.on('remito:delivered', (data) => {
    io.to('admin').emit('notification:remito_delivered', {
      remitoId: data.remitoId,
      transporteId: data.transporteId,
      nombreReceptor: data.nombreReceptor,
      timestamp: new Date().toISOString(),
    });

    // Notificar también al conductor
    io.to(`driver:${data.driverId}`).emit('notification:delivery_confirmed', {
      remitoId: data.remitoId,
      message: 'Tu entrega fue confirmada',
    });
  });

  socket.on('driver:online', () => {
    logger.info('Conductor conectado:', { driverId: socket.data.user?.sub });
    io.to('admin').emit('notification:driver_online', {
      driverId: socket.data.user?.sub,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('driver:location', (data) => {
    io.to('admin').emit('notification:driver_location', {
      driverId: socket.data.user?.sub,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    logger.info('Cliente desconectado:', {
      socketId: socket.id,
      userId: socket.data.user?.sub,
    });
  });

  socket.on('error', (error) => {
    logger.error('Socket error:', { error, socketId: socket.id });
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado`, {
    port: PORT,
    env: process.env.NODE_ENV,
    uploadDir,
  });
});

export { app, httpServer, io };
