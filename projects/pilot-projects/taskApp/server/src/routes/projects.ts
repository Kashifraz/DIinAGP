import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional()
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'TEAM_LEAD', 'MEMBER'])
});

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        members: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        tags: true,
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json({
      success: true,
      data: project
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { name, description, startDate, endDate } = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        members: {
          create: {
            userId: req.user!.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin/Team Lead)
router.put('/:id', protect, authorize('ADMIN', 'TEAM_LEAD'), async (req: AuthRequest, res) => {
  try {
    const { name, description, startDate, endDate, isActive } = updateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Invite member to project
// @route   POST /api/projects/:id/invite
// @access  Private (Admin/Team Lead)
router.post('/:id/invite', protect, authorize('ADMIN', 'TEAM_LEAD'), async (req: AuthRequest, res) => {
  try {
    const { email, role } = inviteMemberSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: req.params.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: req.params.id,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin)
router.delete('/:id/members/:userId', protect, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: req.params.userId,
          projectId: req.params.id
        }
      }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as projectRoutes }; 