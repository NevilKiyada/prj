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
  const { isDark, toggleTheme, animations, theme, styles } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  React.useEffect(() => {
    console.log('Layout rendered with user:', user);
    
    if (!user) {
      console.log('No user data in Layout, will redirect to login');
      navigate('/login');
    } else {
      console.log('User is present in Layout:', user);
    }
  }, [user, navigate]);

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
                {...animations.slideIn}
                className={`text-xl font-bold ${styles.gradientText}`}
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
              {/* Theme Toggle */}
              <motion.button
                {...animations.fadeIn}
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${styles.glassmorphism} hover:bg-white/20 transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>
              
              {/* User Menu */}
              <div className="relative">
                <motion.button
                  {...animations.fadeIn}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${styles.glassmorphism} hover:bg-white/20 transition-colors`}
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
                      className={`absolute right-0 mt-2 w-48 rounded-xl ${styles.glassmorphism} shadow-xl overflow-hidden`}
                    >
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-white/10 transition-colors"
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

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
