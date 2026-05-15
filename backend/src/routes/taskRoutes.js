import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/taskController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idSchema, taskSchema, taskUpdateSchema } from '../validations/schemas.js';

const router = Router();

router.get('/', authenticate, getTasks);
router.post('/', authenticate, authorize('Admin'), validate(taskSchema), createTask);
router.put('/:id', authenticate, validate(taskUpdateSchema), updateTask);
router.delete('/:id', authenticate, authorize('Admin'), validate(idSchema), deleteTask);

export default router;
