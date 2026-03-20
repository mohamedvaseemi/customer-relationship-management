import express from 'express';
import { getMyChannels, getChannelMessages, sendMessage } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/channels', getMyChannels);
router.get('/channels/:channelId/messages', getChannelMessages);
router.post('/messages', sendMessage);

export default router;
