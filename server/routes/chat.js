const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// All routes are protected with JWT auth middleware
router.use(auth);

// Get all chats for the current user
router.get('/chats', chatController.getUserChats);

// Create a new chat or get existing one
router.post('/chat', chatController.createChat);

// Get messages for a specific chat with pagination
router.get('/chat/:chatId/messages', chatController.getChatMessages);

// Send a message in a chat
router.post('/message', chatController.sendMessage);

module.exports = router;
