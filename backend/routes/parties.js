const express = require('express');
const { body, validationResult } = require('express-validator');
const Party = require('../models/Party');
const { auth, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Crear fiesta
router.post('/', auth, [
  body('title').isLength({ min: 1, max: 100 }).trim(),
  body('startDate').isISO8601().toDate(),
  body('endDate').isISO8601().toDate(),
  body('location.name').isLength({ min: 1 }).trim(),
  body('location.address').isLength({ min: 1 }).trim(),
  body('location.coordinates.lat').isFloat(),
  body('location.coordinates.lng').isFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      isPrivate,
      maxParticipants
    } = req.body;

    // Generar código único
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Party.findOne({ code });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'No se pudo generar un código único' });
    }

    const party = new Party({
      title,
      description,
      code,
      creator: req.user._id,
      startDate,
      endDate,
      location,
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      maxParticipants,
      participants: [{
        user: req.user._id,
        joinedAt: new Date()
      }]
    });

    await party.save();
    await party.populate('creator', 'username avatar');

    res.status(201).json({
      message: 'Fiesta creada exitosamente',
      party
    });
  } catch (error) {
    console.error('Error creando fiesta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Feed de fiestas (mover antes de rutas dinámicas para evitar captura por :code)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const followingIds = req.user.following;
    console.log('[FEED] user', req.user._id.toString(), 'following', followingIds.length, 'page', page, 'limit', limit);

    const query = {
      creator: { $in: followingIds },
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isExpired: false
    };

    const parties = await Party.find(query)
      .populate('creator', 'username avatar')
      .populate('photos')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Party.countDocuments(query);

    console.log('[FEED] results', parties.length, 'total', total);

    res.json({
      parties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[FEED] error', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener fiesta por código
router.get('/:code', optionalAuth, async (req, res) => {
  try {
    const { code } = req.params;
    
    const party = await Party.findOne({ code, isActive: true })
      .populate('creator', 'username avatar')
      .populate('participants.user', 'username avatar')
      .populate('photos');

    if (!party) {
      return res.status(404).json({ message: 'Fiesta no encontrada' });
    }

    // Verificar si el usuario tiene acceso
    let hasAccess = false;
    let isParticipant = false;
    
    if (req.user) {
      isParticipant = party.isParticipant(req.user._id);
      hasAccess = isParticipant || party.creator._id.toString() === req.user._id.toString();
    }

    // Si es privada y no tiene acceso, mostrar información limitada
    if (party.isPrivate && !hasAccess) {
      return res.json({
        party: {
          _id: party._id,
          title: party.title,
          code: party.code,
          startDate: party.startDate,
          endDate: party.endDate,
          location: party.location,
          isPrivate: true,
          creator: party.creator,
          isExpired: party.isExpired,
          isActive: party.isCurrentlyActive()
        },
        hasAccess: false
      });
    }

    res.json({
      party,
      hasAccess: true,
      isParticipant,
      canUploadPhotos: hasAccess && party.canUploadPhotos(req.user?._id)
    });
  } catch (error) {
    console.error('Error obteniendo fiesta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Unirse a fiesta por código
router.post('/:code/join', auth, async (req, res) => {
  try {
    const { code } = req.params;
    const party = await Party.findOne({ code, isActive: true });

    if (!party) {
      return res.status(404).json({ message: 'Fiesta no encontrada' });
    }

    if (party.isExpired) {
      return res.status(400).json({ message: 'La fiesta ha finalizado' });
    }

    if (!party.isCurrentlyActive()) {
      return res.status(400).json({ message: 'La fiesta no está activa' });
    }

    // Verificar si ya es participante
    if (party.isParticipant(req.user._id)) {
      return res.status(400).json({ message: 'Ya eres participante de esta fiesta' });
    }

    // Verificar límite de participantes
    if (party.maxParticipants && party.participants.length >= party.maxParticipants) {
      return res.status(400).json({ message: 'La fiesta ha alcanzado el límite de participantes' });
    }

    // Agregar como participante
    party.participants.push({
      user: req.user._id,
      joinedAt: new Date()
    });

    await party.save();
    await party.populate('creator', 'username avatar');

    // Emitir evento de nuevo participante
    const io = req.app.get('io');
    io.to(code).emit('new-participant', {
      user: req.user.toPublicJSON(),
      participantCount: party.participants.length
    });

    res.json({
      message: 'Te has unido a la fiesta exitosamente',
      party
    });
  } catch (error) {
    console.error('Error uniéndose a fiesta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Salir de fiesta
router.delete('/:code/leave', auth, async (req, res) => {
  try {
    const { code } = req.params;
    const party = await Party.findOne({ code, isActive: true });

    if (!party) {
      return res.status(404).json({ message: 'Fiesta no encontrada' });
    }

    // El creador no puede salir
    if (party.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'El creador no puede abandonar la fiesta' });
    }

    // Eliminar participante
    party.participants = party.participants.filter(
      p => p.user.toString() !== req.user._id.toString()
    );

    await party.save();

    // Emitir evento de participante saliendo
    const io = req.app.get('io');
    io.to(code).emit('participant-left', {
      userId: req.user._id,
      participantCount: party.participants.length
    });

    res.json({ message: 'Has abandonado la fiesta' });
  } catch (error) {
    console.error('Error abandonando fiesta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener fiestas del usuario
router.get('/my/parties', auth, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    
    let query = {
      $or: [
        { creator: req.user._id },
        { 'participants.user': req.user._id }
      ],
      isActive: true
    };

    // Filtrar por estado
    const now = new Date();
    if (status === 'active') {
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
      query.isExpired = false;
    } else if (status === 'upcoming') {
      query.startDate = { $gt: now };
    } else if (status === 'past') {
      query.$or = [
        { endDate: { $lt: now } },
        { isExpired: true }
      ];
    }

    const parties = await Party.find(query)
      .populate('creator', 'username avatar')
      .populate('participants.user', 'username avatar')
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Party.countDocuments(query);

    res.json({
      parties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo fiestas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// (ruta de feed movida antes de rutas dinámicas)

// Invitar usuarios por email
router.post('/:code/invite', auth, [
  body('emails').isArray({ min: 1 }),
  body('emails.*').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.params;
    const { emails } = req.body;
    
    const party = await Party.findOne({ code, isActive: true });

    if (!party) {
      return res.status(404).json({ message: 'Fiesta no encontrada' });
    }

    // Verificar si es el creador
    if (party.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el creador puede invitar usuarios' });
    }

    const invites = [];
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    for (const email of emails) {
      const inviteCode = uuidv4();
      
      // Verificar si ya existe una invitación
      const existingInvite = party.pendingInvites.find(inv => inv.email === email);
      if (!existingInvite) {
        party.pendingInvites.push({
          email,
          inviteCode,
          expiresAt
        });
        invites.push({ email, inviteCode });
      }
    }

    await party.save();

    // TODO: Enviar emails de invitación

    res.json({
      message: 'Invitaciones enviadas exitosamente',
      invites
    });
  } catch (error) {
    console.error('Error invitando usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Unirse por invitación
router.post('/join/:inviteCode', auth, async (req, res) => {
  try {
    const { inviteCode } = req.params;
    
    // Buscar fiesta con esta invitación
    const party = await Party.findOne({
      'pendingInvites.inviteCode': inviteCode,
      isActive: true
    });

    if (!party) {
      return res.status(404).json({ message: 'Invitación no válida o expirada' });
    }

    const invite = party.pendingInvites.find(inv => inv.inviteCode === inviteCode);
    
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'La invitación ha expirado' });
    }

    // Verificar si ya es participante
    if (party.isParticipant(req.user._id)) {
      return res.status(400).json({ message: 'Ya eres participante de esta fiesta' });
    }

    // Agregar como participante
    party.participants.push({
      user: req.user._id,
      joinedAt: new Date()
    });

    // Eliminar invitación usada
    party.pendingInvites = party.pendingInvites.filter(inv => inv.inviteCode !== inviteCode);

    await party.save();

    res.json({
      message: 'Te has unido a la fiesta exitosamente',
      party
    });
  } catch (error) {
    console.error('Error uniéndose por invitación:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;