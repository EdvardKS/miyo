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
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token,
        },
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