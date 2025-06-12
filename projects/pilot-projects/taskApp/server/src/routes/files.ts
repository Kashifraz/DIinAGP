import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, document, and archive files are allowed'));
    }
  }
});

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { taskId } = req.body;

    const fileAttachment = await prisma.fileAttachment.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        taskId: taskId || null,
        userId: req.user!.id
      }
    });

    return res.status(201).json({
      success: true,
      data: fileAttachment
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Get files for a task
// @route   GET /api/files/task/:taskId
// @access  Private
router.get('/task/:taskId', protect, async (req: AuthRequest, res) => {
  try {
    const files = await prisma.fileAttachment.findMany({
      where: {
        taskId: req.params.taskId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const file = await prisma.fileAttachment.findUnique({
      where: { id: req.params.id },
      include: {
        task: {
          include: {
            project: {
              include: {
                members: {
                  where: {
                    userId: req.user!.id
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has access to the file
    if (file.userId !== req.user!.id && (!file.task || file.task.project.members.length === 0)) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    await prisma.fileAttachment.delete({
      where: { id: req.params.id }
    });

    return res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

export { router as fileRoutes }; 