import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Tất cả các route này đều cần xác thực
router.get('/', authMiddleware, getTransactions);
router.post('/', authMiddleware, createTransaction);

export default router;
 
