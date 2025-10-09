const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    inviteCode: String,
    hasAccess: {
      type: Boolean,
      default: true
    }
  }],
  pendingInvites: [{
    email: String,
    inviteCode: String,
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowLikes: {
      type: Boolean,
      default: true
    },
    requireLocation: {
      type: Boolean,
      default: true
    },
    locationRadius: {
      type: Number,
      default: 5000 // 5km en metros
    }
  }
}, {
  timestamps: true
});

// Método para verificar si la fiesta está activa actualmente (evita colisión con propiedad isActive)
partySchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && !this.isExpired;
};

// Método para verificar si un usuario es participante
partySchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Método para verificar si un usuario puede subir fotos
partySchema.methods.canUploadPhotos = function(userId, userLocation = null) {
  if (!this.isCurrentlyActive()) return false;
  
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant || !participant.hasAccess) return false;
  
  // Verificar ubicación si es requerido
  if (this.settings.requireLocation && userLocation) {
    const distance = this.calculateDistance(userLocation, this.location.coordinates);
    if (distance > this.settings.locationRadius) return false;
  }
  
  return true;
};

// Método para calcular distancia entre dos puntos
partySchema.methods.calculateDistance = function(point1, point2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = point1.lat * Math.PI/180;
  const φ2 = point2.lat * Math.PI/180;
  const Δφ = (point2.lat - point1.lat) * Math.PI/180;
  const Δλ = (point2.lng - point1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distancia en metros
};

// Índices
partySchema.index({ code: 1 }, { unique: true });
partySchema.index({ creator: 1, createdAt: -1 });
partySchema.index({ startDate: 1, endDate: 1 });
partySchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Party', partySchema);