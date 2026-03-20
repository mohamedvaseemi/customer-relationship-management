import express from 'express';
import {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    getDeletedContacts,
    restoreContact
} from '../controllers/contactController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllContacts);
router.get('/deleted', getDeletedContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.post('/:id/restore', restoreContact);
router.delete('/:id', deleteContact);

export default router;
