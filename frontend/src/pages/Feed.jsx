import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { partyService } from '../services/partyService';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, MessageCircle, Camera } from 'lucide-react';

const Feed = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  
  const { data: feedData, isLoading, error } = useQuery(
    ['feed', page],
    () => partyService.getFeed(page),
    { keepPreviousData: true }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  // Redirección a Top si no sigues a nadie (feed vacío)
  if (feedData && Array.isArray(feedData.parties) && feedData.parties.length === 0) {
    navigate('/top');
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error cargando el feed</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gold mb-2">Feed de Álbumes</h1>
        <p className="text-gray-600">Descubre los álbumes de las personas que sigues</p>
      </div>

      {feedData?.parties?.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay fiestas aún</h3>
          <p className="text-gray-600 mb-4">
            Comienza a seguir a otros usuarios para ver sus fiestas aquí
          </p>
          <Link
            to="/top"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Descubrir usuarios
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {feedData?.parties?.map((party) => (
            <PartyCard key={party._id} party={party} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {feedData?.pagination && feedData.pagination.pages > 1 && (
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
              Página {page} de {feedData.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(feedData.pagination.pages, p + 1))}
              disabled={page === feedData.pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

const PartyCard = ({ party }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = new Date(party.endDate) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen principal o placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
        {party.photos && party.photos.length > 0 ? (
          <img
            src={party.photos[0].url}
            alt={party.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera className="h-16 w-16 text-white opacity-50" />
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {party.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              por {party.creator.username}
            </p>
          </div>
          {isExpired && (
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              Finalizada
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(party.startDate)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {party.location.name}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {party.participants.length} participantes
          </div>
        </div>

        {party.description && (
          <p className="text-gray-700 mb-4 line-clamp-2">
            {party.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {party.photos && (
              <div className="flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                {party.photos.length}
              </div>
            )}
          </div>

          <Link
            to={`/gallery/${party.code}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            Ver Galería
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Feed;