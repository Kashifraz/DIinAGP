import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  tagIds: z.array(z.string()).optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  tagIds: z.array(z.string()).optional()
});

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
router.get('/project/:projectId', protect, async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: req.params.projectId,
        project: {
          members: {
            some: {
              userId: req.user!.id
            }
          }
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attachments: true,
        _count: {
          select: {
            comments: true,
            attachments: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: {
          members: {
            some: {
              userId: req.user!.id
            }
          }
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attachments: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({
      success: true,
      data: task
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { title, description, priority, dueDate, assigneeId, tagIds } = createTaskSchema.parse(req.body);
    const { projectId } = req.body;

    // Verify user is member of project
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user!.id,
          projectId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        projectId,
        createdById: req.user!.id,
        tags: tagIds ? {
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        } : undefined
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: task
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

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, tagIds } = updateTaskSchema.parse(req.body);

    // Verify user has access to task
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: {
          members: {
            some: {
              userId: req.user!.id
            }
          }
        }
      }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Update tags if provided
    if (tagIds) {
      // Remove existing tags
      await prisma.taskTag.deleteMany({
        where: { taskId: req.params.id }
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: tagIds.map((tagId: string) => ({
            taskId: req.params.id,
            tagId
          }))
        });
      }
    }

    return res.json({
      success: true,
      data: task
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

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Team Lead)
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    // Verify user has permission to delete task
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: {
          members: {
            some: {
              userId: req.user!.id,
              role: {
                in: ['ADMIN', 'TEAM_LEAD']
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or insufficient permissions' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
  return null;
});

export { router as taskRoutes }; 