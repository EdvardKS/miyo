import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Users, UserPlus, MapPin, Calendar, TrendingUp } from 'lucide-react';

const TopUsers = () => {
  const { data: topUsersData, isLoading, error } = useQuery(
    'topUsers',
    async () => {
      const response = await fetch('/api/users/top/activity');
      const data = await response.json();
      return data;
    }
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
        <p className="text-red-600">Error cargando top usuarios</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <TrendingUp className="h-8 w-8 mr-2 text-primary-500" />
          Top de Actividad
        </h1>
        <p className="text-gray-600">
          Descubre los usuarios más activos y populares de la comunidad
        </p>
      </div>

      {topUsersData?.users?.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios activos</h3>
          <p className="text-gray-600">
            Sé el primero en crear fiestas y compartir fotos
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topUsersData?.users?.map((user, index) => (
            <UserCard key={user._id} user={user} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const UserCard = ({ user, rank }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${user.username}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Rank Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRankColor(rank)}`}>
            {getRankIcon(rank)}
          </div>
          {user.isPublicFigure && (
            <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
              Figura Pública
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center mb-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <Users className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.username}
            </h3>
            <p className="text-sm text-gray-600">
              {user.followersCount} seguidores
            </p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-700 mb-4 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-900">
              {user.followersCount}
            </div>
            <div className="text-xs text-gray-600">Seguidores</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-900">
              {user.followingCount}
            </div>
            <div className="text-xs text-gray-600">Siguiendo</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/profile/${user.username}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Ver Perfil
          </Link>
          {!isFollowing && (
            <button
              onClick={handleFollow}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="spinner mr-2"></div>
              ) : (
                <UserPlus className="h-4 w-4 mr-1" />
              )}
              Seguir
            </button>
          )}
        </div>

        {/* Last Active */}
        {user.lastLogin && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Activo por última vez: {new Date(user.lastLogin).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUsers;