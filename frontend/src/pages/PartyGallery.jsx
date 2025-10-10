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
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-outline/40 bg-surface px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold text-content">Fiesta no encontrada</h2>
        <p className="text-sm text-content-muted">Revisa el código o vuelve al feed principal.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center rounded-full border border-outline/50 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:text-brand"
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
    <div className="min-h-screen bg-base text-content">
      {/* Header */}
      <div className="border-b border-outline/30 bg-surface/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-content-muted hover:text-content"
              >
                <X className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-content">{party.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-content-muted">
                  <span className="font-mono rounded-full border border-outline/40 bg-surface-muted px-2 py-1">
                    {code}
                  </span>
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
                className="rounded-full p-2 text-content-muted transition hover:text-content"
                title="Copiar código"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={copyPartyLink}
                className="rounded-full p-2 text-content-muted transition hover:text-content"
                title="Compartir enlace"
              >
                <Share2 className="h-5 w-5" />
              </button>
              {partyData.isParticipant && (
                <button
                  onClick={handleLeaveParty}
                  className="rounded-full p-2 text-danger transition hover:text-danger"
                  title="Salir de la fiesta"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Party Info */}
          <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="flex items-center text-content-muted">
              <MapPin className="h-4 w-4 mr-2" />
              {party.location.name}
            </div>
            <div className="flex items-center text-content-muted">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(party.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-content-muted">
              <Users className="h-4 w-4 mr-2" />
              {party.participants.length} participantes
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!partyData.hasAccess ? (
          <div className="ui-card border border-outline/40 px-6 py-12 text-center">
            <h2 className="text-2xl font-semibold text-content mb-3">Fiesta privada</h2>
            <p className="text-sm text-content-muted mb-6">
              Esta fiesta es privada. Necesitas un código de invitación para acceder.
            </p>
            <button
              onClick={() => joinPartyMutation.mutate()}
              disabled={joinPartyMutation.isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {joinPartyMutation.isLoading ? 'Uniéndose...' : 'Unirse a la Fiesta'}
            </button>
          </div>
        ) : (
          <>
            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="ui-card border border-outline/40 px-6 py-12 text-center">
                <Camera className="mx-auto mb-4 h-16 w-16 text-brand" />
                <h3 className="text-lg font-semibold text-content mb-2">No hay fotos aún</h3>
                <p className="text-sm text-content-muted mb-4">
                  Sé el primero en capturar un momento especial
                </p>
                {canUploadPhotos && (
                  <button
                    onClick={handleUploadPhoto}
                    className="inline-flex items-center gap-2 rounded-full border border-outline/50 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:text-brand"
                  >
                    <Camera className="h-5 w-5" />
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
                className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg"
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
    <div className="group relative cursor-pointer overflow-hidden rounded-3xl border border-outline/40 bg-surface shadow-soft transition hover:-translate-y-1" onClick={onClick}>
      <div className="aspect-square overflow-hidden bg-surface-muted">
        {isVideo ? (
          <video
            src={photo.url}
            className="h-full w-full object-cover"
            muted
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => e.target.pause()}
          />
        ) : (
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.caption}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-6 p-3 text-white transition duration-300 group-hover:translate-y-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${photo.hasUserLiked ? 'bg-white/20 text-danger' : 'bg-white/10 text-white/90 hover:bg-white/20'}`}
            >
              <Heart className={`h-4 w-4 ${photo.hasUserLiked ? 'fill-current' : ''}`} />
              <span>{photo.likesCount}</span>
            </button>
            <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-white/90">
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
              className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          )}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="flex max-h-full w-full max-w-4xl flex-col">
        <div className="mb-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <img
              src={photo.user.avatar || '/default-avatar.png'}
              alt={photo.user.username}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm font-semibold">{photo.user.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLike}
              className={`rounded-full p-2 ${photo.hasUserLiked ? 'bg-white/20 text-danger' : 'bg-white/10 text-white/90 hover:bg-white/20'}`}
            >
              <Heart className={`h-5 w-5 ${photo.hasUserLiked ? 'fill-current' : ''}`} />
            </button>
            {isCreator && (
              <button onClick={onHide} className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20">
                <EyeOff className="h-5 w-5" />
              </button>
            )}
            <button onClick={onClose} className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur">
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-black/40">
            {isVideo ? (
              <video src={photo.url} controls className="max-h-full w-full rounded-2xl object-contain" />
            ) : (
              <img
                src={photo.url}
                alt={photo.caption}
                className="max-h-full w-full rounded-2xl object-contain"
              />
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-xs uppercase tracking-[0.3em] text-white/70 transition hover:text-white"
              >
                {showComments ? 'Ocultar' : 'Mostrar'}
              </button>
              <span className="text-sm text-white/70">
                {photo.likesCount} likes · {photo.commentsCount} comentarios
              </span>
            </div>

            {showComments && (
              <>
                <div className="mb-4 mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onComment()}
                    placeholder="Escribe un comentario..."
                    className="flex-1 rounded-2xl border border-outline/40 bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={onComment}
                    className="rounded-full border border-outline/40 p-2 text-brand transition hover:border-brand hover:text-brand"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  <div className="text-center text-white/60">
                    No hay comentarios aún
                  </div>
                </div>
              </>
            )}
          </div>

          {photo.caption && (
            <div className="text-center text-white/80">
              <p>{photo.caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PartyGallery;
