import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  Users,
  Lock,
  Globe,
  Camera,
  Plus,
  Sparkles,
} from 'lucide-react';
import { partyService } from '../services/partyService';

const inputBaseClass =
  'w-full rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0 focus:shadow-focus transition';

const errorClass = 'mt-2 text-xs font-medium text-danger';

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
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      isPrivate: 'true',
      startDate: '',
      endDate: '',
      location: {
        name: '',
        address: '',
        coordinates: {
          lat: '',
          lng: '',
        },
      },
      maxParticipants: '',
    },
  });

  const privacySelection = watch('isPrivate', 'true');
  const isPrivate = privacySelection !== 'false';

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
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setValue('location.coordinates.lat', latitude);
        setValue('location.coordinates.lng', longitude);
        setGettingLocation(false);
        toast.success('Ubicación obtenida correctamente');
      },
      () => {
        toast.error('No se pudo obtener la ubicación');
        setGettingLocation(false);
      },
    );
  };

  const onSubmit = (data) => {
    const partyData = {
      ...data,
      isPrivate: data.isPrivate !== 'false',
      maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : undefined,
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
    <div className="flex w-full flex-col gap-8">
      <header className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <span className="ui-chip">
              <Camera className="h-4 w-4" />
              Nuevo álbum colaborativo
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Diseña la próxima experiencia inolvidable
              </h1>
              <p className="max-w-2xl text-sm text-content-muted sm:text-base">
                Define todos los detalles de tu evento y comparte el código con tus invitados.
                Gestiona privacidad, ubicación y horarios desde un mismo lugar.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-brand/50 bg-accent/10 px-4 py-3 text-sm text-brand shadow-soft">
            Código generado automáticamente al crear tu fiesta
          </div>
        </div>
        <div className="gradient-divider mt-8" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Calendar, label: 'Eventos planificados', value: 'Sin límites' },
            { icon: Users, label: 'Colaboradores', value: 'Invita con un código' },
            { icon: Sparkles, label: 'Moderación', value: 'Control total del álbum' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">{label}</p>
                <p className="text-sm font-medium text-content">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid gap-6">
            <div>
              <Label>Nombre del evento *</Label>
              <input
                {...register('title', {
                  required: 'El título es requerido',
                  maxLength: {
                    value: 100,
                    message: 'Máximo 100 caracteres',
                  },
                })}
                type="text"
                className={inputBaseClass}
                placeholder="Summer Golden Nights"
              />
              {errors.title && <p className={errorClass}>{errors.title.message}</p>}
            </div>

            <div>
              <Label>Descripción</Label>
              <textarea
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Máximo 500 caracteres',
                  },
                })}
                rows={4}
                className={`${inputBaseClass} resize-none`}
                placeholder="Comparte el vibe del evento, dress code o dinámica principal..."
              />
              {errors.description && <p className={errorClass}>{errors.description.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label icon={Calendar}>Inicio *</Label>
              <input
                {...register('startDate', {
                  required: 'La fecha de inicio es requerida',
                })}
                type="datetime-local"
                min={setMinDateTime()}
                className={inputBaseClass}
              />
              {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label icon={Calendar}>Fin *</Label>
              <input
                {...register('endDate', {
                  required: 'La fecha de fin es requerida',
                })}
                type="datetime-local"
                min={setMinDateTime()}
                className={inputBaseClass}
              />
              {errors.endDate && <p className={errorClass}>{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label icon={MapPin}>Ubicación *</Label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content-secondary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:text-content-muted"
              >
                {gettingLocation ? (
                  <>
                    <span className="spinner" />
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Usar mi ubicación
                  </>
                )}
              </button>
            </div>

            {location && (
              <div className="rounded-2xl border border-brand/50 bg-accent/10 px-4 py-2 text-xs text-brand">
                Ubicación detectada: lat {location.lat.toFixed(4)}, lng {location.lng.toFixed(4)}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <input
                  {...register('location.name', {
                    required: 'El nombre del lugar es requerido',
                  })}
                  type="text"
                  className={inputBaseClass}
                  placeholder="Lugar del evento"
                />
                {errors.location?.name && (
                  <p className={errorClass}>{errors.location.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <input
                  {...register('location.address', {
                    required: 'La dirección es requerida',
                  })}
                  type="text"
                  className={inputBaseClass}
                  placeholder="Dirección o referencia"
                />
                {errors.location?.address && (
                  <p className={errorClass}>{errors.location.address.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <input
                  {...register('location.coordinates.lat', {
                    required: 'La latitud es requerida',
                  })}
                  type="number"
                  step="any"
                  className={inputBaseClass}
                  placeholder="Latitud"
                />
                {errors.location?.coordinates?.lat && (
                  <p className={errorClass}>{errors.location.coordinates.lat.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <input
                  {...register('location.coordinates.lng', {
                    required: 'La longitud es requerida',
                  })}
                  type="number"
                  step="any"
                  className={inputBaseClass}
                  placeholder="Longitud"
                />
                {errors.location?.coordinates?.lng && (
                  <p className={errorClass}>{errors.location.coordinates.lng.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Privacidad del álbum</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  value: 'true',
                  title: 'Privada',
                  description: 'Solo quienes invites podrán unirse y subir recuerdos.',
                  icon: Lock,
                },
                {
                  value: 'false',
                  title: 'Pública',
                  description: 'Cualquiera con el código puede participar.',
                  icon: Globe,
                },
              ].map(({ value, title, description, icon: Icon }) => {
                const active = privacySelection === value;
                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border px-5 py-4 transition ${
                      active
                        ? 'border-brand bg-accent/10 shadow-soft'
                        : 'border-outline/40 bg-surface-muted hover:border-brand/60'
                    }`}
                  >
                    <input
                      {...register('isPrivate')}
                      type="radio"
                      value={value}
                      className="sr-only"
                    />
                    <span
                      className={`mt-1 flex size-9 items-center justify-center rounded-xl border ${
                        active ? 'border-brand bg-accent/20 text-brand' : 'border-outline/40 text-content-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="space-y-1.5">
                      <span className="block text-sm font-semibold text-content">{title}</span>
                      <span className="block text-xs text-content-muted">{description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <Label icon={Users}>Máximo de participantes (opcional)</Label>
            <input
              {...register('maxParticipants', {
                min: {
                  value: 1,
                  message: 'Mínimo 1 participante',
                },
              })}
              type="number"
              className={inputBaseClass}
              placeholder="Deja vacío para ilimitado"
            />
            {errors.maxParticipants && (
              <p className={errorClass}>{errors.maxParticipants.message}</p>
            )}
          </div>

          <div className="gradient-divider" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-content-muted">
              Una vez publicado, podrás compartir el código y gestionar participantes desde la
              galería en tiempo real.
            </p>
            <button
              type="submit"
              disabled={createPartyMutation.isLoading}
              className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createPartyMutation.isLoading ? (
                <>
                  <span className="spinner" />
                  Creando álbum...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Crear fiesta
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const Label = ({ children, icon: Icon }) => (
  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
    {Icon ? <Icon className="h-4 w-4 text-brand-500" /> : null}
    {children}
  </label>
);

export default CreateParty;
