import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// @desc    Get all users (for project invites)
// @route   GET /api/users
// @access  Private
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true
      }
    });

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

export { router as userRoutes }; 