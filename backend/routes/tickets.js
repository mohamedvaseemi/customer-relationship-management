import express from 'express';
import { getAllTickets, createTicket, updateTicket } from '../controllers/ticketController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getAllTickets);
router.post('/', createTicket);
router.put('/:id', updateTicket);

export default router;
