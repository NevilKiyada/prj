const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

// Get user's friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'friends',
      select: 'username profilePic isOnline lastActive'
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.friends || []);
  } catch (error) {
    console.error('Error getting friends list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user.id,
      status: 'pending'
    }).populate('sender', 'username profilePic isOnline');
    res.json(requests);
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend suggestions (users who are not friends and have no pending requests)
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get IDs to exclude (current user, friends, and users with pending requests)
    const requests = await FriendRequest.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    });

    const excludeIds = new Set([
      req.user.id,
      ...currentUser.friends,
      ...requests.map(r => r.sender.toString()),
      ...requests.map(r => r.receiver.toString())
    ]);

    // Find users who are not in excludeIds
    const suggestions = await User.find({
      _id: { $nin: Array.from(excludeIds) }
    }).select('username profilePic isOnline lastActive').limit(10);

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (receiverId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Check if they are already friends
    const areFriends = receiver.friends.includes(req.user.id);
    if (areFriends) {
      return res.status(400).json({ message: 'Users are already friends' });
    }

    // Create and save the friend request
    const request = new FriendRequest({
      sender: req.user.id,
      receiver: receiverId
    });
    await request.save();

    // Get sender info for real-time notification
    const sender = await User.findById(req.user.id).select('username profilePic isOnline');

    // Notify the receiver via socket
    const receiverSocket = req.getUserSocket?.(receiverId);
    if (receiverSocket) {
      receiverSocket.emit('friendRequest', {
        _id: request._id,
        sender: sender
      });
    }

    res.json(request);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept/reject friend request
router.post('/request/:requestId/:action', auth, async (req, res) => {
  try {
    const { requestId, action } = req.params;
    
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();

      // Update both users' friends lists
      const [sender, receiver] = await Promise.all([
        User.findById(request.sender),
        User.findById(request.receiver)
      ]);

      sender.friends.addToSet(request.receiver);
      receiver.friends.addToSet(request.sender);

      await Promise.all([sender.save(), receiver.save()]);

      // Notify both users via sockets
      const senderSocket = req.getUserSocket?.(request.sender.toString());
      const receiverSocket = req.getUserSocket?.(request.receiver.toString());

      if (senderSocket) {
        senderSocket.emit('friendRequestAccepted', {
          user: {
            _id: receiver._id,
            username: receiver.username,
            profilePic: receiver.profilePic,
            isOnline: receiver.isOnline
          }
        });
      }

      if (receiverSocket) {
        receiverSocket.emit('friendRequestAccepted', {
          user: {
            _id: sender._id,
            username: sender.username,
            profilePic: sender.profilePic,
            isOnline: sender.isOnline
          }
        });
      }

      res.json({ message: 'Friend request accepted', request });
    } else if (action === 'reject') {
      request.status = 'rejected';
      await request.save();

      // Notify sender of rejection
      const senderSocket = req.getUserSocket?.(request.sender.toString());
      if (senderSocket) {
        senderSocket.emit('friendRequestRejected', { requestId });
      }

      res.json({ message: 'Friend request rejected', request });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error handling friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
