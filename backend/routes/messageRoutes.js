const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getConversation, sendMessage, getMyConversations, pollMessages } = require('../controllers/messageController');
router.get('/', protect, getMyConversations);
router.get('/:jobId/:userId', protect, getConversation);
router.get('/:jobId/:userId/poll', protect, pollMessages);
router.post('/:jobId/:userId', protect, sendMessage);
module.exports = router;