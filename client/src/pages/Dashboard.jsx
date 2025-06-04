import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ChatBubbleLeftEllipsisIcon,
  UsersIcon,
  Cog8ToothIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  HomeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import FriendsManager from '../components/FriendsManager';
import Settings from '../components/Settings';

const Dashboard = () => {
  console.log('Dashboard component rendering - start');
  
  // Set up state with defaults to prevent rendering errors
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Get auth and theme context
  const auth = useAuth();
  const theme = useTheme();
  
  // Destructure safely with fallbacks
  const user = auth?.user || {};
  const logout = auth?.logout || (() => console.log('Logout not available'));
  const token = auth?.token;
  const isDark = theme?.isDark || false;
  const toggleTheme = theme?.toggleTheme || (() => console.log('Theme toggle not available'));
  const styles = theme?.styles || {};

  console.log('Dashboard auth state:', {
    userExists: !!user, 
    tokenExists: !!token,
    isDark: isDark
  });
  
  // Debug effect to check if the component is receiving user data
  useEffect(() => {
    console.log('Dashboard rendered with user:', user);
    console.log('User token available:', !!token);
  }, [user, token]);

  const handleUserSelect = (chat) => {
    setSelectedChat(chat);
    if (window.innerWidth < 768) {
      setActiveTab('chats');
    }
  };

  const handleChatStart = (chat) => {
    setSelectedChat(chat);
    setActiveTab('chats');
  };

  const NavLink = ({ icon: Icon, label, tab }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveTab(tab)}
      className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 ${        activeTab === tab
          ? isDark
            ? 'bg-white/10 text-white'
            : 'bg-primary-100/50 text-primary-600'
          : isDark
          ? 'text-gray-400 hover:bg-white/5 hover:text-white'
          : 'text-gray-600 hover:bg-black/5 hover:text-primary-600'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="ml-3 font-medium">{label}</span>
    </motion.button>
  );  console.log('Rendering Dashboard layout');
  
  // Add a fallback if required data is missing
  if (!user || typeof isDark === 'undefined') {
    console.log('Rendering Dashboard fallback - missing critical data');
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-black/5">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Loading Dashboard...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen w-full ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50'
    }`}>
      <div className="h-full max-w-8xl mx-auto px-4 py-6">
        <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-7 lg:grid-cols-10 gap-6">
          {/* Left Sidebar - Profile & Navigation */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`hidden md:flex md:col-span-2 flex-col rounded-2xl ${
              isDark
                ? 'bg-dark-lighter/30'
                : 'bg-white/70'
            } backdrop-blur-lg border ${
              isDark ? 'border-white/5' : 'border-black/5'
            } shadow-xl`}
          >
            {/* Profile Section */}
            <div className="p-6 text-center border-b border-gray-200/10">              <div className="relative inline-block">
                <img
                  src={user?.profilePic || '/default-avatar.svg'}
                  alt={user?.username || 'User'}
                  className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-primary-500/20"
                />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-4 border-white dark:border-gray-900" />
              </div>
              <h2 className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.username || 'Welcome!'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Online
              </p>
            </div>            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
              <NavLink icon={HomeIcon} label="Dashboard" tab="dashboard" />
              <NavLink icon={ChatBubbleLeftEllipsisIcon} label="Messages" tab="chats" />
              <NavLink icon={UsersIcon} label="Friends" tab="friends" />
              <NavLink icon={ChartBarIcon} label="Statistics" tab="stats" />
              <NavLink icon={Cog8ToothIcon} label="Settings" tab="settings" />
            </nav>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-gray-200/10 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleTheme}
                className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'text-yellow-300 hover:bg-white/5'
                    : 'text-gray-600 hover:bg-black/5'
                }`}
              >
                {isDark ? (
                  <><SunIcon className="w-6 h-6" /><span className="ml-3">Light Mode</span></>
                ) : (
                  <><MoonIcon className="w-6 h-6" /><span className="ml-3">Dark Mode</span></>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'text-red-400 hover:bg-red-400/10'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
                <span className="ml-3">Logout</span>
              </motion.button>
            </div>
          </motion.aside>

          {/* Center Panel - Dynamic Content */}
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`md:col-span-3 lg:col-span-5 rounded-2xl ${
              isDark
                ? 'bg-dark-lighter/30'
                : 'bg-white/70'
            } backdrop-blur-lg border ${
              isDark ? 'border-white/5' : 'border-black/5'
            } shadow-xl overflow-hidden`}
          >            <AnimatePresence mode="wait">              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full p-6"
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-white/5' : 'bg-primary-100/50'
                      }`}
                    >
                      <HomeIcon className={`w-12 h-12 ${
                        isDark ? 'text-white/50' : 'text-primary-500/50'
                      }`} />
                    </motion.div>
                    <h2 className={`text-2xl font-bold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Welcome back, {user?.username}!
                    </h2>
                    <p className={`text-lg mb-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Ready to connect with your friends?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('chats')}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          isDark
                            ? 'bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30'
                            : 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <ChatBubbleLeftEllipsisIcon className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm font-medium">Start Chatting</div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('friends')}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          isDark
                            ? 'bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30'
                            : 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <UsersIcon className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm font-medium">Manage Friends</div>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'chats' && (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full flex"
                >
                  {/* User List Panel */}
                  <div className={`w-80 border-r ${
                    isDark ? 'border-gray-700/50' : 'border-gray-200/50'
                  }`}>
                    <div className="p-4 border-b border-gray-200/10">
                      <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Messages
                      </h2>
                    </div>
                    <UserList onUserSelect={handleUserSelect} selectedChat={selectedChat} />
                  </div>

                  {/* Chat Panel */}
                  <div className="flex-1">
                    {selectedChat ? (
                      <ChatWindow chat={selectedChat} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                          className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center ${
                            isDark ? 'bg-white/5' : 'bg-primary-100/50'
                          }`}
                        >
                          <ChatBubbleLeftEllipsisIcon className={`w-12 h-12 ${
                            isDark ? 'text-white/50' : 'text-primary-500/50'
                          }`} />
                        </motion.div>
                        <h2 className={`text-xl font-semibold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          No Chat Selected
                        </h2>
                        <p className={`mb-6 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Select a friend from the list to start chatting
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <div className="p-4 border-b border-gray-200/10">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Friends
                    </h2>
                  </div>
                  <div className="h-[calc(100%-4rem)] overflow-hidden">
                    <FriendsManager onChatStart={handleChatStart} />
                  </div>
                </motion.div>
              )}              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full p-6"
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-white/5' : 'bg-primary-100/50'
                      }`}
                    >
                      <ChartBarIcon className={`w-12 h-12 ${
                        isDark ? 'text-white/50' : 'text-primary-500/50'
                      }`} />
                    </motion.div>
                    <h2 className={`text-xl font-semibold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Statistics Coming Soon
                    </h2>
                    <p className={`mb-6 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Analytics and statistics will be available in a future update
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <div className="p-4 border-b border-gray-200/10">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Settings
                    </h2>
                  </div>
                  <div className="h-[calc(100%-4rem)] overflow-hidden">
                    <Settings />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>

          {/* Right Panel - Additional Info (Hidden on smaller screens) */}
          <AnimatePresence>
            {showRightPanel && (
              <motion.aside
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className={`hidden lg:flex lg:col-span-2 flex-col rounded-2xl ${
                  isDark
                    ? 'bg-dark-lighter/30'
                    : 'bg-white/70'
                } backdrop-blur-lg border ${
                  isDark ? 'border-white/5' : 'border-black/5'
                } shadow-xl`}
              >
                <div className="p-6">                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activeTab === 'chats' && selectedChat ? 'Chat Info' :
                     activeTab === 'dashboard' ? 'Quick Stats' : 
                     activeTab === 'friends' ? 'Friend Requests' :
                     activeTab === 'stats' ? 'Live Stats' :
                     'Quick Actions'}
                  </h3>
                    {activeTab === 'chats' && selectedChat ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <img
                          src={selectedChat.participants?.find(p => p._id !== localStorage.getItem('userId'))?.profilePic || '/default-avatar.svg'}
                          alt="User"
                          className="w-16 h-16 rounded-full mx-auto mb-2"
                        />
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedChat.participants?.find(p => p._id !== localStorage.getItem('userId'))?.username}
                        </h4>
                      </div>
                    </div>
                  ) : activeTab === 'dashboard' ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        isDark ? 'bg-blue-600/20' : 'bg-blue-100'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          isDark ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          Welcome Back!
                        </h4>
                        <p className={`text-sm ${
                          isDark ? 'text-blue-200' : 'text-blue-700'
                        }`}>
                          You have new messages and friend requests waiting.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab('chats')}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            isDark
                              ? 'bg-white/5 hover:bg-white/10 text-white'
                              : 'bg-black/5 hover:bg-black/10 text-gray-900'
                          }`}
                        >
                          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 inline mr-2" />
                          Start Chatting
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab('friends')}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            isDark
                              ? 'bg-white/5 hover:bg-white/10 text-white'
                              : 'bg-black/5 hover:bg-black/10 text-gray-900'
                          }`}
                        >
                          <UsersIcon className="w-5 h-5 inline mr-2" />
                          Find Friends
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-white'
                            : 'bg-black/5 hover:bg-black/10 text-gray-900'
                        }`}
                      >
                        <HomeIcon className="w-5 h-5 inline mr-2" />
                        Dashboard
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('friends')}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-white'
                            : 'bg-black/5 hover:bg-black/10 text-gray-900'
                        }`}
                      >
                        <UsersIcon className="w-5 h-5 inline mr-2" />
                        Manage Friends
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('settings')}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-white'
                            : 'bg-black/5 hover:bg-black/10 text-gray-900'
                        }`}
                      >
                        <Cog8ToothIcon className="w-5 h-5 inline mr-2" />
                        Settings
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Toggle Right Panel Button */}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={`hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-all duration-300 ${
              isDark
                ? 'bg-dark-lighter/80 text-white hover:bg-dark-lighter'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            } backdrop-blur-sm`}
          >
            {showRightPanel ? (
              <ChevronDoubleRightIcon className="w-5 h-5" />
            ) : (
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Navigation */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 flex items-center justify-around p-2 rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-dark-lighter/30 border border-black/5 dark:border-white/5 shadow-xl">
            <NavLink icon={ChatBubbleLeftEllipsisIcon} tab="chats" label="" />
            <NavLink icon={UsersIcon} tab="friends" label="" />
            <NavLink icon={Cog8ToothIcon} tab="settings" label="" />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
