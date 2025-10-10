import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { partyService } from '../services/partyService';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, MessageCircle, Camera, TrendingUp } from 'lucide-react';

const Feed = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  
  const { data: feedData, isLoading, error } = useQuery(
    ['feed', page],
    () => partyService.getFeed(page),
    { keepPreviousData: true }
  );

  const renderSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="ui-card animate-pulse overflow-hidden">
          <div className="h-40 w-full bg-content-muted/10" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-1/3 rounded bg-content-muted/20" />
            <div className="h-4 w-1/2 rounded bg-content-muted/20" />
            <div className="h-3 w-1/4 rounded bg-content-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <HeroHeader />
        {renderSkeleton()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <HeroHeader />
        <div className="ui-card flex flex-col items-center gap-4 px-6 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No pudimos cargar el feed</h3>
            <p className="text-sm text-content-muted">
              Intenta de nuevo en unos instantes o refresca la página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const parties = feedData?.parties ?? [];

  return (
    <div className="flex w-full flex-col gap-6">
      <HeroHeader />

      {parties.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {parties.map((party) => (
            <PartyCard key={party._id} party={party} />
          ))}
        </div>
      )}

      {feedData?.pagination && feedData.pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={feedData.pagination.pages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(feedData.pagination.pages, p + 1))}
        />
      )}
    </div>
  );
};

const HeroHeader = () => (
  <div className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="space-y-4">
        <span className="ui-chip">Tu universo creativo</span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Momentos que tus amigos comparten contigo
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-content-muted sm:text-base">
            Sigue descubriendo fotografías y recuerdos de las personas y experiencias que más
            disfrutas. Cada álbum es una historia en tiempo real.
          </p>
        </div>
      </div>
      <Link
        to="/top"
        className="glow-ring inline-flex items-center gap-2 rounded-full border border-outline/50 bg-surface-muted px-5 py-3 text-sm font-medium text-content transition-all hover:border-brand hover:text-brand"
      >
        <TrendingUp className="h-4 w-4" />
        Descubrir talento
      </Link>
    </div>
    <div className="gradient-divider mt-8" />
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {[
        { icon: Users, label: 'Círculos activos', value: 'Comunidades vibrantes' },
        { icon: Heart, label: 'Reacciones compartidas', value: 'Likes y comentarios en vivo' },
        { icon: Camera, label: 'Recuerdos frescos', value: 'Álbumes en tendencia' },
      ].map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-outline/40 bg-base-subtle">
            <Icon className="h-5 w-5 text-brand-500" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-content-muted">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="ui-card flex flex-col items-center gap-5 px-6 py-14 text-center">
    <span className="flex size-20 items-center justify-center rounded-full border border-dashed border-brand/50 bg-accent/5 text-brand shadow-soft">
      <Camera className="h-10 w-10" />
    </span>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">Tu feed está esperando nuevas historias</h3>
      <p className="text-sm text-content-muted">
        Comienza a seguir usuarios y únete a álbumes para ver cómo se llena de inspiración.
      </p>
    </div>
    <Link
      to="/top"
      className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg"
    >
      Descubrir usuarios destacados
    </Link>
  </div>
);

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
  const coverPhoto = party.photos && party.photos.length > 0 ? party.photos[0] : null;

  return (
    <article className="ui-card overflow-hidden border border-outline/40 card-hover">
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0">
          {coverPhoto ? (
            <img
              src={coverPhoto.url}
              alt={party.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400/40 via-brand-500/40 to-brand-700/60 text-[color:var(--color-on-accent)]">
              <Camera className="h-12 w-12 opacity-75" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(party.startDate)}
            </div>
            <h3 className="text-2xl font-semibold text-white drop-shadow">
              {party.title}
            </h3>
            <p className="text-sm text-white/80">por {party.creator.username}</p>
          </div>
          {isExpired && (
            <span className="ui-chip bg-white/15 text-xs text-white backdrop-blur">
              Finalizada
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoBadge icon={MapPin} label="Lugar" value={party.location?.name ?? 'Ubicación pendiente'} />
          <InfoBadge
            icon={Users}
            label="Participantes"
            value={`${party.participants.length} personas`}
          />
          <InfoBadge
            icon={Camera}
            label="Recuerdos"
            value={party.photos ? `${party.photos.length} archivos` : 'Sin fotos todavía'}
          />
        </div>

        {party.description && (
          <p className="text-sm text-content-muted line-clamp-3">
            {party.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-content-muted">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-brand-500" />
              Interacciones en vivo
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-brand-500" />
              Comentarios activos
            </span>
          </div>
          <Link
            to={`/gallery/${party.code}`}
            className="glow-ring inline-flex items-center gap-2 rounded-full border border-outline/50 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand"
          >
            Ver galería
          </Link>
        </div>
      </div>
    </article>
  );
};

const InfoBadge = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-outline/30 bg-surface-muted px-4 py-3">
    <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-brand">
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-content-muted">{label}</p>
      <p className="text-sm font-medium text-content">{value}</p>
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => (
  <div className="flex items-center justify-center">
    <nav className="flex items-center gap-3 rounded-full border border-outline/50 bg-surface-muted px-3 py-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="rounded-full px-4 py-2 text-sm font-medium text-content-secondary transition hover:text-content disabled:cursor-not-allowed disabled:text-content-muted"
      >
        Anterior
      </button>
      <span className="rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-brand">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="rounded-full px-4 py-2 text-sm font-medium text-content-secondary transition hover:text-content disabled:cursor-not-allowed disabled:text-content-muted"
      >
        Siguiente
      </button>
    </nav>
  </div>
);

export default Feed;
