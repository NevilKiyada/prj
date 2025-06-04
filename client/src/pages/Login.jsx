import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { animations, styles } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <motion.div 
      {...animations.pageTransition}
      className={styles.page}
    >
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 relative">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`absolute inset-0 ${styles.glassmorphism} rounded-2xl -z-10`}
          />
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <motion.h2 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className={`text-center text-3xl font-bold ${styles.gradientText}`}
              >
                Welcome back
              </motion.h2>
              <motion.p 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-center text-sm text-gray-600 dark:text-gray-300"
              >
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Sign up
                </Link>
              </motion.p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 dark:bg-red-900/50 backdrop-blur-sm border border-red-400/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" 
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <motion.div
                  {...animations.slideIn}
                  transition={{ delay: 0.5 }}
                  className="relative group"
                >
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    className={`${styles.input} pl-10`}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </motion.div>

                <motion.div
                  {...animations.slideIn}
                  transition={{ delay: 0.6 }}
                  className="relative group"
                >
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className={`${styles.input} pl-10`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800 dark:text-gray-200">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <motion.div
                {...animations.slideIn}
                transition={{ delay: 0.7 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Sign in
                      <LogIn className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
