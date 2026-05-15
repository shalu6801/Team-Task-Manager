import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const where = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };

  if (req.user.role !== 'Admin') {
    // ── Member view ──
    const [totalTasks, completedTasks, pendingTasks, overdueTasks, pendingTasksList, recentTasks] =
      await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: 'Completed' } }),
        prisma.task.count({ where: { ...where, status: 'Pending' } }),
        prisma.task.count({ where: { ...where, OR: [{ status: 'Overdue' }, { dueDate: { lt: new Date() }, status: { not: 'Completed' } }] } }),
        prisma.task.findMany({
          where: { assignedTo: req.user.id, status: { not: 'Completed' } },
          include: { project: { select: { title: true } } },
          orderBy: { dueDate: 'asc' }
        }),
        prisma.task.findMany({
          where,
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { title: true } },
            assignee: { select: { name: true } }
          }
        })
      ]);

    return res.json({
      stats: { totalTasks, completedTasks, pendingTasks, overdueTasks },
      pendingTasksList: pendingTasksList.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        dueDate: t.dueDate,
        project: t.project.title
      })),
      recentActivities: recentTasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        project: task.project.title,
        assignee: task.assignee.name,
        createdAt: task.createdAt
      }))
    });
  }

  // ── Admin view ──
  const now = new Date();

  const startOf = (unit) => {
    const d = new Date(now);
    if (unit === 'week') {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
    } else if (unit === 'month') {
      d.setDate(1);
    } else if (unit === 'year') {
      d.setMonth(0, 1);
    }
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    recentTasks,
    members,
    weeklyStats,
    monthlyStats,
    yearlyStats
  ] = await Promise.all([
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'Completed' } }),
    prisma.task.count({ where: { status: 'Pending' } }),
    prisma.task.count({ where: { OR: [{ status: 'Overdue' }, { dueDate: { lt: now }, status: { not: 'Completed' } }] } }),
    prisma.task.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { title: true } },
        assignee: { select: { name: true } }
      }
    }),
    prisma.user.findMany({
      where: { role: 'Member' },
      select: { id: true, name: true, email: true }
    }),
    // Weekly per-member stats
    prisma.task.groupBy({
      by: ['assignedTo', 'status'],
      where: { createdAt: { gte: startOf('week') } },
      _count: { status: true }
    }),
    // Monthly per-member stats
    prisma.task.groupBy({
      by: ['assignedTo', 'status'],
      where: { createdAt: { gte: startOf('month') } },
      _count: { status: true }
    }),
    // Yearly per-member stats
    prisma.task.groupBy({
      by: ['assignedTo', 'status'],
      where: { createdAt: { gte: startOf('year') } },
      _count: { status: true }
    })
  ]);

  const buildMemberStats = (rawStats) => {
    return members.map(member => {
      const rows = rawStats.filter(r => r.assignedTo === member.id);
      const get = (status) => rows.find(r => r.status === status)?._count?.status || 0;
      return {
        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        completed: get('Completed'),
        pending: get('Pending'),
        inProgress: get('InProgress'),
        overdue: get('Overdue'),
        total: rows.reduce((s, r) => s + r._count.status, 0)
      };
    });
  };

  res.json({
    stats: { totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks },
    recentActivities: recentTasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      project: task.project.title,
      assignee: task.assignee.name,
      createdAt: task.createdAt
    })),
    assigneeStats: {
      weekly: buildMemberStats(weeklyStats),
      monthly: buildMemberStats(monthlyStats),
      yearly: buildMemberStats(yearlyStats)
    }
  });
});