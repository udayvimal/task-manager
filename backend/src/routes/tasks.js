const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

async function getMembership(projectId, userId) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

// GET /api/tasks?projectId=... — get tasks in a project
router.get('/', auth, async (req, res) => {
  const { projectId } = req.query;
  try {
    const membership = await getMembership(projectId, req.userId);
    if (!membership) return res.status(403).json({ error: 'Not a project member' });

    const where = { projectId };
    // Members only see their assigned tasks; admins see all
    if (membership.role === 'member') {
      where.assignedToId = req.userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks — create task (admin only)
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('projectId').notEmpty().withMessage('projectId required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, dueDate, priority, projectId, assignedToId } = req.body;
    try {
      const membership = await getMembership(projectId, req.userId);
      if (!membership) return res.status(403).json({ error: 'Not a project member' });
      if (membership.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

      const task = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: priority || 'medium',
          projectId,
          assignedToId: assignedToId || null,
          createdById: req.userId,
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });
      res.status(201).json(task);
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/tasks/:id — update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await getMembership(task.projectId, req.userId);
    if (!membership) return res.status(403).json({ error: 'Not a project member' });

    const isAdmin = membership.role === 'admin';
    const isAssignee = task.assignedToId === req.userId;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Members can only update status; admins can update everything
    const updateData = isAdmin
      ? {
          title: req.body.title,
          description: req.body.description,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
          priority: req.body.priority,
          status: req.body.status,
          assignedToId: req.body.assignedToId,
        }
      : { status: req.body.status };

    // Remove undefined keys
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id — delete task (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await getMembership(task.projectId, req.userId);
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
