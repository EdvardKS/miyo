const express = require('express');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Buscar usuarios
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 20, skip = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Query de búsqueda requerido' });
    }

    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { bio: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username avatar bio isPublicProfile isPublicFigure followersCount followingCount createdAt')
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ username: 1 });

    res.json({ users });
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener perfil de usuario
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username, isActive: true })
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el perfil es privado
    if (!user.isPublicProfile && (!req.user || !user.followers.includes(req.user._id))) {
      return res.json({
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          isPublicProfile: user.isPublicProfile,
          isPublicFigure: user.isPublicFigure,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          isPrivate: true
        }
      });
    }

    res.json({
      user: user.toPublicJSON(),
      followers: user.followers,
      following: user.following
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Seguir usuario
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const userToFollow = await User.findOne({ username, isActive: true });

    if (!userToFollow) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
    }

    // Verificar si ya lo sigue
    if (req.user.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Ya sigues a este usuario' });
    }

    // Si el perfil es privado, agregar solicitud
    if (userToFollow.isPublicProfile) {
      // Seguir directamente
      req.user.following.push(userToFollow._id);
      userToFollow.followers.push(req.user._id);
      
      await Promise.all([
        req.user.save(),
        userToFollow.save()
      ]);

      res.json({ 
        message: 'Usuario seguido exitosamente',
        following: true
      });
    } else {
      // Agregar solicitud de seguimiento
      const existingRequest = userToFollow.followRequests.find(
        req => req.user.toString() === req.user._id.toString()
      );

      if (existingRequest) {
        return res.status(400).json({ message: 'Ya enviaste una solicitud de seguimiento' });
      }

      userToFollow.followRequests.push({
        user: req.user._id
      });

      await userToFollow.save();

      res.json({ 
        message: 'Solicitud de seguimiento enviada',
        pending: true
      });
    }
  } catch (error) {
    console.error('Error siguiendo usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Dejar de seguir usuario
router.delete('/:username/follow', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const userToUnfollow = await User.findOne({ username, isActive: true });

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar de following
    req.user.following = req.user.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );

    // Eliminar de followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );

    await Promise.all([
      req.user.save(),
      userToUnfollow.save()
    ]);

    res.json({ 
      message: 'Usuario dejado de seguir',
      following: false
    });
  } catch (error) {
    console.error('Error dejando de seguir:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener solicitudes de seguimiento
router.get('/follow-requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followRequests.user', 'username avatar bio createdAt');

    res.json({ 
      requests: user.followRequests 
    });
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Aceptar solicitud de seguimiento
router.post('/follow-requests/:requestId/accept', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const user = await User.findById(req.user._id);

    const requestIndex = user.followRequests.findIndex(
      req => req._id.toString() === requestId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const request = user.followRequests[requestIndex];
    const followerId = request.user;

    // Agregar a followers
    user.followers.push(followerId);
    
    // Agregar al following del seguidor
    const follower = await User.findById(followerId);
    follower.following.push(user._id);

    // Eliminar solicitud
    user.followRequests.splice(requestIndex, 1);

    await Promise.all([
      user.save(),
      follower.save()
    ]);

    res.json({ message: 'Solicitud aceptada' });
  } catch (error) {
    console.error('Error aceptando solicitud:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Rechazar solicitud de seguimiento
router.delete('/follow-requests/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const user = await User.findById(req.user._id);

    user.followRequests = user.followRequests.filter(
      req => req._id.toString() !== requestId
    );

    await user.save();

    res.json({ message: 'Solicitud rechazada' });
  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Top usuarios por actividad
router.get('/top/activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Obtener usuarios públicos o figuras públicas
    const users = await User.find({
      isActive: true,
      $or: [
        { isPublicProfile: true },
        { isPublicFigure: true }
      ]
    })
    .select('username avatar bio isPublicProfile isPublicFigure followersCount followingCount lastLogin')
    .sort({ lastLogin: -1, followersCount: -1 })
    .limit(parseInt(limit));

    res.json({ users });
  } catch (error) {
    console.error('Error obteniendo top usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;