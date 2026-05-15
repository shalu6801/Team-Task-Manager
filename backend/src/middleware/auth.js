import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
  next();
};
