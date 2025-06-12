import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get user from the token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      req.user = user;
      next();
      return;
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  return;
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    if (!roles.includes(membership.role)) {
      return res.status(403).json({ 
        message: `User role ${membership.role} is not authorized to access this resource` 
      });
    }

    next();
    return;
  };
}; 