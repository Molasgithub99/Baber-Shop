import express from 'express';
import { getAllBarbers } from '../controllers/baberController.js';

const router = express.Router();

router.get('/', getAllBarbers);

export default router;