import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const resolveSocketUrl = () => {
        const explicit = import.meta.env.VITE_SOCKET_URL;
        if (explicit) return explicit;
        if (typeof window === 'undefined') return 'http://backend:5000';
        // Same-origin everywhere — nginx (frontend container) and the VPS
        // reverse proxy both upgrade /socket.io to the backend service.
        // Avoids hard-coding ports that break behind HTTPS:443.
        const { protocol, hostname, port } = window.location;
        return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      };

      const newSocket = io(resolveSocketUrl(), {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        setConnected(true);
        console.log('Conectado al servidor Socket.IO');
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        console.log('Desconectado del servidor Socket.IO');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const joinParty = (partyCode) => {
    if (socket && connected) {
      socket.emit('join-party', partyCode);
    }
  };

  const leaveParty = (partyCode) => {
    if (socket && connected) {
      socket.emit('leave-party', partyCode);
    }
  };

  const value = {
    socket,
    connected,
    joinParty,
    leaveParty,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
