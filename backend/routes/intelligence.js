import express from 'express';
import { getLeadTimeline, logActivity } from '../controllers/intelligenceController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/timeline/:leadId', getLeadTimeline);
router.post('/log', logActivity);

export default router;
