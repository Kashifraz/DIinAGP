import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  emitTaskUpdate: (projectId: string, task: any) => void;
  emitTaskCreate: (projectId: string, task: any) => void;
  emitTaskDelete: (projectId: string, taskId: string) => void;
  emitCommentAdd: (projectId: string, comment: any) => void;
  emitFileUpload: (projectId: string, file: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io('http://localhost:5000', {
        auth: {
          token,
        },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinProject = (projectId: string) => {
    if (socket && isConnected) {
      socket.emit('join-project', projectId);
    }
  };

  const leaveProject = (projectId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-project', projectId);
    }
  };

  const emitTaskUpdate = (projectId: string, task: any) => {
    if (socket && isConnected) {
      socket.emit('task-updated', { projectId, task });
    }
  };

  const emitTaskCreate = (projectId: string, task: any) => {
    if (socket && isConnected) {
      socket.emit('task-created', { projectId, task });
    }
  };

  const emitTaskDelete = (projectId: string, taskId: string) => {
    if (socket && isConnected) {
      socket.emit('task-deleted', { projectId, taskId });
    }
  };

  const emitCommentAdd = (projectId: string, comment: any) => {
    if (socket && isConnected) {
      socket.emit('comment-added', { projectId, comment });
    }
  };

  const emitFileUpload = (projectId: string, file: any) => {
    if (socket && isConnected) {
      socket.emit('file-uploaded', { projectId, file });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinProject,
    leaveProject,
    emitTaskUpdate,
    emitTaskCreate,
    emitTaskDelete,
    emitCommentAdd,
    emitFileUpload,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}; 