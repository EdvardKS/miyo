const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Photo = require('../models/Photo');
const Party = require('../models/Party');
const { auth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Configurar multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

// Subir foto/video a fiesta
router.post('/:partyCode/upload', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const { partyCode } = req.params;
    const { caption, location } = req.body;

    // Verificar que la fiesta existe y está activa
    const party = await Party.findOne({ code: partyCode, isActive: true });
    if (!party) {
      // Eliminar archivo subido
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Fiesta no encontrada' });
    }

    // Verificar que el usuario puede subir fotos
    const userLocation = location ? JSON.parse(location) : null;
    if (!party.canUploadPhotos(req.user._id, userLocation)) {
      // Eliminar archivo subido
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'No puedes subir fotos a esta fiesta' });
    }

    // Crear foto
    const photo = new Photo({
      party: party._id,
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      caption: caption || '',
      location: userLocation
    });

    await photo.save();
    await photo.populate('user', 'username avatar');

    // Agregar foto a la fiesta
    party.photos.push(photo._id);
    await party.save();

    // Emitir evento de nueva foto
    const io = req.app.get('io');
    io.to(partyCode).emit('new-photo', photo.toPublicJSON());

    res.status(201).json({
      message: 'Media subido exitosamente',
      photo: photo.toPublicJSON()
    });
  } catch (error) {
    console.error('Error subiendo foto:', error);
    
    // Eliminar archivo si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener fotos de una fiesta
router.get('/party/:partyCode', optionalAuth, async (req, res) => {
  try {
    const { partyCode } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verificar que la fiesta existe
    const party = await Party.findOne({ code: partyCode, isActive: true });
    if (!party) {
      return res.status(404).json({ message: 'Fiesta no encontrada' });
    }

    // Verificar acceso
    let hasAccess = false;
    if (req.user) {
      hasAccess = party.isParticipant(req.user._id) || 
                   party.creator.toString() === req.user._id.toString();
    }

    // Si es privada y no tiene acceso, mostrar solo fotos públicas si las hay
    let query = { party: party._id, isHidden: false };
    
    if (!hasAccess && party.isPrivate) {
      return res.status(403).json({ message: 'No tienes acceso a esta fiesta' });
    }

    const photos = await Photo.find(query)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Photo.countDocuments(query);

    // Transformar fotos para incluir información del usuario actual
    const transformedPhotos = photos.map(photo => 
      photo.toPublicJSON(req.user?._id)
    );

    res.json({
      photos: transformedPhotos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      hasAccess,
      canUploadPhotos: hasAccess && party.canUploadPhotos(req.user?._id)
    });
  } catch (error) {
    console.error('Error obteniendo fotos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Dar like a foto
router.post('/:photoId/like', auth, async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const photo = await Photo.findById(photoId)
      .populate('party', 'code')
      .populate('user', 'username avatar');

    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }

    // Verificar acceso a la fiesta
    const party = photo.party;
    if (!party.isParticipant(req.user._id) && 
        party.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes acceso a esta foto' });
    }

    // Toggle like
    const result = photo.toggleLike(req.user._id);
    await photo.save();

    // Emitir evento de like
    const io = req.app.get('io');
    io.to(party.code).emit('update-like', {
      photoId: photo._id,
      ...result,
      userId: req.user._id
    });

    res.json({
      message: result.liked ? 'Like agregado' : 'Like eliminado',
      likesCount: result.likesCount,
      hasUserLiked: result.liked
    });
  } catch (error) {
    console.error('Error dando like:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Comentar foto
router.post('/:photoId/comment', auth, [
  body('text').isLength({ min: 1, max: 500 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { photoId } = req.params;
    const { text } = req.body;
    
    const photo = await Photo.findById(photoId)
      .populate('party', 'code');

    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }

    // Verificar acceso a la fiesta
    const party = photo.party;
    if (!party.isParticipant(req.user._id) && 
        party.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes acceso a esta foto' });
    }

    // Verificar si se permiten comentarios
    if (!party.settings.allowComments) {
      return res.status(403).json({ message: 'Los comentarios están deshabilitados' });
    }

    // Agregar comentario
    const comment = photo.addComment(req.user._id, text);
    await photo.save();
    await photo.populate('comments.user', 'username avatar');

    // Emitir evento de nuevo comentario
    const io = req.app.get('io');
    io.to(party.code).emit('new-comment', {
      photoId: photo._id,
      comment: photo.comments[photo.comments.length - 1],
      commentsCount: photo.comments.length
    });

    res.status(201).json({
      message: 'Comentario agregado',
      comment: photo.comments[photo.comments.length - 1],
      commentsCount: photo.comments.length
    });
  } catch (error) {
    console.error('Error comentando foto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener comentarios de foto
router.get('/:photoId/comments', optionalAuth, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const photo = await Photo.findById(photoId)
      .populate('party', 'code')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username avatar'
        },
        options: {
          sort: { createdAt: -1 },
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit)
        }
      });

    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }

    // Verificar acceso a la fiesta
    const party = photo.party;
    let hasAccess = false;
    
    if (req.user) {
      hasAccess = party.isParticipant(req.user._id) || 
                   party.creator.toString() === req.user._id.toString();
    }

    if (!hasAccess && party.isPrivate) {
      return res.status(403).json({ message: 'No tienes acceso a esta foto' });
    }

    const totalComments = photo.comments.length;

    res.json({
      comments: photo.comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalComments,
        pages: Math.ceil(totalComments / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ocultar foto (solo creador de la fiesta)
router.patch('/:photoId/hide', auth, async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const photo = await Photo.findById(photoId)
      .populate('party');

    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }

    // Verificar que es el creador de la fiesta
    const party = photo.party;
    if (party.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el creador puede ocultar fotos' });
    }

    // Ocultar o mostrar foto
    photo.isHidden = !photo.isHidden;
    photo.hiddenBy = req.user._id;
    photo.hiddenAt = photo.isHidden ? new Date() : null;

    await photo.save();

    // Emitir evento de foto ocultada/mostrada
    const io = req.app.get('io');
    io.to(party.code).emit('photo-visibility-changed', {
      photoId: photo._id,
      isHidden: photo.isHidden
    });

    res.json({
      message: photo.isHidden ? 'Foto ocultada' : 'Foto mostrada',
      isHidden: photo.isHidden
    });
  } catch (error) {
    console.error('Error ocultando foto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener mis fotos
router.get('/my/photos', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const photos = await Photo.find({ user: req.user._id })
      .populate('party', 'title code')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Photo.countDocuments({ user: req.user._id });

    const transformedPhotos = photos.map(photo => ({
      ...photo.toPublicJSON(req.user._id),
      party: photo.party
    }));

    res.json({
      photos: transformedPhotos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo mis fotos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;