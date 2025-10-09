import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { photoService } from '../services/photoService';
import { 
  Camera, 
  Heart, 
  MessageCircle, 
  Calendar, 
  MapPin,
  Eye,
  LayoutGrid,
  List
} from 'lucide-react';

const MyPhotos = () => {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  const { data: photosData, isLoading, error } = useQuery(
    ['myPhotos', page],
    () => photoService.getMyPhotos(page),
    { keepPreviousData: true }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error cargando tus fotos</p>
      </div>
    );
  }

  const photos = photosData?.photos || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Fotos</h1>
        <p className="text-gray-600">
          Todas las fotos que has subido a las fiestas
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {photos.length} fotos totales
        </div>
      </div>

      {/* Content */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes fotos aún
          </h3>
          <p className="text-gray-600 mb-4">
            Únete a fiestas y empieza a capturar momentos
          </p>
          <Link
            to="/top"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Descubrir Fiestas
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <PhotoGridCard key={photo._id} photo={photo} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {photos.map((photo) => (
                <PhotoListCard key={photo._id} photo={photo} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {photosData?.pagination && photosData.pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Página {page} de {photosData.pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(photosData.pagination.pages, p + 1))}
                  disabled={page === photosData.pagination.pages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PhotoGridCard = ({ photo }) => {
  const isVideo = photo.mimeType.startsWith('video/');
  
  return (
    <div className="relative group cursor-pointer">
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
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-1">
              <Heart className="h-5 w-5" />
              <span>{photo.likesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-5 w-5" />
              <span>{photo.commentsCount}</span>
            </div>
          </div>
          <div className="text-xs text-center">
            <p className="font-medium truncate max-w-full px-2">
              {photo.party.title}
            </p>
            <p className="opacity-75">
              {new Date(photo.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <Link
        to={`/gallery/${photo.party.code}`}
        className="absolute inset-0"
        title={photo.caption || 'Ver foto'}
      />
    </div>
  );
};

const PhotoListCard = ({ photo }) => {
  const isVideo = photo.mimeType.startsWith('video/');
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
          {isVideo ? (
            <video
              src={photo.url}
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                {photo.party.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Código: <span className="font-mono">{photo.party.code}</span>
              </p>
            </div>
            {isVideo && (
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                Video
              </span>
            )}
          </div>

          {photo.caption && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {photo.caption}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{photo.likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{photo.commentsCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <Link
              to={`/gallery/${photo.party.code}`}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 rounded"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPhotos;