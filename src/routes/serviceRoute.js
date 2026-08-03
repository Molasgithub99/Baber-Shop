// src/routes/serviceRoute.js
import express from 'express';

import { getAllServices, getServiceById, createService } from '../controllers/serviceController.js';
import { createServiceSchema } from '../validators/serviceValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', authMiddleware, authorize('ADMIN'), validateRequest(createServiceSchema), createService);

export default router;