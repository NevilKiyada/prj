const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const socketManager = require('./socketManager');

// Load environment variables from .env file
dotenv.config();

// MongoDB Connection Options
const mongooseOptions = {
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000, // Close connection if no ping received for 60 seconds
  pingInterval: 25000 // Send ping every 25 seconds
});

// Initialize socket manager and get utilities
const { getUserSocket, getOnlineUsers } = socketManager(io);

// Add socket utilities to app for use in routes
app.set('io', io);
app.set('getUserSocket', getUserSocket);
app.set('getOnlineUsers', getOnlineUsers);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true // Allow credentials
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app', mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  });

// MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('❗ MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Add io and socket utilities to req object
app.use((req, res, next) => {
  req.io = io;
  req.getUserSocket = getUserSocket;
  req.getOnlineUsers = getOnlineUsers;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/chat', require('./routes/chat'));

// Health check route
app.get('/', (req, res) => {
  res.send('Chat API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
