const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const FriendRequest = require('../models/FriendRequest');

let io;

// Store online users with their socket IDs
const onlineUsers = new Map();

// Helper function to get a user's socket
const getUserSocket = (userId) => {
  const socketId = onlineUsers.get(userId.toString());
  return socketId ? io.sockets.sockets.get(socketId) : null;
};

const socketManager = (socketIo) => {
  io = socketIo;

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      
      // Store user's socket id
      onlineUsers.set(decoded.userId, socket.id);
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Handle socket events
  io.on('connection', async (socket) => {
    console.log('User connected:', socket.userId);

    try {
      // Update user's online status
      const currentUser = await User.findByIdAndUpdate(
        socket.userId, 
        { isOnline: true, lastActive: new Date() },
        { new: true }
      );

      // Notify friends about online status
      currentUser.friends.forEach(friendId => {
        const friendSocketId = onlineUsers.get(friendId.toString());
        if (friendSocketId) {
          io.to(friendSocketId).emit('userStatus', {
            userId: socket.userId,
            status: 'online'
          });
        }
      });

      // Join user to their personal room
      socket.join(socket.userId);

      // Handle chat join events
      socket.on('joinChat', (chatId) => {
        socket.join(chatId);
      });

      // Handle chat leave events
      socket.on('leaveChat', (chatId) => {
        socket.leave(chatId);
      });

      // Handle new messages
      socket.on('sendMessage', async ({ chatId, content, messageType = 'text', fileUrl }) => {
        try {
          // Verify user is part of the chat
          const chat = await Chat.findOne({
            _id: chatId,
            participants: socket.userId
          });

          if (!chat) {
            return;
          }

          // Create and save the message
          const message = await Message.create({
            chat: chatId,
            sender: socket.userId,
            content,
            messageType,
            fileUrl,
            readBy: [socket.userId]
          });

          // Update chat's last message
          await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id
          });

          // Populate sender details and emit to the chat room
          const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username email profilePic');

          io.to(chatId).emit('newMessage', populatedMessage);

          // Send notifications to offline participants
          chat.participants.forEach(participantId => {
            if (participantId.toString() !== socket.userId) {
              const receiverSocket = getUserSocket(participantId);
              if (!receiverSocket) {
                // TODO: Handle offline notifications
                console.log(`User ${participantId} is offline, queuing notification`);
              }
            }
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing', (chatId) => {
        socket.to(chatId).emit('userTyping', { chatId, userId: socket.userId });
      });

      socket.on('stopTyping', (chatId) => {
        socket.to(chatId).emit('userStopTyping', { chatId, userId: socket.userId });
      });

      // Listen for friend request events
      socket.on('sendFriendRequest', async (receiverId) => {
        try {
          const request = new FriendRequest({
            sender: socket.userId,
            receiver: receiverId
          });
          await request.save();

          const sender = await User.findById(socket.userId)
            .select('username profilePic isOnline');

          // Notify the receiver
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('friendRequest', {
              _id: request._id,
              sender: {
                _id: sender._id,
                username: sender.username,
                profilePic: sender.profilePic,
                isOnline: sender.isOnline
              }
            });
          }
        } catch (error) {
          console.error('Error sending friend request:', error);
        }
      });

      // Handle friend request response
      socket.on('respondToFriendRequest', async ({ requestId, action }) => {
        try {
          const request = await FriendRequest.findById(requestId);
          if (!request) return;

          request.status = action;
          await request.save();

          if (action === 'accepted') {
            // Update both users' friends lists
            const [sender, receiver] = await Promise.all([
              User.findById(request.sender),
              User.findById(request.receiver)
            ]);

            sender.friends.addToSet(request.receiver);
            receiver.friends.addToSet(request.sender);
            await Promise.all([sender.save(), receiver.save()]);

            // Notify both users
            const senderSocketId = onlineUsers.get(request.sender.toString());
            const receiverSocketId = onlineUsers.get(request.receiver.toString());

            if (senderSocketId) {
              io.to(senderSocketId).emit('friendRequestAccepted', {
                user: {
                  _id: receiver._id,
                  username: receiver.username,
                  profilePic: receiver.profilePic,
                  isOnline: receiver.isOnline
                }
              });
            }

            if (receiverSocketId) {
              io.to(receiverSocketId).emit('friendRequestAccepted', {
                user: {
                  _id: sender._id,
                  username: sender.username,
                  profilePic: sender.profilePic,
                  isOnline: sender.isOnline
                }
              });
            }
          }
        } catch (error) {
          console.error('Error handling friend request response:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        try {
          const user = await User.findByIdAndUpdate(
            socket.userId,
            { isOnline: false, lastActive: new Date() },
            { new: true }
          );

          // Notify friends about offline status
          user.friends.forEach(friendId => {
            const friendSocketId = onlineUsers.get(friendId.toString());
            if (friendSocketId) {
              io.to(friendSocketId).emit('userStatus', {
                userId: socket.userId,
                status: 'offline'
              });
            }
          });

          onlineUsers.delete(socket.userId);
          console.log('User disconnected:', socket.userId);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

    } catch (error) {
      console.error('Error in socket connection:', error);
    }
  });

  return {
    getUserSocket,
    getOnlineUsers: () => onlineUsers,
    io
  };
};

module.exports = socketManager;
