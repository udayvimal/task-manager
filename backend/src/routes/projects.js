const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Helper: check if user is admin of project
async function isAdmin(projectId, userId) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return membership?.role === 'admin';
}

// GET /api/projects — all projects the user belongs to
router.get('/', auth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.userId } } },
      include: {
        _count: { select: { tasks: true, members: true } },
        members: {
          where: { userId: req.userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects — create project (creator becomes admin)
router.post(
  '/',
  auth,
  [body('name').trim().notEmpty().withMessage('Project name required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;
    try {
      const project = await prisma.project.create({
        data: {
          name,
          description,
          createdById: req.userId,
          members: { create: { userId: req.userId, role: 'admin' } },
        },
        include: { _count: { select: { tasks: true, members: true } } },
      });
      res.status(201).json(project);
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/projects/:id — project detail with members and tasks
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id — update project (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.params.id, req.userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id — delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.params.id, req.userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/members — add member by email (admin only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.params.id, req.userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { email, role = 'member' } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId: user.id } },
    });
    if (existing) return res.status(400).json({ error: 'User already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(member);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:userId — remove member (admin only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    if (!(await isAdmin(req.params.id, req.userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    if (req.params.userId === req.userId) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }
    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: req.params.id, userId: req.params.userId },
      },
    });
    res.json({ message: 'Member removed' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
