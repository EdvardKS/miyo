import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { partyService } from '../services/partyService';
import { 
  User, 
  Calendar, 
  MapPin, 
  Users, 
  Settings, 
  Camera, 
  Heart, 
  MessageCircle,
  Edit,
  Lock,
  Globe,
  Star
} from 'lucide-react';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Determinar si es el perfil del usuario actual
  const isOwnProfile = !username || username === currentUser?.username;
  const profileUsername = username || currentUser?.username;

  // Obtener información del perfil
  const { data: profileData, isLoading, error } = useQuery(
    ['userProfile', profileUsername],
    async () => {
      const response = await fetch(`/api/users/${profileUsername}`);
      if (!response.ok) throw new Error('Usuario no encontrado');
      return response.json();
    },
    { enabled: !!profileUsername }
  );

  // Obtener fiestas del usuario
  const { data: partiesData } = useQuery(
    ['userParties', profileUsername],
    () => partyService.getMyParties('all', 1),
    { enabled: !!profileUsername && isOwnProfile }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !profileData?.user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h2>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:text-primary-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const user = profileData.user;
  const parties = partiesData?.parties || [];

  const handleEditProfile = () => {
    setEditForm({
      username: user.username,
      bio: user.bio || '',
      isPublicProfile: user.isPublicProfile,
      isPublicFigure: user.isPublicFigure,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  const handleFollow = async () => {
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
        // Refrescar datos
        window.location.reload();
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.username}
                </h1>
                {user.isPublicFigure && (
                  <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Figura Pública
                  </span>
                )}
                {user.isPublicProfile ? (
                  <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    Perfil Público
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Perfil Privado
                  </span>
                )}
              </div>

              {!isEditing ? (
                <>
                  <p className="text-gray-600 mb-3">
                    {user.bio || 'Sin biografía'}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">{user.followersCount}</span>
                      <span className="ml-1">seguidores</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">{user.followingCount}</span>
                      <span className="ml-1">siguiendo</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Se unió {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biografía
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.isPublicProfile}
                        onChange={(e) => setEditForm({ ...editForm, isPublicProfile: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Perfil público</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.isPublicFigure}
                        onChange={(e) => setEditForm({ ...editForm, isPublicFigure: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Figura pública</span>
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {isOwnProfile ? (
              <button
                onClick={handleEditProfile}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Editar perfil"
              >
                <Edit className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Seguir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button className="py-4 px-1 border-b-2 border-primary-500 text-primary-600 font-medium">
              <Camera className="inline h-5 w-5 mr-2" />
              Mis Fiestas
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              <Heart className="inline h-5 w-5 mr-2" />
              Likes
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {isOwnProfile ? (
        <div>
          {parties.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No has creado fiestas aún
              </h3>
              <p className="text-gray-600 mb-4">
                Crea tu primera fiesta y empieza a compartir momentos
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Crear Fiesta
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {parties.map((party) => (
                <PartyCard key={party._id} party={party} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Perfil Privado
          </h3>
          <p className="text-gray-600">
            Este perfil es privado. Sigue a este usuario para ver su contenido.
          </p>
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
    });
  };

  const isExpired = new Date(party.endDate) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
        <Camera className="h-12 w-12 text-white opacity-50" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {party.title}
        </h3>

        <div className="space-y-1 mb-3">
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

        {isExpired && (
          <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full mb-2">
            Finalizada
          </span>
        )}

        <Link
          to={`/gallery/${party.code}`}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
        >
          Ver Galería
        </Link>
      </div>
    </div>
  );
};

export default Profile;