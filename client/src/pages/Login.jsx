import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { animations, styles, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with email:', formData.email);
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.message || 'Login failed');
        setLoading(false);
        return;
      }
      
      // Login successful - navigation will be handled by the useEffect above
      console.log('Login successful, waiting for auth state update');
      
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animations.pageTransition}
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
        isDark 
          ? 'from-gray-900 via-slate-800 to-gray-900' 
          : 'from-blue-50 via-violet-50 to-pink-50'
      }`}
    >
      <div className="w-full max-w-md px-8 py-12 relative">
        {/* Background card with glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 ${styles.glassmorphism} rounded-2xl`}
        />

        <div className="relative space-y-8">
          {/* Logo and Brand */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
              className="flex justify-center"
            >
              <MessageCircle 
                className={`w-16 h-16 ${
                  isDark 
                    ? 'text-primary-400' 
                    : 'text-primary-600'
                }`}
              />
            </motion.div>
            <motion.h1
              variants={animations.fadeIn}
              className={`text-3xl font-bold ${styles.gradientText}`}
            >
              Welcome back
            </motion.h1>
            <motion.p
              variants={animations.fadeIn} 
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Please sign in to continue
            </motion.p>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg ${
                  isDark 
                    ? 'bg-red-900/50 text-red-200 border border-red-800' 
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={animations.slideIn}
              className="space-y-4"
            >
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  isDark 
                    ? 'text-gray-400 group-focus-within:text-primary-400' 
                    : 'text-gray-500 group-focus-within:text-primary-600'
                } transition-colors z-10`} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`${styles.input} pl-12`}
                  placeholder="Email address"
                  disabled={loading}
                />
              </div>

              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  isDark 
                    ? 'text-gray-400 group-focus-within:text-primary-400' 
                    : 'text-gray-500 group-focus-within:text-primary-600'
                } transition-colors z-10`} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`${styles.input} pl-12`}
                  placeholder="Password"
                  disabled={loading}
                />
              </div>
            </motion.div>

            <motion.div
              variants={animations.slideIn}
              className="space-y-4"
            >
              <button
                type="submit"
                disabled={loading}
                className={`${styles.button} group`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span>Sign in</span>
                  </div>
                )}
              </button>

              <p className={`text-center text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className={`font-medium ${
                    isDark 
                      ? 'text-primary-400 hover:text-primary-300' 
                      : 'text-primary-600 hover:text-primary-500'
                  }`}
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
