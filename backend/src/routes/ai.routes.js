// backend/src/routes/ai.routes.js
import { Router } from 'express';
import { parseTextToTransaction } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/parse-text', authMiddleware, parseTextToTransaction);

export default router;