import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

const idParam = z.object({
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().toLowerCase(),
    password: strongPassword,
    role: z.enum(['Admin', 'Member']).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1)
  })
});

export const projectSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(5).max(1000)
  })
});

export const projectUpdateSchema = idParam.extend({
  body: projectSchema.shape.body.partial()
});

export const taskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(5).max(1000),
    status: z.enum(['Pending', 'InProgress', 'Completed', 'Overdue']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    dueDate: z.coerce.date(),
    assignedTo: z.coerce.number().int().positive(),
    projectId: z.coerce.number().int().positive()
  })
});

export const taskUpdateSchema = idParam.extend({
  body: taskSchema.shape.body.partial()
});

export const idSchema = idParam;
