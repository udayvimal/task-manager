const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/dashboard — stats for all projects the user belongs to
router.get('/', auth, async (req, res) => {
  try {
    const memberProjects = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      select: { projectId: true, role: true },
    });
    const projectIds = memberProjects.map((m) => m.projectId);

    const [totalTasks, byStatus, byPriority, tasksByUser, overdueTasks, projects] =
      await Promise.all([
        prisma.task.count({ where: { projectId: { in: projectIds } } }),

        prisma.task.groupBy({
          by: ['status'],
          where: { projectId: { in: projectIds } },
          _count: true,
        }),

        prisma.task.groupBy({
          by: ['priority'],
          where: { projectId: { in: projectIds } },
          _count: true,
        }),

        prisma.task.groupBy({
          by: ['assignedToId'],
          where: {
            projectId: { in: projectIds },
            assignedToId: { not: null },
          },
          _count: true,
        }),

        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            dueDate: { lt: new Date() },
            status: { not: 'done' },
          },
        }),

        prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, name: true },
        }),
      ]);

    // Enrich tasksByUser with names
    const userIds = tasksByUser
      .map((t) => t.assignedToId)
      .filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    res.json({
      totalTasks,
      totalProjects: projectIds.length,
      overdueTasks,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count })),
      tasksByUser: tasksByUser.map((t) => ({
        userId: t.assignedToId,
        name: userMap[t.assignedToId] || 'Unknown',
        count: t._count,
      })),
      projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
