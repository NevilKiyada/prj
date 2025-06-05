import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend,
  FiImage,
  FiPaperclip,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiSmile
} from 'react-icons/fi';

const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const messageContainerRef = useRef(null);
  let typingTimeout;
  const { socket } = useSocket();
  const { isDark } = useTheme();

  const otherUser = chat.participants.find(
    p => p._id !== localStorage.getItem('userId')
  );

  useEffect(() => {
    if (chat._id) {
      fetchMessages();
      if (socket) {
        socket.emit('joinChat', chat._id);
      }
    }
    return () => {
      if (socket) {
        socket.emit('leaveChat', chat._id);
      }
    };
  }, [chat._id]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('userTyping', handleUserTyping);
      socket.on('userStopTyping', handleUserStopTyping);

      return () => {
        socket.off('newMessage');
        socket.off('userTyping');
        socket.off('userStopTyping');
      };
    }
  }, [socket]);

  const handleNewMessage = (message) => {
    if (message.chat === chat._id) {
      setMessages(prev => {
        const optimisticIndex = prev.findIndex(m => 
          m.isOptimistic && m.content === message.content && 
          m.sender._id === message.sender._id
        );

        if (optimisticIndex !== -1) {
          const newMessages = [...prev];
          newMessages[optimisticIndex] = message;
          return newMessages;
        }

        const messageExists = prev.some(m => m._id === message._id);
        if (!messageExists) {
          return [...prev, message];
        }
        return prev;
      });
      scrollToBottom();
    }
  };

  const handleUserTyping = ({ chatId, userId }) => {
    if (chatId === chat._id && userId !== localStorage.getItem('userId')) {
      setTyping(true);
    }
  };

  const handleUserStopTyping = ({ chatId, userId }) => {
    if (chatId === chat._id && userId !== localStorage.getItem('userId')) {
      setTyping(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/chat/${chat._id}/messages?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { messages: newMessages, pagination } = response.data;
      
      setMessages(prev => page === 1 ? newMessages : [...newMessages, ...prev]);
      setHasMore(page < pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    try {
      const messageData = {
        chatId: chat._id,
        content: newMessage.trim(),
        messageType: 'text'
      };

      const tempId = 'temp-' + Date.now();
      const optimisticMessage = {
        _id: tempId,
        chat: chat._id,
        content: newMessage.trim(),
        sender: {
          _id: localStorage.getItem('userId'),
          username: 'You',
        },
        createdAt: new Date().toISOString(),
        messageType: 'text',
        isOptimistic: true
      };

      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();
      setNewMessage('');

      socket.emit('sendMessage', messageData);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
    }
  };

  const handleTyping = (e) => {
    if (!socket) return;

    socket.emit('typing', chat._id);
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping', chat._id);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] bg-gradient-to-b from-transparent to-black/5">
      {/* Chat Header */}
      <div className={`flex-none px-4 py-3 ${
        isDark ? 'bg-gray-800/50' : 'bg-white/50'
      } backdrop-blur-sm border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={otherUser?.profilePic || '/default-avatar.svg'}
              alt={otherUser?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            {otherUser?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {otherUser?.username}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {otherUser?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messageContainerRef}
        className={`flex-1 overflow-y-auto scrollbar-thin ${
          isDark 
            ? 'scrollbar-thumb-gray-600 scrollbar-track-transparent' 
            : 'scrollbar-thumb-gray-300 scrollbar-track-transparent'
        } p-4 space-y-4`}
      >
        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={() => setPage(p => p + 1)}
            className={`w-full text-center py-2 text-sm font-medium ${
              isDark 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-700'
            } hover:underline transition-colors duration-200`}
          >
            Load previous messages
          </button>
        )}

        {/* Messages */}
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.sender._id === localStorage.getItem('userId');
            const showDate = index === 0 || 
              formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

            return (
              <React.Fragment key={message._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className={`px-4 py-1 rounded-full text-sm ${
                      isDark 
                        ? 'bg-gray-800/50 text-gray-400' 
                        : 'bg-gray-200/50 text-gray-600'
                    }`}>
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`group max-w-[70%] ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? isDark 
                          ? 'bg-blue-600/90 text-white' 
                          : 'bg-blue-500/90 text-white'
                        : isDark
                        ? 'bg-gray-800/90 text-white'
                        : 'bg-white/90 text-gray-900'
                    } backdrop-blur-sm shadow-sm`}>
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage
                          ? 'text-blue-100'
                          : isDark
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}>
                        {getMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Typing Indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`flex items-center space-x-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
              </div>
              <span className="text-sm">{otherUser?.username} is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`flex-none p-4 ${
        isDark ? 'bg-gray-800/50' : 'bg-white/50'
      } backdrop-blur-sm border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <button
            type="button"
            className={`p-2 rounded-full ${
              isDark 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiSmile className="w-6 h-6" />
          </button>
          
          <button
            type="button"
            className={`p-2 rounded-full ${
              isDark 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiPaperclip className="w-6 h-6" />
          </button>
          
          <input
            type="text"
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className={`flex-1 rounded-full px-4 py-2 ${
              isDark 
                ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-600/50' 
                : 'bg-gray-100/50 text-gray-900 placeholder-gray-500 focus:bg-gray-200/50'
            } focus:outline-none transition-colors duration-200`}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-colors duration-200 ${
              newMessage.trim()
                ? isDark
                  ? 'bg-blue-600/90 text-white hover:bg-blue-700/90'
                  : 'bg-blue-500/90 text-white hover:bg-blue-600/90'
                : isDark
                ? 'bg-gray-700/50 text-gray-400'
                : 'bg-gray-200/50 text-gray-400'
            }`}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;