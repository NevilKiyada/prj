const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true,
    // Required only if isGroup is true
    required: function() {
      return this.isGroup;
    }
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Required only if isGroup is true
    required: function() {
      return this.isGroup;
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
