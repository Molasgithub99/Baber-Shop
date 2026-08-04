import express from 'express';
import { sendContactMessage, getAllContactMessages } from '../controllers/contactController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { contactSchema } from '../validators/contactValidator.js';

const router = express.Router();

router.post('/', validateRequest(contactSchema), sendContactMessage);
router.get('/', authMiddleware, authorize('ADMIN'), getAllContactMessages);

export default router;