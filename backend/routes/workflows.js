import express from 'express';
import { 
  getWorkflowRules, 
  createWorkflowRule, 
  toggleWorkflowRule, 
  deleteWorkflowRule 
} from '../controllers/workflowController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getWorkflowRules);
router.post('/', createWorkflowRule);
router.patch('/:id', toggleWorkflowRule);
router.delete('/:id', deleteWorkflowRule);

export default router;
