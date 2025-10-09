import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Search, TrendingUp, PlusCircle, User, LogOut, Home } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur shadow-sm border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">Álbumes</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 h-9 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary-700 dark:text-primary-400 bg-primary-50/70 dark:bg-white/10' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Feed</span>
              </Link>
              <Link
                to="/top"
                className={`flex items-center space-x-1 px-3 h-9 rounded-md text-sm font-medium transition-colors ${
                  isActive('/top') 
                    ? 'text-primary-700 dark:text-primary-400 bg-primary-50/70 dark:bg-white/10' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Top</span>
              </Link>
              <Link
                to="/create"
                className={`flex items-center space-x-1 px-3 h-9 rounded-md text-sm font-medium transition-colors ${
                  isActive('/create') 
                    ? 'text-primary-700 dark:text-primary-400 bg-primary-50/70 dark:bg-white/10' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Crear álbum</span>
              </Link>
              <Link
                to={`/profile/${user?.username}`}
                className={`flex items-center space-x-1 px-3 h-9 rounded-md text-sm font-medium transition-colors ${
                  isActive(`/profile/${user?.username}`) 
                    ? 'text-primary-700 dark:text-primary-400 bg-primary-50/70 dark:bg-white/10' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </Link>
              <form action="/search" className="flex items-center">
                <input name="q" type="search" placeholder="Buscar usuarios" className="px-3 h-9 text-sm border rounded-l-md border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                <button className="px-3 h-9 bg-primary-600 text-white rounded-r-md hover:bg-primary-700"><Search className="h-4 w-4" /></button>
              </form>
              {/* Unirse a álbum por código */}
              <form onSubmit={(e)=>{e.preventDefault(); const code=e.currentTarget.code.value.trim().toUpperCase(); if(code){ navigate(`/gallery/${code}`); }}} className="flex items-center">
                <input name="code" type="text" placeholder="Código álbum" className="px-3 h-9 text-sm border rounded-l-md border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 focus:ring-primary-500/50 uppercase" />
                <button className="px-3 h-9 bg-primary-500 text-black rounded-r-md hover:bg-primary-600">Ir</button>
              </form>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm">Hola, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 gap-1">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 px-1 ${
              isActive('/') ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Feed</span>
          </Link>
          <Link
            to="/top"
            className={`flex flex-col items-center py-2 px-1 ${
              isActive('/top') ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-xs mt-1">Top</span>
          </Link>
          <Link
            to="/create"
            className={`flex flex-col items-center py-2 px-1 ${
              isActive('/create') ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Crear</span>
          </Link>
          <Link
            to="/my-photos"
            className={`flex flex-col items-center py-2 px-1 ${
              isActive('/my-photos') ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs mt-1">Mis Fotos</span>
          </Link>
          <Link
            to={`/profile/${user?.username}`}
            className={`flex flex-col items-center py-2 px-1 ${
              isActive(`/profile/${user?.username}`) ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;