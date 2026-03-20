import express from 'express';
import {
    getAllActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity
} from '../controllers/activityController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllActivities);
router.get('/:id', getActivityById);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
