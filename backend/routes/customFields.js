import express from 'express';
import { 
  getCustomFields, 
  createCustomField, 
  updateCustomField, 
  deleteCustomField 
} from '../controllers/customFieldController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:module', getCustomFields);
router.post('/', createCustomField);
router.put('/:id', updateCustomField);
router.delete('/:id', deleteCustomField);

export default router;
