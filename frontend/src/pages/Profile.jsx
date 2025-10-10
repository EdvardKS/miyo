import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  User,
  Calendar,
  MapPin,
  Users,
  Camera,
  Sparkles,
  Lock,
  Globe,
  Ban,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { partyService } from '../services/partyService';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isOwnProfile = !username || username === currentUser?.username;
  const profileUsername = username || currentUser?.username;

  const { data: profileData, isLoading, error } = useQuery(
    ['userProfile', profileUsername],
    async () => {
      const response = await fetch(`/api/users/${profileUsername}`);
      if (!response.ok) throw new Error('Usuario no encontrado');
      return response.json();
    },
    { enabled: !!profileUsername },
  );

  const { data: partiesData } = useQuery(
    ['userParties', profileUsername],
    () => partyService.getMyParties('all', 1),
    { enabled: !!profileUsername && isOwnProfile },
  );

  const user = profileData?.user ?? null;
  const parties = partiesData?.parties || [];

  const stats = useMemo(
    () => [
      { icon: Users, label: 'Seguidores', value: user?.followersCount ?? 0 },
      { icon: Users, label: 'Siguiendo', value: user?.followingCount ?? 0 },
      {
        icon: Calendar,
        label: 'Miembro desde',
        value: user?.createdAt
          ? new Date(user.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '-',
      },
    ],
    [user?.followersCount, user?.followingCount, user?.createdAt],
  );

  if (isLoading) {
    return (
      <div className="flex w-full justify-center py-24">
        <div className="ui-card flex h-40 w-full max-w-md items-center justify-center border border-outline/40">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="ui-card mx-auto flex max-w-2xl flex-col items-center gap-4 border border-outline/40 px-8 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Usuario no encontrado</h2>
        <button
          onClick={() => navigate('/')}
          className="rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:text-brand"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/users/${user.username}/follow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      window.location.reload();
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const blockUser = async () => {
    const token = localStorage.getItem('token');
    await fetch(`/api/users/${user.username}/block`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="flex size-28 items-center justify-center overflow-hidden rounded-xl border border-outline/40 bg-surface-muted text-3xl font-semibold shadow-soft">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="size-full object-cover" />
                ) : (
                  user.username.slice(0, 1).toUpperCase()
                )}
              </div>
              <span className="absolute -right-2 bottom-1 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-[color:var(--color-on-accent)] shadow-soft">
                <Sparkles className="h-3 w-3" />
                {user.isPublicProfile ? 'Público' : 'Privado'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">{user.username}</h1>
                  {user.isPublicProfile ? (
                    <span className="ui-chip">
                      <Globe className="h-3.5 w-3.5" />
                      Perfil público
                    </span>
                  ) : (
                    <span className="ui-chip">
                      <Lock className="h-3.5 w-3.5" />
                      Perfil privado
                    </span>
                  )}
                </div>
                {user.bio ? (
                  <p className="mt-2 max-w-2xl text-sm text-content-muted">{user.bio}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                {stats.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl border border-outline/40 bg-surface-muted px-4 py-2 text-sm font-semibold text-content"
                  >
                    <Icon className="h-4 w-4 text-brand-500" />
                    <span>{value}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-content-muted">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isOwnProfile ? (
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-5 py-2.5 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
              >
                Configuración
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg"
              >
                Seguir
              </button>
            )}

            {!isOwnProfile && (
              <button
                onClick={blockUser}
                className="inline-flex items-center gap-2 rounded-full border border-danger/40 px-5 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10"
              >
                <Ban className="h-4 w-4" />
                Bloquear
              </button>
            )}
          </div>
        </div>
      </section>

        <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
          <h2 className="text-xl font-semibold text-content">Álbumes creados</h2>
          <p className="mt-1 text-sm text-content-muted">
            {isOwnProfile
              ? 'Tus experiencias compartidas se mostrarán aquí.'
              : 'Álbumes visibles según la configuración de privacidad.'}
          </p>

          <div className="mt-6">
            {isOwnProfile ? (
              parties.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-outline/40 bg-surface-muted/70 px-6 py-14 text-center">
                  <Camera className="h-10 w-10 text-brand" />
                  <h3 className="text-lg font-semibold">Aún no tienes álbumes</h3>
                  <p className="text-sm text-content-muted">
                    Crea tu primer evento desde la barra de navegación.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {parties.map((party) => (
                    <PartyCard key={party._id} party={party} />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-outline/40 bg-surface-muted px-6 py-14 text-center">
                <Lock className="h-10 w-10 text-brand" />
                <h3 className="text-lg font-semibold">Contenido privado</h3>
                <p className="text-sm text-content-muted">
                  Sigue a este usuario para solicitar acceso a sus álbumes.
                </p>
              </div>
            )}
          </div>
        </section>
    </div>
  );
};

const PartyCard = ({ party }) => {
  const isExpired = new Date(party.endDate) < new Date();
  const startDate = new Date(party.startDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="ui-card overflow-hidden border border-outline/40">
      <div className="relative h-32 bg-gradient-to-br from-brand-400/50 via-brand-500/40 to-brand-700/60">
        <div className="absolute inset-0 flex items-center justify-center text-[color:var(--color-on-accent)]">
          <Camera className="h-10 w-10 opacity-70" />
        </div>
        <div className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {startDate}
        </div>
        {isExpired && (
          <div className="absolute right-4 top-4 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            Finalizada
          </div>
        )}
      </div>

      <div className="space-y-4 px-4 py-5">
        <div>
          <h3 className="text-lg font-semibold text-content">{party.title}</h3>
          <p className="mt-1 text-sm text-content-muted">{party.location.name}</p>
        </div>
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-content-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4 text-brand-500" />
            {party.participants.length} invitados
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-brand-500" />
            {party.code}
          </span>
        </div>
        <Link
          to={`/gallery/${party.code}`}
          className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:text-brand"
        >
          Ver galería
        </Link>
      </div>
    </article>
  );
};

export default Profile;
