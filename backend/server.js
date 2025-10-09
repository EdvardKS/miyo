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

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de 100 solicitudes
  message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
});
app.use('/api/', limiter);

// Archivos estáticos para uploads
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/photos', photoRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});