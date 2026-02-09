const express = require('express');
const router = express.Router();
const { startChat, getConversations, deleteConversation } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getConversations);
router.get('/start/:userId', protect, startChat);
router.post('/delete/:userId', protect, deleteConversation);

module.exports = router;
