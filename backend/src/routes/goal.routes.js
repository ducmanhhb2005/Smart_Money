// backend/src/routes/goal.routes.js
import { Router } from 'express';
import {
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal
} from '../controllers/goal.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;