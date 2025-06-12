import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        isRead: true
      }
    });

    return res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

export { router as notificationRoutes }; 