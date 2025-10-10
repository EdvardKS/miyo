import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Search as SearchIcon,
  User,
  UserPlus,
  Loader2,
  Sparkles,
  QrCode,
} from 'lucide-react';

const fetchUsers = async (q) => {
  if (!q) return { users: [] };
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error buscando usuarios');
  return res.json();
};

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [code, setCode] = useState('');

  const trimmedQuery = submittedQuery.trim();

  const { data, isFetching, isError } = useQuery(
    ['searchUsers', trimmedQuery],
    () => fetchUsers(trimmedQuery),
    {
      keepPreviousData: true,
      enabled: trimmedQuery.length >= 2,
    },
  );

  const users = data?.users || [];

  const handleSearch = (event) => {
    event?.preventDefault();
    setSubmittedQuery(query);
  };

  const handleJoin = (event) => {
    event.preventDefault();
    const formatted = code.trim().toUpperCase();
    if (formatted) {
      navigate(`/gallery/${formatted}`);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="ui-chip">
              <SearchIcon className="h-4 w-4" />
              Explorar Comunidad
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Encuentra colaboradores y únete a nuevos álbumes
              </h1>
              <p className="mt-3 text-sm text-content-muted sm:text-base">
                Busca usuarios por nombre o biografía. También puedes ingresar un código para
                acceder a una fiesta exclusiva.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content-muted">
            Consejo: usa palabras clave de la bio para descubrir creadores afines.
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <form onSubmit={handleSearch} className="group relative rounded-3xl border border-outline/40 bg-surface-muted p-6 transition hover:border-brand/60">
            <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
              Buscar personas
            </label>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-outline/30 bg-surface px-4 py-3">
              <SearchIcon className="h-5 w-5 text-brand-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Introduce al menos 2 caracteres"
                className="flex-1 bg-transparent text-sm text-content placeholder:text-content-muted focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-[color:var(--color-on-accent)] transition hover:shadow-soft"
              >
                Buscar
              </button>
            </div>
          </form>

          <form onSubmit={handleJoin} className="group relative rounded-3xl border border-outline/40 bg-surface-muted p-6 transition hover:border-brand/60">
            <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
              Unirse a un álbum
            </label>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-outline/30 bg-surface px-4 py-3">
              <QrCode className="h-5 w-5 text-brand-500" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código del evento"
                className="flex-1 bg-transparent text-sm uppercase text-content placeholder:text-content-muted focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full border border-outline/40 px-4 py-2 text-xs font-semibold text-content transition hover:border-brand hover:text-brand"
              >
                Ir
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Resultado de búsqueda</h2>
            {trimmedQuery ? (
              <p className="text-sm text-content-muted">
                Mostrando coincidencias para “{trimmedQuery}”
              </p>
            ) : (
              <p className="text-sm text-content-muted">
                Empieza a buscar para descubrir nuevos colaboradores.
              </p>
            )}
          </div>
        </header>

        {isError ? (
          <EmptyState
            icon={Sparkles}
            title="No pudimos completar la búsqueda"
            description="Intenta nuevamente en unos segundos."
          />
        ) : trimmedQuery.length < 2 ? (
          <EmptyState
            icon={Sparkles}
            title="Busca por nombre, usuario o bio"
            description="Introduce al menos dos caracteres para iniciar la búsqueda."
          />
        ) : isFetching ? (
          <div className="flex items-center justify-center py-12 text-content-muted">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Buscando
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Sin resultados"
            description="No encontramos usuarios con esa búsqueda. Intenta con otro término."
          />
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <UserResult key={u._id} user={u} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const UserResult = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${user.username}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error al seguir usuario', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex flex-col gap-4 rounded-3xl border border-outline/40 bg-surface-muted px-5 py-4 transition hover:border-brand/60 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full border border-outline/40 bg-surface">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="size-12 rounded-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-content-muted" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-content">{user.username}</p>
          <p className="text-xs text-content-muted">{user.followersCount} seguidores</p>
        </div>
      </div>
      {!isFollowing && (
        <button
          onClick={handleFollow}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-full bg-brand px-4 py-2 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 sm:self-auto"
        >
          {loading ? <span className="spinner" /> : <UserPlus className="h-4 w-4" />}
          Seguir
        </button>
      )}
    </li>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-outline/40 bg-surface-muted/70 px-6 py-14 text-center">
    <div className="flex size-16 items-center justify-center rounded-full border border-outline/40 bg-surface text-brand">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="max-w-md text-sm text-content-muted">{description}</p>
  </div>
);

export default Search;
