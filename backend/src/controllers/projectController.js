import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const projectInclude = {
  creator: { select: { id: true, name: true, email: true, role: true } },
  tasks: {
    include: {
      assignee: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  },
  _count: { select: { tasks: true } }
};

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    where:
      req.user.role === 'Admin'
        ? undefined
        : { tasks: { some: { assignedTo: req.user.id } } },
    include: projectInclude,
    orderBy: { createdAt: 'desc' }
  });

  res.json(projects);
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.create({
    data: { ...req.validated.body, createdBy: req.user.id },
    include: projectInclude
  });

  res.status(201).json(project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.update({
    where: { id: req.validated.params.id },
    data: req.validated.body,
    include: projectInclude
  });

  res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  await prisma.project.delete({ where: { id: req.validated.params.id } });
  res.status(204).send();
});
