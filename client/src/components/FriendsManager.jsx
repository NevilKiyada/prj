import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { FiUserPlus, FiUserCheck, FiUserX, FiUser, FiSearch, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FriendsManager = ({ onChatStart }) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { socket } = useSocket();

  useEffect(() => {
    // Initial data load
    fetchUsers();
    fetchFriendRequests();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for incoming friend requests
      socket.on('friendRequest', (data) => {
        setPendingRequests(prev => [...prev, data]);
      });

      // Listen for accepted friend requests
      socket.on('friendRequestAccepted', (data) => {
        setFriends(prev => [...prev, data.user]);
        // Remove from pending if it was our request
        setPendingRequests(prev => 
          prev.filter(req => req.sender._id !== data.user._id)
        );
        // Remove from suggestions if present
        setUsers(prev =>
          prev.filter(user => user._id !== data.user._id)
        );
      });

      // Listen for rejected friend requests
      socket.on('friendRequestRejected', (data) => {
        setPendingRequests(prev => 
          prev.filter(req => req._id !== data.requestId)
        );
      });

      return () => {
        socket.off('friendRequest');
        socket.off('friendRequestAccepted');
        socket.off('friendRequestRejected');
      };
    }
  }, [socket]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
        // If search is cleared, fetch suggestions again
        fetchUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const searchUsers = async (query) => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/friends/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/friends/suggestions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/friends/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/friends/request', 
        { receiverId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove user from suggestions list
      setUsers(prev => prev.filter(user => user._id !== userId));
      // Also remove from search results if present
      setSearchResults(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/friends/request/${requestId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the request from pending immediately for better UX
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));
      
      if (action === 'accept') {
        // Refresh friends list to get the new friend
        fetchFriends();
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      // Refresh lists in case of error to ensure correct state
      fetchFriendRequests();
      fetchFriends();
    }
  };

  const createOrOpenChat = async (friendId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/chat',
        { userId: friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Call the parent component's handler to switch to chat view
      if (onChatStart) {
        onChatStart(response.data);
      }
    } catch (error) {
      console.error('Error creating/opening chat:', error);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const UserCard = ({ user, type }) => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`flex items-center justify-between p-4 mb-3 rounded-lg ${
        isDark ? 'bg-dark-lighter' : 'bg-white'
      } shadow-md hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={user.profilePic}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>
        <div>
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {user.username}
          </h3>
          {type === 'friend' && (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {user.isOnline ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        {type === 'suggestion' && (
          <button
            onClick={() => sendFriendRequest(user._id)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-primary-light text-primary-dark hover:bg-primary-dark hover:text-white transition-colors duration-200"
          >
            <FiUserPlus />
            <span>Follow</span>
          </button>
        )}
        {type === 'friend' && (
          <button
            onClick={() => createOrOpenChat(user._id)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            <FiMessageSquare />
            <span>Chat</span>
          </button>
        )}
        {type === 'request' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleRequest(user._id, 'accept')}
              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-200"
            >
              <FiUserCheck className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleRequest(user._id, 'reject')}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
            >
              <FiUserX className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const NoContent = ({ message }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}
    >
      <FiUser className="w-12 h-12 mb-4 opacity-50" />
      <p>{message}</p>
    </motion.div>
  );

  const TabButton = ({ name, current }) => (
    <button
      onClick={() => setActiveTab(name.toLowerCase())}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
        activeTab === name.toLowerCase()
          ? isDark
            ? 'bg-dark-lighter text-white'
            : 'bg-primary-light bg-opacity-10 text-primary-dark'
          : isDark
          ? 'text-gray-400 hover:text-white'
          : 'text-gray-600 hover:text-primary-dark'
      }`}
    >
      {name}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
      <div className="flex space-x-2 mb-6">
        {['Suggestions', 'Requests', 'Friends'].map(tab => (
          <TabButton key={tab} name={tab} current={activeTab === tab.toLowerCase()} />
        ))}
      </div>

      <div className="flex items-center mb-4">
        <FiSearch className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`ml-2 p-2 rounded-md border w-full ${isDark ? 'border-gray-700 bg-dark-lighter text-white placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`}
        />
      </div>

      {searchLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <UserCard key={user._id} user={user} type="suggestion" />
                    ))
                  ) : (
                    <NoContent message="No users found matching your search." />
                  )
                ) : users.length > 0 ? (
                  users.map(user => (
                    <UserCard key={user._id} user={user} type="suggestion" />
                  ))
                ) : (
                  <NoContent message="No suggestions available at the moment." />
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">                {pendingRequests.length > 0 ? (
                  pendingRequests.map(request => (
                    <UserCard 
                      key={request._id} 
                      user={{ ...request.sender, requestId: request._id }} 
                      type="request" 
                    />
                  ))
                ) : (
                  <NoContent message="No pending friend requests." />
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="space-y-4">
                {friends.length > 0 ? (
                  friends.map(friend => (
                    <UserCard key={friend._id} user={friend} type="friend" />
                  ))
                ) : (
                  <NoContent message="You haven't made any friends yet." />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FriendsManager;
