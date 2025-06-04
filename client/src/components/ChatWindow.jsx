import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { FiSend, FiImage, FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi';

const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { isDark } = useTheme();

  const otherUser = chat.participants.find(
    p => p._id !== localStorage.getItem('userId')
  );

  useEffect(() => {
    fetchMessages();
    if (socket) {
      socket.emit('joinChat', chat._id);
    }

    return () => {
      if (socket) {
        socket.emit('leaveChat', chat._id);
      }
    };
  }, [chat._id]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        if (message.chat === chat._id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      socket.on('userTyping', ({ chatId, userId }) => {
        if (chatId === chat._id && userId !== localStorage.getItem('userId')) {
          setTyping(true);
        }
      });

      socket.on('userStopTyping', ({ chatId, userId }) => {
        if (chatId === chat._id && userId !== localStorage.getItem('userId')) {
          setTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('userTyping');
        socket.off('userStopTyping');
      }
    };
  }, [socket, chat._id]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/${chat._id}/messages?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { messages: newMessages, pagination } = response.data;
      setMessages(prev => [...newMessages, ...prev]);
      setHasMore(page < pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('sendMessage', {
      chatId: chat._id,
      content: newMessage
    });

    setNewMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', chat._id);

    // Stop typing indicator after 2 seconds
    setTimeout(() => {
      socket.emit('stopTyping', chat._id);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="relative">
          <img
            src={otherUser.profilePic || 'https://via.placeholder.com/40'}
            alt={otherUser.username}
            className="w-10 h-10 rounded-full"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">
            {otherUser.username}
          </h3>
          <p className="text-sm text-gray-500">
            {otherUser.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full text-center text-blue-500 hover:text-blue-600"
          >
            Load more messages
          </button>
        )}

        {messages.map((message) => {
          const isOwnMessage = message.sender._id === localStorage.getItem('userId');
          return (
            <div
              key={message._id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        
        {typing && (
          <div className="text-gray-500 text-sm">
            {otherUser.username} is typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
