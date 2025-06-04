import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, Loader2, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { animations, styles, isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      // Registration successful - redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
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
              Create Account
            </motion.h1>
            <motion.p
              variants={animations.fadeIn} 
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Join ChatVibe today
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={animations.slideIn}
              className="space-y-4"
            >
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  isDark 
                    ? 'text-gray-400 group-focus-within:text-primary-400' 
                    : 'text-gray-500 group-focus-within:text-primary-600'
                } transition-colors z-10`} />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={`${styles.input} pl-12`}
                  placeholder="Username"
                  disabled={loading}
                />
              </div>

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

              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  isDark 
                    ? 'text-gray-400 group-focus-within:text-primary-400' 
                    : 'text-gray-500 group-focus-within:text-primary-600'
                } transition-colors z-10`} />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`${styles.input} pl-12`}
                  placeholder="Confirm password"
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span>Create Account</span>
                  </div>
                )}
              </button>

              <p className={`text-center text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={`font-medium ${
                    isDark 
                      ? 'text-primary-400 hover:text-primary-300' 
                      : 'text-primary-600 hover:text-primary-500'
                  }`}
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
