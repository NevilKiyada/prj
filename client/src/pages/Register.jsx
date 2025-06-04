import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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
  const { animations } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const inputClasses = "appearance-none relative block w-full px-4 py-3 border bg-white/10 backdrop-blur-sm border-gray-300/50 placeholder-gray-400 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 ease-in-out sm:text-sm";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors";

  return (
    <motion.div 
      {...animations.pageTransition}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-accent-50 to-light-lighter dark:from-primary-950 dark:via-accent-900 dark:to-dark-deeper py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary-400/20 to-transparent dark:from-primary-600/20 animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent-400/20 to-transparent dark:from-accent-600/20 animate-pulse-slow" />
      </motion.div>

      <div className="max-w-md w-full space-y-8 relative">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="absolute inset-0 bg-glass-light dark:bg-glass-dark rounded-2xl shadow-glass -z-10"
        />
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <motion.h2 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-center text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent"
            >
              Create your account
            </motion.h2>
            <motion.p 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-center text-sm text-gray-600 dark:text-gray-300"
            >
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Sign in
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
                {...animations.listItemTransition}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <UserPlus className={iconClasses} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={inputClasses + " pl-10"}
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </motion.div>

              <motion.div
                {...animations.listItemTransition}
                transition={{ delay: 0.6 }}
                className="relative group"
              >
                <Mail className={iconClasses} />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className={inputClasses + " pl-10"}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </motion.div>

              <motion.div
                {...animations.listItemTransition}
                transition={{ delay: 0.7 }}
                className="relative group"
              >
                <Lock className={iconClasses} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={inputClasses + " pl-10"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </motion.div>

              <motion.div
                {...animations.listItemTransition}
                transition={{ delay: 0.8 }}
                className="relative group"
              >
                <Lock className={iconClasses} />
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className={inputClasses + " pl-10"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </motion.div>
            </div>

            <motion.div
              {...animations.cardTransition}
              transition={{ delay: 0.9 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
