import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { publicUser } from '../utils/sanitize.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { assignedTasks: true, projects: true } }
    }
  });

  res.json(users.map((user) => ({ ...publicUser(user), counts: user._count })));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const data = {};

  if (typeof name === 'string' && name.trim().length >= 2) {
    data.name = name.trim();
  }

  if (typeof password === 'string' && password.length >= 8) {
    data.password = await bcrypt.hash(password, 12);
  }

  if (!Object.keys(data).length) {
    return res.status(400).json({ message: 'No valid profile fields supplied' });
  }

  const user = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json({ user: publicUser(user) });
});
