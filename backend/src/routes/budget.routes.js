import { Router } from 'express';
import {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget
} from '../controllers/budget.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createBudget);
router.get('/', getBudgets);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;