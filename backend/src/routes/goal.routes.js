import { Router } from 'express';
import {
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    addSavingsToGoal
} from '../controllers/goal.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/add-savings', addSavingsToGoal);
export default router;