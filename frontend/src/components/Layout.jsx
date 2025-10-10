import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Camera,
  Search,
  TrendingUp,
  PlusCircle,
  User,
  Home,
  Settings,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/top', label: 'Destacados', icon: TrendingUp },
    { path: '/create', label: 'Crear álbum', icon: PlusCircle },
    { path: '/search', label: 'Explorar', icon: Search },
    // { path: `/settings`, label: 'Configuración', icon: Settings },
    { path: `/profile/${user?.username ?? ''}`, label: 'Perfil', icon: User },
  ];

  const isActive = (targetPath) => {
    if (targetPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(targetPath);
  };

  return (
    <div className="min-h-screen text-content flex flex-col">
      <header className="sticky top-0 z-40 border-b border-outline/40 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-surface-muted/60 border border-outline/50 shadow-soft">
              <Camera className="h-6 w-6 text-brand-500" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight">FotoCam</span>
              <span className="text-xs uppercase tracking-[0.2em] text-content-muted">
                Álbumes compartidos
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full bg-surface-muted/60 px-2 py-2 backdrop-blur-lg md:flex">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`group flex size-10 items-center justify-center rounded-full transition ${
                    active
                      ? 'bg-brand text-[color:var(--color-on-accent)] shadow-soft'
                      : 'text-content-muted hover:text-content'
                  }`}
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            to={`/profile/${user?.username ?? ''}`}
            className="flex items-center gap-3 rounded-full bg-surface-muted/70 px-3 py-2 text-sm font-medium text-content transition hover:text-brand"
            title="Ver perfil"
          >
            <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-outline/40 bg-surface">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="size-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </span>
            <span>{user?.username}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <nav className="fixed bottom-5 left-1/2 z-40 flex w-[92%] max-w-xl -translate-x-1/2 items-center justify-around rounded-full bg-surface/90 px-3 py-3 backdrop-blur-xl shadow-soft md:hidden">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              title={label}
              className={`flex size-12 items-center justify-center rounded-full transition ${
                active ? 'text-brand' : 'text-content-muted hover:text-content'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
