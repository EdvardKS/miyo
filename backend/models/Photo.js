const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  caption: {
    type: String,
    maxlength: 200,
    default: ''
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  hiddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hiddenAt: Date,
  location: {
    lat: Number,
    lng: Number
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // para videos en segundos
    filter: String
  }
}, {
  timestamps: true
});

// Método para verificar si un usuario dio like
photoSchema.methods.hasUserLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Método para agregar/quitar like
photoSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex === -1) {
    this.likes.push({ user: userId });
    return { liked: true, likesCount: this.likes.length };
  } else {
    this.likes.splice(likeIndex, 1);
    return { liked: false, likesCount: this.likes.length };
  }
};

// Método para agregar comentario
photoSchema.methods.addComment = function(userId, text) {
  this.comments.push({ user: userId, text });
  return this.comments[this.comments.length - 1];
};

// Método para obtener información pública
photoSchema.methods.toPublicJSON = function(userId = null) {
  const json = {
    _id: this._id,
    party: this.party,
    user: this.user,
    url: this.url,
    thumbnailUrl: this.thumbnailUrl,
    caption: this.caption,
    likesCount: this.likes.length,
    commentsCount: this.comments.length,
    createdAt: this.createdAt,
    metadata: this.metadata
  };

  if (userId) {
    json.hasUserLiked = this.hasUserLiked(userId);
  }

  return json;
};

// Índices
photoSchema.index({ party: 1, createdAt: -1 });
photoSchema.index({ user: 1, createdAt: -1 });
photoSchema.index({ 'likes.user': 1 });

module.exports = mongoose.model('Photo', photoSchema);