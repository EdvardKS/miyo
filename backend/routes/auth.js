const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth');
const Photo = require('../models/Photo');
const Party = require('../models/Party');
const router = express.Router();

// Registro
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'El email o username ya está en uso' 
      });
    }

    // Crear nuevo usuario
    const user = new User({
      email,
      username,
      password
    });

    await user.save();

    // Generar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener perfil de usuario actual
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar perfil
router.put('/profile', auth, [
  body('username').optional().isLength({ min: 3, max: 30 }).trim(),
  body('bio').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  const { username, bio, isPublicProfile } = req.body;
    const user = req.user;

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'El username ya está en uso' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (isPublicProfile !== undefined) user.isPublicProfile = isPublicProfile;

    await user.save();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Cambiar password
router.put('/password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verificar password actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password actual incorrecto' });
    }

    // Actualizar password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password actualizado exitosamente' });
  } catch (error) {
    console.error('Error cambiando password:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Verificar password actual sin cambiarlo
router.post('/password/verify', auth, [
  body('currentPassword').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword } = req.body;
    const user = req.user;

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password actual incorrecto' });
    }

    res.json({ message: 'Password verificado' });
  } catch (error) {
    console.error('Error verificando password:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar cuenta y datos asociados
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    // Eliminar avatar local si existe
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(process.cwd(), user.avatar.replace(/^\//, ''));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Obtener fotos del usuario para eliminar archivos
    const photos = await Photo.find({ user: userId }).select('url thumbnailUrl');
    const photoIds = photos.map((photo) => photo._id);

    const removeMediaFile = (filePath) => {
      if (!filePath) return;
      if (!filePath.startsWith('/uploads/')) return;
      const absolutePath = path.join(process.cwd(), filePath.replace(/^\//, ''));
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    };

    photos.forEach((photo) => {
      removeMediaFile(photo.url);
      removeMediaFile(photo.thumbnailUrl);
    });

    if (photoIds.length) {
      await Photo.deleteMany({ _id: { $in: photoIds } });
      await Party.updateMany({}, { $pull: { photos: { $in: photoIds } } });
    }

    // Eliminar fiestas creadas por el usuario
    await Party.deleteMany({ creator: userId });

    // Remover al usuario de participantes y seguidores/seguidos
    await Party.updateMany(
      { 'participants.user': userId },
      { $pull: { participants: { user: userId } } }
    );

    await User.updateMany({}, {
      $pull: {
        followers: userId,
        following: userId,
        followRequests: { user: userId }
      }
    });

    await User.deleteOne({ _id: userId });

    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
