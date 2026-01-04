// backend/src/routes/ai.routes.js
import { Router } from 'express';
import { parseTextToTransaction, parseReceiptWithGemini, generateSavingPlan } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import multer from 'multer';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/parse-text', authMiddleware, parseTextToTransaction);
router.post('/parse-receipt', authMiddleware, upload.single('receiptImage'), parseReceiptWithGemini);
router.post('/generate-saving-plan', authMiddleware, generateSavingPlan);
export default router;