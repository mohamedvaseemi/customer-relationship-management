import express from 'express';
import { getTemplates, getTemplateTasks, triggerAutomation } from '../controllers/automationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/templates', getTemplates);
router.get('/templates/:templateId/tasks', getTemplateTasks);
router.post('/trigger', triggerAutomation);

export default router;
