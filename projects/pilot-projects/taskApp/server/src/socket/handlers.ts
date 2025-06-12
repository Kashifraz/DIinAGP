import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket {
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).userId = user.id;
      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: any) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    
    console.log(`User connected: ${authenticatedSocket.user.email}`);

    // Join project rooms
    socket.on('join-project', async (projectId: string) => {
      try {
        // Verify user is member of project
        const membership = await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: authenticatedSocket.userId,
              projectId
            }
          }
        });

        if (membership) {
          socket.join(`project-${projectId}`);
          console.log(`User ${authenticatedSocket.user.email} joined project ${projectId}`);
        }
      } catch (error) {
        console.error('Error joining project:', error);
      }
    });

    // Leave project rooms
    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project-${projectId}`);
      console.log(`User ${authenticatedSocket.user.email} left project ${projectId}`);
    });

    // Handle task updates
    socket.on('task-updated', (data: { projectId: string; task: any }) => {
      socket.to(`project-${data.projectId}`).emit('task-updated', data.task);
    });

    // Handle task created
    socket.on('task-created', (data: { projectId: string; task: any }) => {
      socket.to(`project-${data.projectId}`).emit('task-created', data.task);
    });

    // Handle task deleted
    socket.on('task-deleted', (data: { projectId: string; taskId: string }) => {
      socket.to(`project-${data.projectId}`).emit('task-deleted', data.taskId);
    });

    // Handle comment added
    socket.on('comment-added', (data: { projectId: string; comment: any }) => {
      socket.to(`project-${data.projectId}`).emit('comment-added', data.comment);
    });

    // Handle file uploaded
    socket.on('file-uploaded', (data: { projectId: string; file: any }) => {
      socket.to(`project-${data.projectId}`).emit('file-uploaded', data.file);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${authenticatedSocket.user.email}`);
    });
  });
}; 