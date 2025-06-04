const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Exclude password by default in queries
  },
  profilePic: {
    type: String,
    default: 'https://cdn.example.com/default-avatar.png' // Replace with your default avatar URL
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Method to check if the user is friends with another user
userSchema.methods.isFriendsWith = function(userId) {
  return this.friends.includes(userId);
};

// Method to check if users are mutual followers
userSchema.methods.areMutualFollowers = function(userId) {
  return this.following.includes(userId) && this.followers.includes(userId);
};

module.exports = mongoose.model('User', userSchema);
