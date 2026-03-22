import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

// ─── Routes (stub — wire to real DB services) ─────────────────────────────────
import authRoutes    from './routes/auth';
import tokenRoutes   from './routes/tokens';
import queueRoutes   from './routes/queue';
import deptRoutes    from './routes/departments';
import doctorRoutes  from './routes/doctors';
import patientRoutes from './routes/patients';
import staffRoutes   from './routes/staff';
import analyticsRoutes from './routes/analytics';

const app = express();
const httpServer = createServer(app);

// ─── WebSocket server (Flow 1 & 5 — live queue state) ────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*' },
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Client subscribes to a department's queue
  socket.on('subscribe:department', (departmentId: string) => {
    socket.join(`dept:${departmentId}`);
    console.log(`[WS] ${socket.id} subscribed to dept:${departmentId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth',          authRoutes);
app.use('/tokens',        tokenRoutes);
app.use('/queue',         queueRoutes);
app.use('/departments',   deptRoutes);
app.use('/doctors',       doctorRoutes);
app.use('/patients',      patientRoutes);
app.use('/staff',         staffRoutes);
app.use('/analytics',     analyticsRoutes);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SmartQ API running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});
