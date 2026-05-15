import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const taskInclude = {
  project: { select: { id: true, title: true } },
  assignee: { select: { id: true, name: true, email: true, role: true } },
  creator: { select: { id: true, name: true, email: true, role: true } }
};

const taskWhere = (req) => {
  const { search, status, priority, projectId, page = 1, limit = 10 } = req.query;
  const filters = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };

  if (search) {
    filters.OR = [
      { title: { contains: search } },
      { description: { contains: search } }
    ];
  }
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (projectId) filters.projectId = Number(projectId);

  return {
    where: filters,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit)
  };
};

export const getTasks = asyncHandler(async (req, res) => {
  const query = taskWhere(req);
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      ...query,
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
    }),
    prisma.task.count({ where: query.where })
  ]);

  res.json({
    data: tasks,
    meta: {
      total,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10),
      pages: Math.ceil(total / Number(req.query.limit || 10)) || 1
    }
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.create({
    data: { ...req.validated.body, createdBy: req.user.id },
    include: taskInclude
  });

  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.validated.params.id } });

  if (!existing) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (req.user.role !== 'Admin' && existing.assignedTo !== req.user.id) {
    return res.status(403).json({ message: 'Members can only update assigned tasks' });
  }

  const allowedData =
    req.user.role === 'Admin' ? req.validated.body : { status: req.validated.body.status };

  if (!Object.keys(allowedData).length || Object.values(allowedData).every((value) => value === undefined)) {
    return res.status(400).json({ message: 'No permitted task fields supplied' });
  }

  const task = await prisma.task.update({
    where: { id: req.validated.params.id },
    data: allowedData,
    include: taskInclude
  });

  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  await prisma.task.delete({ where: { id: req.validated.params.id } });
  res.status(204).send();
});
