const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Create a new chat or return existing one
exports.createChat = async (req, res) => {
  try {
    const { userId } = req.body; // ID of the user to chat with
    
    if (!userId) {
      return res.status(400).json({ message: 'Please provide a user ID' });
    }

    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: {
        $all: [req.userId, userId],
        $size: 2
      }
    }).populate('participants', 'username email profilePic isOnline');

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const newChat = await Chat.create({
      participants: [req.userId, userId],
      isGroup: false
    });

    // Populate participant details
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'username email profilePic isOnline');

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Error creating chat' });
  }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType = 'text', fileUrl } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'Please provide chat ID and content' });
    }

    // Verify user is a participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create and save the message
    const newMessage = await Message.create({
      chat: chatId,
      sender: req.userId,
      content,
      messageType,
      fileUrl,
      readBy: [req.userId]
    });

    // Update chat's lastMessage
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id
    });

    // Populate sender details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username email profilePic');    // Emit socket event for real-time updates
    io.to(chatId).emit('newMessage', populatedMessage);
    
    // Send notification to offline participants
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== req.userId.toString()) {
        const socketId = getUserSocket(participantId);
        if (!socketId) {
          // User is offline, handle notification here (e.g., push notification)
          console.log(`User ${participantId} is offline, sending notification`);
        }
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get chat messages with pagination
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Verify user is a participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Get messages with pagination
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username email profilePic')
      .populate('readBy', 'username');

    // Get total count for pagination
    const total = await Message.countDocuments({ chat: chatId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// Get user's chats
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'username email profilePic isOnline')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
};
