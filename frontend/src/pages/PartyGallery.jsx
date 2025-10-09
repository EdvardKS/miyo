import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { photoService } from '../services/photoService';
import { partyService } from '../services/partyService';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Camera, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar, 
  Users, 
  Copy, 
  LogOut,
  X,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';

const PartyGallery = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinParty, leaveParty } = useSocket();
  const queryClient = useQueryClient();
  
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Obtener información de la fiesta
  const { data: partyData, isLoading: partyLoading } = useQuery(
    ['party', code],
    () => partyService.getParty(code),
    { enabled: !!code }
  );

  // Obtener fotos de la fiesta
  const { data: photosData, isLoading: photosLoading } = useQuery(
    ['partyPhotos', code],
    () => photoService.getPartyPhotos(code),
    { enabled: !!code && partyData?.hasAccess }
  );

  // Mutaciones
  const likePhotoMutation = useMutation(photoService.likePhoto, {
    onSuccess: () => {
      queryClient.invalidateQueries(['partyPhotos', code]);
    },
  });

  const commentPhotoMutation = useMutation(photoService.commentPhoto, {
    onSuccess: () => {
      queryClient.invalidateQueries(['partyPhotos', code]);
      queryClient.invalidateQueries(['photoComments', selectedPhoto?._id]);
      setCommentText('');
    },
  });

  const hidePhotoMutation = useMutation(photoService.hidePhoto, {
    onSuccess: () => {
      queryClient.invalidateQueries(['partyPhotos', code]);
      toast.success('Foto ocultada');
    },
  });

  // Unirse a la fiesta
  const joinPartyMutation = useMutation(() => partyService.joinParty(code), {
    onSuccess: () => {
      queryClient.invalidateQueries(['party', code]);
      toast.success('Te has unido a la fiesta');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al unirse a la fiesta';
      toast.error(message);
    },
  });

  // Efectos para Socket.IO
  useEffect(() => {
    if (partyData?.hasAccess && socket) {
      joinParty(code);
    }

    return () => {
      if (socket) {
        leaveParty(code);
      }
    };
  }, [partyData?.hasAccess, socket, code, joinParty, leaveParty]);

  // Efectos para eventos en tiempo real
  useEffect(() => {
    if (!socket) return;

    const handleNewPhoto = (photo) => {
      queryClient.setQueryData(['partyPhotos', code], (old) => {
        if (!old) return { photos: [] };
        return {
          ...old,
          photos: [photo, ...old.photos],
        };
      });
    };

    const handleUpdateLike = (data) => {
      queryClient.setQueryData(['partyPhotos', code], (old) => {
        if (!old) return old;
        return {
          ...old,
          photos: old.photos.map((photo) =>
            photo._id === data.photoId
              ? { ...photo, likesCount: data.likesCount, hasUserLiked: data.hasUserLiked }
              : photo
          ),
        };
      });
    };

    const handleNewComment = (data) => {
      queryClient.setQueryData(['partyPhotos', code], (old) => {
        if (!old) return old;
        return {
          ...old,
          photos: old.photos.map((photo) =>
            photo._id === data.photoId
              ? { ...photo, commentsCount: data.commentsCount }
              : photo
          ),
        };
      });
    };

    socket.on('new-photo', handleNewPhoto);
    socket.on('update-like', handleUpdateLike);
    socket.on('new-comment', handleNewComment);

    return () => {
      socket.off('new-photo', handleNewPhoto);
      socket.off('update-like', handleUpdateLike);
      socket.off('new-comment', handleNewComment);
    };
  }, [socket, code, queryClient]);

  if (partyLoading || photosLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const party = partyData?.party;
  const photos = photosData?.photos || [];
  const canUploadPhotos = partyData?.canUploadPhotos;

  if (!party) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fiesta no encontrada</h2>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:text-primary-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const handleLike = (photoId) => {
    likePhotoMutation.mutate(photoId);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentPhotoMutation.mutate({
      photoId: selectedPhoto._id,
      text: commentText,
    });
  };

  const handleHidePhoto = (photoId) => {
    hidePhotoMutation.mutate(photoId);
  };

  const copyPartyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado al portapapeles');
  };

  const copyPartyLink = () => {
    const link = `${window.location.origin}/gallery/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleLeaveParty = () => {
    partyService.leaveParty(code).then(() => {
      navigate('/');
    });
  };

  const handleUploadPhoto = () => {
    // Abrir cámara o selector de archivos
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadFile(file);
      }
    };
    input.click();
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('media', file);
    
    // Obtener ubicación actual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          formData.append('location', JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
          uploadPhoto(formData);
        },
        () => {
          uploadPhoto(formData);
        }
      );
    } else {
      uploadPhoto(formData);
    }
  };

  const uploadPhoto = async (formData) => {
    try {
      await photoService.uploadPhoto(code, formData);
      toast.success('Foto subida exitosamente');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al subir foto';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{party.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {party.participants.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={copyPartyCode}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Copiar código"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={copyPartyLink}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Compartir enlace"
              >
                <Share2 className="h-5 w-5" />
              </button>
              {partyData.isParticipant && (
                <button
                  onClick={handleLeaveParty}
                  className="p-2 text-red-600 hover:text-red-700"
                  title="Salir de la fiesta"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Party Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {party.location.name}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(party.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {party.participants.length} participantes
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!partyData.hasAccess ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fiesta Privada</h2>
            <p className="text-gray-600 mb-6">
              Esta fiesta es privada. Necesitas un código de invitación para acceder.
            </p>
            <button
              onClick={() => joinPartyMutation.mutate()}
              disabled={joinPartyMutation.isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {joinPartyMutation.isLoading ? 'Uniéndose...' : 'Unirse a la Fiesta'}
            </button>
          </div>
        ) : (
          <>
            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay fotos aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Sé el primero en capturar un momento especial
                </p>
                {canUploadPhotos && (
                  <button
                    onClick={handleUploadPhoto}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Subir Primera Foto
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo._id}
                    photo={photo}
                    onClick={() => setSelectedPhoto(photo)}
                    onLike={() => handleLike(photo._id)}
                    onHide={() => handleHidePhoto(photo._id)}
                    isCreator={party.creator._id === user?._id}
                  />
                ))}
              </div>
            )}

            {/* Upload FAB */}
            {canUploadPhotos && (
              <button
                onClick={handleUploadPhoto}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 flex items-center justify-center"
              >
                <Camera className="h-6 w-6" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => {
            setSelectedPhoto(null);
            setShowComments(false);
            setCommentText('');
          }}
          onLike={() => handleLike(selectedPhoto._id)}
          onHide={() => handleHidePhoto(selectedPhoto._id)}
          isCreator={party.creator._id === user?._id}
          showComments={showComments}
          setShowComments={setShowComments}
          commentText={commentText}
          setCommentText={setCommentText}
          onComment={handleComment}
        />
      )}
    </div>
  );
};

const PhotoCard = ({ photo, onClick, onLike, onHide, isCreator }) => {
  const isVideo = photo.mimeType.startsWith('video/');
  
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
        {isVideo ? (
          <video
            src={photo.url}
            className="w-full h-full object-cover"
            muted
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => e.target.pause()}
          />
        ) : (
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg">
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className={`flex items-center space-x-1 ${photo.hasUserLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-4 w-4 ${photo.hasUserLiked ? 'fill-current' : ''}`} />
                <span>{photo.likesCount}</span>
              </button>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{photo.commentsCount}</span>
              </div>
            </div>
            {isCreator && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHide();
                }}
                className="p-1"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PhotoModal = ({
  photo,
  onClose,
  onLike,
  onHide,
  isCreator,
  showComments,
  setShowComments,
  commentText,
  setCommentText,
  onComment,
}) => {
  const isVideo = photo.mimeType.startsWith('video/');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full max-h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={photo.user.avatar || '/default-avatar.png'}
              alt={photo.user.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">{photo.user.username}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onLike}
              className={`p-2 ${photo.hasUserLiked ? 'text-red-500' : 'text-white'}`}
            >
              <Heart className={`h-5 w-5 ${photo.hasUserLiked ? 'fill-current' : ''}`} />
            </button>
            {isCreator && (
              <button onClick={onHide} className="p-2 text-white">
                <EyeOff className="h-5 w-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          {/* Media */}
          <div className="flex-1 flex items-center justify-center">
            {isVideo ? (
              <video
                src={photo.url}
                controls
                className="max-w-full max-h-full rounded-lg"
              />
            ) : (
              <img
                src={photo.url}
                alt={photo.caption}
                className="max-w-full max-h-full rounded-lg object-contain"
              />
            )}
          </div>

          {/* Comments Sidebar */}
          <div className="w-full md:w-80 bg-white rounded-lg p-4 flex flex-col max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Comentarios</h3>
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-primary-600 text-sm"
              >
                {showComments ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showComments && (
              <>
                {/* Comment Input */}
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onComment()}
                    placeholder="Escribe un comentario..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    onClick={onComment}
                    className="p-2 text-primary-600 hover:text-primary-700"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {/* Aquí irían los comentarios reales */}
                  <div className="text-center text-gray-500 py-8">
                    No hay comentarios aún
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Caption */}
        {photo.caption && (
          <div className="text-white text-center mt-4">
            <p>{photo.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyGallery;