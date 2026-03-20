import express from 'express';
import {
    getAllDeals,
    getDealById,
    createDeal,
    updateDeal,
    deleteDeal
} from '../controllers/dealController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllDeals);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;
