import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Debug output
  console.log('ProtectedRoute State:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    isLoading: loading,
    isAuthenticated,
    pathname: location.pathname
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
        <div className="p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected content
  return <Layout>{children}</Layout>;
};

// Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
        <div className="p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Routes component that uses the auth context
const AppRoutes = () => {
  console.log('AppRoutes rendering');
  const location = useLocation();
  console.log('Current location:', location);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Wrap routes with required providers
const AppWithProviders = () => {
  console.log('AppWithProviders rendering');
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="app-container min-h-screen bg-gradient-to-br from-violet-100 via-pink-100 to-yellow-100 dark:from-violet-950 dark:via-pink-950 dark:to-yellow-950">
          <AppRoutes />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
};

function App() {
  console.log('App component rendering');
  
  return (
    <Router>
      <ThemeProvider>
        <AppWithProviders />
      </ThemeProvider>
    </Router>
  );
}

export default App;
