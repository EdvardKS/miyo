import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { photoService } from '../services/photoService';
import { 
  Camera, 
  Heart, 
  MessageCircle, 
  Calendar, 
  MapPin,
  Eye,
  LayoutGrid,
  List
} from 'lucide-react';

const MyPhotos = () => {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  const { data: photosData, isLoading, error } = useQuery(
    ['myPhotos', page],
    () => photoService.getMyPhotos(page),
    { keepPreviousData: true }
  );

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
          <Camera className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">No pudimos cargar tus fotos</h2>
        <p className="max-w-md text-sm text-content-muted">
          Actualiza la página para volver a intentarlo.
        </p>
      </div>
    );
  }

  const photos = photosData?.photos || [];

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="ui-chip">
              <Camera className="h-4 w-4" />
              Archivo personal
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Mis fotos</h1>
            <p className="mt-2 max-w-2xl text-sm text-content-muted sm:text-base">
              Aquí encuentras cada recuerdo que has subido a tus fiestas y colaboraciones. Cambia de
              vista para explorar tus momentos desde otra perspectiva.
            </p>
          </div>
          <div className="rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content-secondary">
            Total de aportes <span className="ml-2 text-lg font-semibold text-content">{photos.length}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center rounded-full border border-outline/40 bg-surface-muted p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-brand text-[color:var(--color-on-accent)] shadow-soft'
                : 'text-content-muted hover:text-content'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Cuadrícula
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              viewMode === 'list'
                ? 'bg-brand text-[color:var(--color-on-accent)] shadow-soft'
                : 'text-content-muted hover:text-content'
            }`}
          >
            <List className="h-4 w-4" />
            Detalle
          </button>
        </div>

        <p className="rounded-full border border-outline/40 bg-surface-muted px-4 py-2 text-sm text-content-secondary">
          {photos.length} recuerdos capturados
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="ui-card flex flex-col items-center gap-4 border border-outline/30 px-6 py-14 text-center">
          <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-outline/60 bg-surface-muted text-brand">
            <Camera className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold">Aún no hay recuerdos</h3>
          <p className="max-w-lg text-sm text-content-muted">
            Únete a fiestas y empieza a compartir fotos y videos que cuenten tus historias.
          </p>
          <Link
            to="/top"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg"
          >
            Descubrir fiestas activas
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {photos.map((photo) => (
                <PhotoGridCard key={photo._id} photo={photo} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {photos.map((photo) => (
                <PhotoListCard key={photo._id} photo={photo} />
              ))}
            </div>
          )}

          {photosData?.pagination && photosData.pagination.pages > 1 && (
            <div className="flex justify-center">
              <nav className="mt-8 inline-flex items-center gap-3 rounded-full border border-outline/40 bg-surface-muted px-3 py-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-full px-4 py-2 text-sm font-medium text-content-secondary transition hover:text-content disabled:cursor-not-allowed disabled:text-content-muted"
                >
                  Anterior
                </button>
                <span className="rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-brand">
                  Página {page} de {photosData.pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(photosData.pagination.pages, p + 1))}
                  disabled={page === photosData.pagination.pages}
                  className="rounded-full px-4 py-2 text-sm font-medium text-content-secondary transition hover:text-content disabled:cursor-not-allowed disabled:text-content-muted"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PhotoGridCard = ({ photo }) => {
  const isVideo = photo.mimeType.startsWith('video/');
  
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-3xl border border-outline/40 bg-surface shadow-soft transition hover:-translate-y-1">
      <div className="aspect-square overflow-hidden">
        {isVideo ? (
          <video
            src={photo.url}
            className="h-full w-full object-cover"
            muted
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => e.target.pause()}
          />
        ) : (
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.caption}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex items-center justify-end gap-3 text-xs font-medium text-white">
          {isVideo ? (
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">Video</span>
          ) : null}
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
            {new Date(photo.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="space-y-3 text-white drop-shadow">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              <span>{photo.likesCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span>{photo.commentsCount}</span>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Álbum</p>
            <p className="text-sm font-semibold">{photo.party.title}</p>
            {photo.caption && (
              <p className="text-xs text-white/80 line-clamp-2">{photo.caption}</p>
            )}
          </div>
        </div>
      </div>

      <Link
        to={`/gallery/${photo.party.code}`}
        className="absolute inset-0"
        title={photo.caption || 'Ver foto'}
      />
    </div>
  );
};

const PhotoListCard = ({ photo }) => {
  const isVideo = photo.mimeType.startsWith('video/');
  
  return (
    <div className="ui-card overflow-hidden border border-outline/40">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="h-48 w-full bg-surface-muted md:h-auto md:w-52">
          {isVideo ? (
            <video
              src={photo.url}
              className="h-full w-full object-cover"
              muted
            />
          ) : (
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.caption}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-content">{photo.party.title}</h3>
              <p className="text-xs uppercase tracking-[0.3em] text-content-muted">
                Código · <span className="font-mono text-sm text-content">{photo.party.code}</span>
              </p>
            </div>
            {isVideo && (
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-brand">
                Video
              </span>
            )}
          </div>

          {photo.caption && (
            <p className="text-sm text-content-muted line-clamp-2">
              {photo.caption}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-sm text-content-muted">
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-brand-500" />
                <span>{photo.likesCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-brand-500" />
                <span>{photo.commentsCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-brand-500" />
                <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <Link
              to={`/gallery/${photo.party.code}`}
              className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
            >
              <Eye className="h-4 w-4" />
              Ver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPhotos;
