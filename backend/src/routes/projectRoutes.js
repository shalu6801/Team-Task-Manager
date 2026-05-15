import { Router } from 'express';
import { createProject, deleteProject, getProjects, updateProject } from '../controllers/projectController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idSchema, projectSchema, projectUpdateSchema } from '../validations/schemas.js';

const router = Router();

router.get('/', authenticate, getProjects);
router.post('/', authenticate, authorize('Admin'), validate(projectSchema), createProject);
router.put('/:id', authenticate, authorize('Admin'), validate(projectUpdateSchema), updateProject);
router.delete('/:id', authenticate, authorize('Admin'), validate(idSchema), deleteProject);

export default router;
