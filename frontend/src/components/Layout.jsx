import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Users, TrendingUp, PlusCircle, User, LogOut, Home } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">Fiestas</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Feed</span>
              </Link>
              <Link
                to="/top"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/top') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Top</span>
              </Link>
              <Link
                to="/create"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/create') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Crear</span>
              </Link>
              <Link
                to={`/profile/${user?.username}`}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(`/profile/${user?.username}`) 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hola, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
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