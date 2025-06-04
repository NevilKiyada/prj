import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  MessageCircle, 
  Sun, 
  Moon, 
  LogOut, 
  Settings, 
  User,
  Search,
  Bell,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, animations, theme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'dark bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50'
    } bg-noise`}>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isDark 
          ? 'border-dark-lighter/20 bg-dark-glass' 
          : 'border-light-darker/10 bg-light-glass'
      } border-b backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <MessageCircle className={`w-8 h-8 ${
                  isDark 
                    ? 'text-primary-400 hover:text-primary-300' 
                    : 'text-primary-600 hover:text-primary-500'
                } transition-colors`} />
              </motion.div>
              <motion.h1 
                {...animations.getAnimationConfig('listItem')}
                className={`text-xl font-bold ${
                  isDark 
                    ? 'bg-gradient-to-r from-primary-400 to-accent-400' 
                    : 'bg-gradient-to-r from-primary-600 to-accent-600'
                } bg-clip-text text-transparent`}
              >
                ChatVibe
              </motion.h1>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <input
                  type="search"
                  placeholder="Search messages or friends..."
                  className={`w-full pl-10 pr-4 py-2 rounded-full transition-all duration-200 ${
                    isDark
                      ? 'bg-dark-lighter/50 border-gray-700 focus:ring-primary-500/20 text-white placeholder-gray-400'
                      : 'bg-white/50 border-gray-200 focus:ring-primary-500/20 text-gray-900 placeholder-gray-500'
                  } border focus:ring-2 focus:outline-none`}
                />
              </div>
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-1 md:space-x-4">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full transition-colors relative ${
                  isDark 
                    ? 'text-gray-300 hover:bg-white/[0.05]' 
                    : 'text-gray-700 hover:bg-black/[0.05]'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  isDark 
                    ? 'text-yellow-300 hover:bg-white/[0.05]' 
                    : 'text-gray-700 hover:bg-black/[0.05]'
                }`}
              >
                {isDark ? 
                  <Sun className="w-5 h-5 animate-spin-slow" /> : 
                  <Moon className="w-5 h-5 animate-bounce-gentle" />
                }
              </motion.button>

              {/* User Profile */}
              <div className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 p-1.5 rounded-full cursor-pointer transition-all duration-200"
                >
                  <div className="relative">
                    <img
                      src={user?.profilePic || '/src/assets/default-avatar.png'}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/20"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <span className={`hidden md:block font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {user?.username}
                  </span>
                </motion.div>

                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-lg transition-all duration-200 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 ${
                  theme.getElevation(2)
                }`}>
                  <a href="#profile" className={`flex items-center px-4 py-2 space-x-2 transition-colors ${
                    isDark 
                      ? 'text-gray-300 hover:bg-white/[0.05]' 
                      : 'text-gray-700 hover:bg-black/[0.05]'
                  }`}>
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </a>
                  <a href="#settings" className={`flex items-center px-4 py-2 space-x-2 transition-colors ${
                    isDark 
                      ? 'text-gray-300 hover:bg-white/[0.05]' 
                      : 'text-gray-700 hover:bg-black/[0.05]'
                  }`}>
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center px-4 py-2 space-x-2 transition-colors ${
                      isDark 
                        ? 'text-red-400 hover:bg-red-400/10' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className={isDark ? 'text-white' : 'text-gray-900'} />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden fixed inset-x-0 top-16 z-40 ${theme.getGlassStyle(0.9)}`}
          >
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? 'bg-dark-lighter/50 border-gray-700 focus:ring-primary-500/20 text-white placeholder-gray-400'
                      : 'bg-white/50 border-gray-200 focus:ring-primary-500/20 text-gray-900 placeholder-gray-500'
                  } border focus:ring-2 focus:outline-none`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
