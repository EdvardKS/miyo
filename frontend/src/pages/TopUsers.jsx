import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  TrendingUp,
  Sparkles,
  Crown,
  Camera,
  Activity,
} from 'lucide-react';

const rankStyles = [
  {
    gradient: 'from-amber-400 via-amber-300 to-amber-500',
    glow: 'shadow-[0_25px_50px_-20px_rgba(234,179,8,0.55)]',
    badge: 'bg-amber-400 text-slate-900',
  },
  {
    gradient: 'from-slate-200 via-slate-100 to-slate-300',
    glow: 'shadow-[0_25px_50px_-20px_rgba(148,163,184,0.55)]',
    badge: 'bg-slate-200 text-slate-900',
  },
  {
    gradient: 'from-orange-400 via-orange-300 to-orange-500',
    glow: 'shadow-[0_25px_50px_-20px_rgba(249,115,22,0.55)]',
    badge: 'bg-orange-400 text-slate-900',
  },
];

const TopUsers = () => {
  const { data, isLoading, error } = useQuery('topUsers', async () => {
    const response = await fetch('/api/users/top/activity');
    return response.json();
  });

  const users = data?.users ?? [];

  if (isLoading) {
    return (
      <div className="flex w-full justify-center">
        <div className="ui-card flex h-40 w-full max-w-2xl items-center justify-center border border-outline/40">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-card mx-auto flex max-w-2xl flex-col items-center gap-3 border border-outline/40 px-8 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">No pudimos cargar el ranking</h2>
        <p className="max-w-md text-sm text-content-muted">
          Intenta de nuevo recargando la página o vuelve más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <span className="ui-chip">
              <TrendingUp className="h-4 w-4" />
              Ranking en vivo
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Los creadores que marcan la diferencia
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-content-muted sm:text-base">
                Este listado destaca a los usuarios con mayor interacción, actividad y creatividad
                en sus álbumes colaborativos.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Crown, label: 'Top global', value: 'Actualizado cada hora' },
              { icon: Camera, label: 'Fotos compartidas', value: 'Más de 12K colaboraciones' },
              { icon: Activity, label: 'Engagement', value: 'Curado por actividad real' },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-content-muted">
                  <Icon className="h-4 w-4 text-brand-500" />
                  {label}
                </div>
                <p className="mt-2 text-sm font-medium text-content">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {users.length === 0 ? (
        <div className="ui-card flex flex-col items-center gap-4 border border-outline/30 px-6 py-14 text-center">
          <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-outline/60 bg-surface-muted text-brand">
            <Sparkles className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold">Sé el primero en destacar</h3>
          <p className="max-w-lg text-sm text-content-muted">
            Crea un álbum, invita a tus contactos y comparte recuerdos para empezar a aparecer en el
            ranking.
          </p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user, index) => (
            <UserCard key={user._id} user={user} rank={index + 1} />
          ))}
        </section>
      )}
    </div>
  );
};

const UserCard = ({ user, rank }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const style = useMemo(() => rankStyles[rank - 1] ?? {
    gradient: 'from-slate-800 via-slate-900 to-slate-800',
    glow: 'shadow-[0_25px_50px_-20px_rgba(30,41,59,0.55)]',
    badge: 'bg-slate-800 text-white',
  }, [rank]);

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
    } catch (err) {
      console.error('Error following user:', err);
    } finally {
      setLoading(false);
    }
  };

  const badgeLabel = rank === 1 ? 'Oro' : rank === 2 ? 'Plata' : rank === 3 ? 'Bronce' : `Top ${rank}`;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-outline/40 bg-surface shadow-soft">
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-r ${style.gradient} opacity-90 ${style.glow}`} />
      <div className="relative space-y-6 px-6 pb-6 pt-8">
        <div className="flex items-start justify-between">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${style.badge}`}
          >
            #{rank} {badgeLabel}
          </span>
          {user.isPublicFigure && (
            <span className="ui-chip bg-white/15 text-white backdrop-blur">
              Figura pública
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-full border border-outline/40 bg-surface-muted text-2xl font-semibold">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                user.username?.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="absolute -right-1 bottom-0 flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-[color:var(--color-on-accent)]">
              {rank}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">{user.username}</h3>
            <p className="text-sm text-content-muted">
              {user.followersCount} seguidores · {user.followingCount} siguiendo
            </p>
          </div>
        </div>

        {user.bio && (
          <p className="line-clamp-3 text-sm text-content-muted">
            {user.bio}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <StatPill label="Participación" value={`${user.participationRate ?? '—'}%`} />
          <StatPill label="Álbumes creados" value={user.partiesCreated ?? 0} />
          <StatPill label="Reacciones" value={user.totalReactions ?? 0} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/profile/${user.username}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
          >
            Ver perfil
          </Link>
          {!isFollowing && (
            <button
              onClick={handleFollow}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <span className="spinner" /> : <UserPlus className="h-4 w-4" />}
              Seguir
            </button>
          )}
        </div>

        {user.lastLogin && (
          <p className="text-center text-xs text-content-muted">
            Última actividad: {new Date(user.lastLogin).toLocaleDateString()}
          </p>
        )}
      </div>
    </article>
  );
};

const StatPill = ({ label, value }) => (
  <div className="rounded-2xl border border-outline/30 bg-surface-muted px-4 py-3 text-center">
    <p className="text-xs uppercase tracking-[0.2em] text-content-muted">{label}</p>
    <p className="mt-1 text-sm font-semibold text-content">{value}</p>
  </div>
);

export default TopUsers;
