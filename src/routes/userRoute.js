import express from 'express';
import { getMe, updateMe, getAllUsers, createBarber, updateUserRole } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createBarberSchema, updateUserRoleSchema, updateMeSchema } from '../validators/userValidator.js';

const router = express.Router();

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, validateRequest(updateMeSchema), updateMe);

// Admin-only
router.get('/', authMiddleware, authorize('ADMIN'), getAllUsers);
router.post('/barbers', authMiddleware, authorize('ADMIN'), validateRequest(createBarberSchema), createBarber);
router.patch('/:id/role', authMiddleware, authorize('ADMIN'), validateRequest(updateUserRoleSchema), updateUserRole);

export default router;