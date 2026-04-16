require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const eventsRouter      = require('./routes/events');
const preferencesRouter = require('./routes/preferences');
const newsRouter        = require('./routes/news');
const { runDisasterEngine } = require('./services/engine');
const { clerkMiddleware, requireAuth } = require('@clerk/express');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) or any localhost port in dev
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(clerkMiddleware());

// ── Request logging ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/events',      eventsRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/news',        newsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── MongoDB connection ─────────────────────────────────────────────────────────
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<username>')) {
    console.warn('[DB] MONGO_URI not configured. Running without database (demo mode).');
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] Connected to MongoDB Atlas');
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
}

// ── Disaster Engine (cron) ────────────────────────────────────────────────────
function startEngine(dbConnected) {
  if (!dbConnected) {
    console.warn('[Engine] No DB — disaster engine disabled.');
    return;
  }

  // Run immediately on startup
  runDisasterEngine().catch(console.error);

  // Then every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    runDisasterEngine().catch(console.error);
  });

  console.log('[Engine] Scheduled every 5 minutes.');
}

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  const dbConnected = await connectDB();
  startEngine(dbConnected);

  app.listen(PORT, () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
    console.log(`[Server] Health: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Events: http://localhost:${PORT}/api/events`);
  });
}

boot();
