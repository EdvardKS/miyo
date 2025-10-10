import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  User,
  Calendar,
  MapPin,
  Users,
  Settings,
  Camera,
  Edit,
  Lock,
  Globe,
  Upload,
  Ban,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { partyService } from '../services/partyService';

const inputClass =
  'w-full rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0 focus:shadow-focus transition';

const themeOptions = [
  { value: 'system', label: 'Auto', description: 'Sincroniza con el modo del sistema' },
  { value: 'light', label: 'Claro', description: 'Fondos luminosos y texto oscuro' },
  { value: 'dark', label: 'Oscuro', description: 'Contraste alto para entornos oscuros' },
];

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

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

  const handleEditProfile = () => {
    setEditForm({
      username: user.username,
      bio: user.bio || '',
      isPublicProfile: user.isPublicProfile,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (err) {
      // handled by context toast
    }
  };

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

  const unblockUser = async () => {
    const token = localStorage.getItem('token');
    await fetch(`/api/users/${user.username}/block`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="flex size-28 items-center justify-center rounded-3xl border border-outline/40 bg-surface-muted text-3xl font-semibold shadow-soft">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="size-28 rounded-3xl object-cover"
                  />
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
                <p className="mt-3 max-w-2xl text-sm text-content-muted">
                  {user.bio || 'El usuario aún no ha agregado biografía.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {stats.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-outline/40 bg-surface-muted px-4 py-2 text-sm font-semibold text-content"
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
              <button
                onClick={handleEditProfile}
                className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-5 py-2.5 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
              >
                <Edit className="h-4 w-4" />
                Editar perfil
              </button>
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

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section id="ajustes" className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Información</h2>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content-muted transition hover:border-brand hover:text-brand"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              isOwnProfile && (
                <button
                  onClick={handleEditProfile}
                  className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content-muted transition hover:border-brand hover:text-brand"
                >
                  <Settings className="h-4 w-4" />
                  Ajustes rápidos
                </button>
              )
            )}
          </div>

          <div className="mt-6 space-y-6">
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
                    Biografía
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    className={`${inputClass} mt-2 resize-none`}
                  />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm font-semibold text-content transition hover:border-brand">
                  <input
                    type="checkbox"
                    checked={editForm.isPublicProfile}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isPublicProfile: e.target.checked })
                    }
                    className="size-4 accent-brand"
                  />
                  Perfil público
                </label>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fileInput = e.currentTarget.querySelector('input[type=file]');
                    if (!fileInput?.files?.[0]) return;
                    const formData = new FormData();
                    formData.append('avatar', fileInput.files[0]);
                    const token = localStorage.getItem('token');
                    await fetch('/api/users/me/avatar', {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    });
                    window.location.reload();
                  }}
                  className="rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
                    Actualizar avatar
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input type="file" accept="image/*" className="text-sm text-content-muted" />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
                    >
                      <Upload className="h-4 w-4" />
                      Subir
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="rounded-2xl border border-outline/40 bg-surface-muted px-4 py-4 text-sm text-content-muted">
                {user.bio || 'Añade una biografía para contar más sobre ti.'}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          {isOwnProfile && (
            <div className="ui-card border border-outline/30 px-5 py-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-content-muted">
                Preferencias de tema
              </h3>
              <p className="mt-2 text-sm text-content-muted">
                Resuelto actualmente en <span className="font-semibold">{resolvedTheme}</span>
              </p>
              <div className="mt-4 space-y-3">
                {themeOptions.map(({ value, label, description }) => {
                  const active = theme === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-brand bg-accent/10 text-content shadow-soft'
                          : 'border-outline/40 bg-surface-muted text-content hover:border-brand/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{label}</span>
                        {active ? (
                          <span className="rounded-full bg-brand px-2 py-1 text-xs font-semibold text-[color:var(--color-on-accent)]">
                            Activo
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-content-muted">{description}</p>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-danger/50 hover:text-danger"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}

          {!isOwnProfile && (
            <div className="ui-card border border-outline/30 px-5 py-6 text-sm text-content-muted">
              <p>¿Ves contenido inapropiado?</p>
              <button
                onClick={unblockUser}
                className="mt-3 text-sm font-semibold text-brand hover:underline"
              >
                Desbloquear usuario
              </button>
            </div>
          )}
        </aside>
      </div>

      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Álbumes creados</h2>
          {isOwnProfile && (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg"
            >
              <Camera className="h-4 w-4" />
              Crear nuevo
            </Link>
          )}
        </div>

        <div className="mt-6">
          {isOwnProfile ? (
            parties.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-outline/40 bg-surface-muted/70 px-6 py-14 text-center">
                <div className="flex size-16 items-center justify-center rounded-full border border-outline/40 bg-surface text-brand">
                  <Camera className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold">Aún no tienes álbumes</h3>
                <p className="max-w-md text-sm text-content-muted">
                  Crea tu primer evento y coordina a tus amigos para subir recuerdos juntos.
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
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-outline/40 bg-surface-muted px-6 py-14 text-center">
              <Lock className="mx-auto h-10 w-10 text-brand" />
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
          <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
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
            <Calendar className="h-4 w-4 text-brand-500" />
            Código {party.code}
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
