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
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isDark 
          ? 'border-dark-lighter/20 bg-dark-glass' 
          : 'border-light-darker/10 bg-light-glass'
      } border-b backdrop-blur-lg`}>
        <div className="max-w-8xl mx-auto px-4">
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
                className={`text-xl font-bold bg-gradient-to-r ${
                  isDark 
                    ? 'from-primary-400 to-accent-400 text-transparent bg-clip-text' 
                    : 'from-primary-600 to-accent-600 text-transparent bg-clip-text'
                } hidden sm:block`}
              >
                ChatVibe
              </motion.h1>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
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

            {/* Desktop User Controls */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${
                  isDark 
                    ? 'bg-dark-lighter/50 text-gray-300 hover:text-white' 
                    : 'bg-gray-100/50 text-gray-700 hover:text-gray-900'
                } transition-colors`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.button>
              
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${
                    isDark 
                      ? 'bg-dark-lighter/50 text-white hover:bg-dark-lighter' 
                      : 'bg-gray-100/50 text-gray-900 hover:bg-gray-200/50'
                  } transition-colors`}
                >
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.username || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </motion.button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-xl ${
                        isDark 
                          ? 'bg-dark-lighter/90 border-gray-700' 
                          : 'bg-white/90 border-gray-200'
                      } backdrop-blur-sm border shadow-lg overflow-hidden`}
                    >
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden fixed top-16 left-0 right-0 z-40 ${
              isDark ? 'bg-dark-glass' : 'bg-light-glass'
            } backdrop-blur-lg border-b ${
              isDark ? 'border-dark-lighter/20' : 'border-light-darker/10'
            }`}
          >
            <div className="px-4 py-3 space-y-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="search"
                  placeholder="Search..."
                  className={`w-full pl-10 pr-4 py-2 rounded-full ${
                    isDark
                      ? 'bg-dark-lighter/50 text-white placeholder-gray-400'
                      : 'bg-white/50 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                />
              </div>
              
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } hover:bg-white/10 transition-colors`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors`}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;