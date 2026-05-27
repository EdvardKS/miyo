const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const partyRoutes = require('./routes/parties');
const photoRoutes = require('./routes/photos');

// ---------- env validation ----------
// In production, refuse to boot without the secrets the app cannot fake.
// This surfaces a misconfigured deploy as a fast healthcheck failure
// instead of silently running with a default JWT_SECRET or no DB.
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error('[fatal] missing required env in production:', missing.join(', '));
    process.exit(1);
  }
}

// ---------- CORS allowed origins ----------
// CORS_ALLOWED_ORIGINS is a comma-separated list of full origins
// (e.g. "https://miyo.edvardks.com,https://www.miyo.edvardks.com"). When
// unset we fall back to APP_URL or a permissive dev default — but in
// production we refuse the wildcard to keep cookies / credentials safe.
function parseAllowedOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS || process.env.APP_URL || '';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length) return list;
  if (process.env.NODE_ENV !== 'production') return ['http://localhost:3000', 'http://localhost:5000'];
  return [];
}
const ALLOWED_ORIGINS = parseAllowedOrigins();
if (process.env.NODE_ENV === 'production' && ALLOWED_ORIGINS.length === 0) {
  console.error('[fatal] CORS_ALLOWED_ORIGINS (or APP_URL) must be set in production');
  process.exit(1);
}

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin / curl / server-to-server (no Origin header).
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: origin not allowed: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Trust the reverse proxy in front of us so req.ip / rate-limit see the
// real client IP instead of the proxy container address.
app.set('trust proxy', 1);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => {
    console.error('Error conectando a MongoDB:', err.message);
    // In production a missing DB at boot is fatal — exit so docker restarts
    // us and the canary deploy phase catches the issue.
    if (process.env.NODE_ENV === 'production') process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de 100 solicitudes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
});
app.use('/api/', limiter);

// Archivos estáticos para uploads
app.use('/uploads', express.static(process.env.UPLOAD_PATH || 'uploads'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/photos', photoRoutes);

// Ruta de health check. Includes a quick mongo readiness probe so the
// docker healthcheck reflects the real serving state, not just the
// express event loop being alive.
app.get('/api/health', (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  res.status(mongoReady ? 200 : 503).json({
    status: mongoReady ? 'OK' : 'DB_NOT_READY',
    mongo: mongoReady,
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO para tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-party', (partyCode) => {
    socket.join(partyCode);
    console.log(`Usuario ${socket.id} se unió a la fiesta ${partyCode}`);
  });

  socket.on('leave-party', (partyCode) => {
    socket.leave(partyCode);
    console.log(`Usuario ${socket.id} dejó la fiesta ${partyCode}`);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Exportar io para usar en las rutas
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT} · NODE_ENV=${process.env.NODE_ENV || 'unset'} · allowedOrigins=${ALLOWED_ORIGINS.join(',') || '(open in dev)'}`);
});

// Graceful shutdown so docker stop doesn't drop in-flight requests.
function shutdown(signal) {
  console.log(`[shutdown] received ${signal}, draining…`);
  server.close(() => {
    mongoose.connection.close(false).finally(() => process.exit(0));
  });
  // Hard exit if we hang past 10s.
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
