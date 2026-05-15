import { Router } from 'express';
import { getUsers, updateProfile } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('Admin'), getUsers);
router.put('/profile', authenticate, updateProfile);

export default router;
