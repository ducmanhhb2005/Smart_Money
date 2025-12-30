import { Router } from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// Tất cả các route này đều cần xác thực
router.get('/',  getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
export default router;
 
