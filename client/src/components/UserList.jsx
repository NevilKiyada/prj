import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { Search, MessageSquare, UserCheck, Users } from 'lucide-react';

const UserList = ({ onUserSelect, selectedChat }) => {
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { socket } = useSocket();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchChats();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('userStatus', ({ userId, status }) => {
        setFriends(prevFriends =>
          prevFriends.map(friend =>
            friend._id === userId ? { ...friend, isOnline: status === 'online' } : friend
          )
        );
      });

      socket.on('newMessage', (message) => {
        updateLastMessage(message);
      });

      socket.on('friendRequestAccepted', ({ user }) => {
        setFriends(prev => [...prev, user]);
      });
    }

    return () => {
      if (socket) {
        socket.off('userStatus');
        socket.off('newMessage');
        socket.off('friendRequestAccepted');
      }
    };
  }, [socket]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const createOrOpenChat = async (friendId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/create',
        { participantId: friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const chatExists = chats.find(chat => chat._id === response.data._id);
      if (!chatExists) {
        setChats(prev => [...prev, response.data]);
      }
      
      onUserSelect(response.data);
    } catch (error) {
      console.error('Error creating/opening chat:', error);
    }
  };

  const updateLastMessage = (message) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat._id === message.chat ? { ...chat, lastMessage: message } : chat
      )
    );
  };

  const filteredFriends = searchQuery
    ? friends.filter(friend =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const UserCard = ({ user, chat }) => {
    const lastMessage = chat?.lastMessage;
    const hasUnread = chat?.unreadCount > 0;

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => createOrOpenChat(user._id)}
        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
          chat && selectedChat?._id === chat._id
            ? isDark
              ? 'bg-white/10'
              : 'bg-primary-default/10'
            : isDark
            ? 'hover:bg-white/5'
            : 'hover:bg-black/5'
        }`}
      >
        <div className="relative flex-shrink-0">          <img            
            src={user.profilePic || '/default-avatar.svg'}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-transparent transition-all duration-200"
            style={{
              ringColor: user.isOnline 
                ? '#10B981' 
                : isDark 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.1)'
            }}
          />
          {user.isOnline && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900"
            />
          )}
        </div>

        <div className="ml-3 flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <h3 className={`font-medium truncate ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {user.username}
            </h3>
            {lastMessage && (
              <span className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          
          {lastMessage ? (
            <p className={`text-sm truncate ${
              hasUnread
                ? isDark
                  ? 'text-white font-medium'
                  : 'text-gray-900 font-medium'
                : isDark
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}>
              {lastMessage.content}
            </p>
          ) : (
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {user.isOnline ? 'Online' : 'Tap to start chatting'}
            </p>
          )}
        </div>

        {hasUnread && (
          <div className={`ml-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
            isDark
              ? 'bg-primary-light text-dark-default'
              : 'bg-primary-default text-white'
          }`}>
            {chat.unreadCount}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary-light rounded-full border-t-transparent"
          />
        </div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
        >
          <AnimatePresence>
            {filteredFriends.length > 0 ? (
              filteredFriends.map(friend => {
                const existingChat = chats.find(chat =>
                  chat.participants.some(p => p._id === friend._id)
                );
                return (
                  <UserCard
                    key={friend._id}
                    user={friend}
                    chat={existingChat}
                  />
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    isDark ? 'bg-white/5' : 'bg-black/5'
                  }`}
                >
                  <Users className={`w-10 h-10 ${
                    isDark ? 'text-white/50' : 'text-gray-400'
                  }`} />
                </motion.div>
                <h3 className={`text-lg font-medium mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  No friends yet?
                </h3>
                <p className={`text-sm mb-6 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Add some friends to start chatting!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-full flex items-center space-x-2 ${
                    isDark
                      ? 'bg-white/10 text-white hover:bg-white/15'
                      : 'bg-primary-default/10 text-primary-dark hover:bg-primary-default/15'
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Find Friends</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default UserList;
