import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const where = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };
  const [totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks, byStatus, byPriority, recentTasks] =
    await Promise.all([
      req.user.role === 'Admin'
        ? prisma.project.count()
        : prisma.project.count({ where: { tasks: { some: { assignedTo: req.user.id } } } }),
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'Completed' } }),
      prisma.task.count({ where: { ...where, status: 'Pending' } }),
      prisma.task.count({ where: { ...where, OR: [{ status: 'Overdue' }, { dueDate: { lt: new Date() }, status: { not: 'Completed' } }] } }),
      prisma.task.groupBy({ by: ['status'], where, _count: { status: true } }),
      prisma.task.groupBy({ by: ['priority'], where, _count: { priority: true } }),
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

  res.json({
    stats: { totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks },
    charts: { byStatus, byPriority },
    recentActivities: recentTasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      project: task.project.title,
      assignee: task.assignee.name,
      createdAt: task.createdAt
    }))
  });
});
