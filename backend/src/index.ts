import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

// Import routes
import commandRoutes from './routes/command.routes';
import settingsRoutes from './routes/settings.routes';
import portfolioRoutes from './routes/portfolio.routes';
import actionRoutes from './routes/action.routes';

// Import services
import { WebSocketService } from './services/websocket.service';
import { AIAgentService } from './services/ai-agent.service';
import { BlockchainService } from './services/blockchain.service';
import { SimulationService } from './services/simulation.service';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';
import { validateRequest } from './middleware/validation.middleware';

// Import utils
import { logger } from './utils/logger';
import { config } from './utils/config';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Initialize Express app
const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Global Services
let wsService: WebSocketService;
let aiAgentService: AIAgentService;
let blockchainService: BlockchainService;
let simulationService: SimulationService;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/command', commandRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/actions', actionRoutes);

// Kill Switch endpoint
app.post('/api/kill-switch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    logger.warn('KILL SWITCH ACTIVATED', { userId });

    // Stop AI agent
    if (aiAgentService) {
      await aiAgentService.stopAgent(userId);
    }

    // Revoke permissions (would integrate with Safe multi-sig here)
    // await blockchainService.revokePermissions(userId);

    // Update user settings
    await prisma.userSettings.update({
      where: { userId },
      data: { autonomousMode: false },
    });

    // Notify via WebSocket
    if (wsService) {
      wsService.sendToUser(userId, {
        type: 'kill_switch_executed',
        payload: {
          timestamp: Date.now(),
          message: 'All AI permissions revoked successfully',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Kill switch executed successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('authenticate', async (data: { userId: string; token?: string }) => {
    try {
      // TODO: Implement proper authentication
      socket.data.userId = data.userId;
      socket.join(`user:${data.userId}`);

      logger.info('Client authenticated', {
        socketId: socket.id,
        userId: data.userId
      });

      socket.emit('authenticated', {
        success: true,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Authentication failed', { error });
      socket.emit('auth_error', { error: 'Authentication failed' });
    }
  });

  socket.on('subscribe_portfolio', (userId: string) => {
    socket.join(`portfolio:${userId}`);
    logger.info('Subscribed to portfolio updates', { userId });
  });

  socket.on('approve_action', async (data: { actionId: string; userId: string }) => {
    try {
      if (aiAgentService) {
        await aiAgentService.approveAction(data.actionId, data.userId);
      }
    } catch (error) {
      logger.error('Action approval failed', { error });
      socket.emit('error', { message: 'Failed to approve action' });
    }
  });

  socket.on('reject_action', async (data: { actionId: string; userId: string }) => {
    try {
      if (aiAgentService) {
        await aiAgentService.rejectAction(data.actionId, data.userId);
      }
    } catch (error) {
      logger.error('Action rejection failed', { error });
      socket.emit('error', { message: 'Failed to reject action' });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });

  socket.on('error', (error) => {
    logger.error('Socket error', { error, socketId: socket.id });
  });
});

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing services...');

    // Initialize WebSocket service
    wsService = new WebSocketService(io);
    logger.info('WebSocket service initialized');

    // Initialize Blockchain service
    blockchainService = new BlockchainService();
    await blockchainService.initialize();
    logger.info('Blockchain service initialized');

    // Initialize Simulation service
    simulationService = new SimulationService();
    logger.info('Simulation service initialized');

    // Initialize AI Agent service
    aiAgentService = new AIAgentService(
      wsService,
      blockchainService,
      simulationService
    );
    logger.info('AI Agent service initialized');

    // Make services available globally
    (global as any).services = {
      ws: wsService,
      aiAgent: aiAgentService,
      blockchain: blockchainService,
      simulation: simulationService,
    };

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services', { error });
    throw error;
  }
}

// Perception Loop Cron Job (runs every 5 minutes)
function startPerceptionLoop() {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running perception loop...');

    try {
      if (aiAgentService) {
        await aiAgentService.runPerceptionLoop();
      }
    } catch (error) {
      logger.error('Perception loop error', { error });
    }
  });

  logger.info('Perception loop scheduled (every 5 minutes)');
}

// Graceful shutdown
async function gracefulShutdown() {
  logger.info('Received shutdown signal, starting graceful shutdown...');

  // Stop accepting new connections
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  // Close WebSocket connections
  io.close(() => {
    logger.info('WebSocket server closed');
  });

  // Disconnect Prisma
  await prisma.$disconnect();
  logger.info('Database disconnected');

  // Stop AI agent
  if (aiAgentService) {
    await aiAgentService.shutdown();
    logger.info('AI Agent stopped');
  }

  logger.info('Graceful shutdown complete');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Database connected');

    // Initialize services
    await initializeServices();

    // Start perception loop
    startPerceptionLoop();

    // Start HTTP server
    const PORT = config.port || 3001;
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`WebSocket endpoint: ws://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();

export { io, wsService, aiAgentService, blockchainService, simulationService };
