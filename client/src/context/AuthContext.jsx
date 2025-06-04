import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        console.log('Initializing auth with stored token:', !!storedToken);
        
        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          const response = await axios.get('/api/auth/me');
          
          console.log('User data retrieved:', response.data);
          
          if (response.data.user) {
            setUser(response.data.user);
          } else {
            throw new Error('No user data in response');
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Clear auth data if authentication fails
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting to login at:', axios.defaults.baseURL);      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      console.log('Login successful, user data:', userData);
      
      // Set auth state
      setToken(newToken);
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', userData._id); // Changed to _id which is MongoDB's standard id field
      
      // Update axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Better error handling with more detailed messages
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Cannot reach the server. Please check your connection or try again later.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during login'
      };
    }
  };
  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', userData._id); // Changed to _id which is MongoDB's standard id field
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Better error handling
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Cannot reach the server. Please check your connection or try again later.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during registration'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating profile'
      };
    }
  };  // For debugging
  console.log('AuthContext state - user:', !!user, 'token:', !!token);

  const isAuthenticated = Boolean(user && token);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    setUser,
    setToken,
    login,
    register,
    logout,
    updateProfile
  };
  
  // Add additional logging
  console.log('AuthContext value:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    isLoading: loading, 
    isAuthenticated: !!user && !!token 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
