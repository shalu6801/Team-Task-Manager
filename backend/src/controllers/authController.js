import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';
import { publicUser } from '../utils/sanitize.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validated.body;
  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userCount = await prisma.user.count();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userCount === 0 ? 'Admin' : role || 'Member'
    }
  });

  res.status(201).json({ user: publicUser(user), token: signToken(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ user: publicUser(user), token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
