import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Save, User, Bell, Lock, Mail } from 'lucide-react';

const Settings = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    notifications: true,
    darkMode: isDark,
  });
  
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setSaving(false);
    }, 1000);
    
    // In a real app, you would save to backend here
    console.log('Settings saved:', form);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Profile Section */}
          <div>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <User className="inline-block mr-2 h-5 w-5" />
              Profile Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="username" 
                  className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={form.username}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm
                    ${isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>
              <div>
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Email
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm
                        ${isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Bell className="inline-block mr-2 h-5 w-5" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="notifications"
                  name="notifications"
                  type="checkbox"
                  checked={form.notifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enable push notifications
                </label>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Lock className="inline-block mr-2 h-5 w-5" />
              Security
            </h3>
            <div className="space-y-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm
                  ${isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;