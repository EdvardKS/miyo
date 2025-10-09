import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { partyService } from '../services/partyService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Users, Lock, Globe, Camera, Plus } from 'lucide-react';

const CreateParty = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const isPrivate = watch('isPrivate', true);

  const createPartyMutation = useMutation(partyService.createParty, {
    onSuccess: (data) => {
      toast.success('¡Fiesta creada exitosamente!');
      queryClient.invalidateQueries('myParties');
      navigate(`/gallery/${data.party.code}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al crear fiesta';
      toast.error(message);
    },
  });

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setValue('location.coordinates.lat', latitude);
          setValue('location.coordinates.lng', longitude);
          setGettingLocation(false);
          toast.success('Ubicación obtenida');
        },
        (error) => {
          toast.error('No se pudo obtener la ubicación');
          setGettingLocation(false);
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
      setGettingLocation(false);
    }
  };

  const onSubmit = (data) => {
    const partyData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };
    createPartyMutation.mutate(partyData);
  };

  const setMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nueva Fiesta</h1>
        <p className="text-gray-600">
          Organiza un evento y comparte los mejores momentos con tus amigos
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Fiesta *
              </label>
              <input
                {...register('title', {
                  required: 'El título es requerido',
                  maxLength: {
                    value: 100,
                    message: 'Máximo 100 caracteres',
                  },
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mi Fiesta Increíble"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Máximo 500 caracteres',
                  },
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe tu fiesta..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha y Hora de Inicio *
              </label>
              <input
                {...register('startDate', {
                  required: 'La fecha de inicio es requerida',
                })}
                type="datetime-local"
                min={setMinDateTime()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha y Hora de Fin *
              </label>
              <input
                {...register('endDate', {
                  required: 'La fecha de fin es requerida',
                })}
                type="datetime-local"
                min={setMinDateTime()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ubicación *
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {gettingLocation ? 'Obteniendo...' : 'Usar mi ubicación actual'}
              </button>
            </div>

            <div>
              <input
                {...register('location.name', {
                  required: 'El nombre del lugar es requerido',
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2"
                placeholder="Nombre del lugar"
              />
              {errors.location?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.location.name.message}</p>
              )}
            </div>

            <div>
              <input
                {...register('location.address', {
                  required: 'La dirección es requerida',
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Dirección completa"
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  {...register('location.coordinates.lat', {
                    required: 'La latitud es requerida',
                  })}
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Latitud"
                />
                {errors.location?.coordinates?.lat && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.coordinates.lat.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...register('location.coordinates.lng', {
                    required: 'La longitud es requerida',
                  })}
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Longitud"
                />
                {errors.location?.coordinates?.lng && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.coordinates.lng.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Privacidad */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Privacidad de la Fiesta
            </label>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  {...register('isPrivate')}
                  type="radio"
                  value={true}
                  className="mr-3"
                />
                <Lock className="h-5 w-5 text-gray-600 mr-2" />
                <div>
                  <div className="font-medium">Privada</div>
                  <div className="text-sm text-gray-600">
                    Solo usuarios invitados pueden unirse
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  {...register('isPrivate')}
                  type="radio"
                  value={false}
                  className="mr-3"
                />
                <Globe className="h-5 w-5 text-gray-600 mr-2" />
                <div>
                  <div className="font-medium">Pública</div>
                  <div className="text-sm text-gray-600">
                    Cualquiera con el código puede unirse
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Participantes (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Máximo de Participantes (opcional)
            </label>
            <input
              {...register('maxParticipants', {
                min: {
                  value: 1,
                  message: 'Mínimo 1 participante',
                },
              })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Dejar en blanco para ilimitado"
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message}</p>
            )}
          </div>

          {/* Botón de envío */}
          <div>
            <button
              type="submit"
              disabled={createPartyMutation.isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPartyMutation.isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Creando Fiesta...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Fiesta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateParty;