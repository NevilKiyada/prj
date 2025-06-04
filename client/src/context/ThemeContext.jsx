import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    localStorage.theme === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  console.log('ThemeProvider initialized with isDark:', isDark);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  // Common animation variants
  const animations = {
    pageTransition: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    slideIn: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { duration: 0.3 }
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    }
  };

  // Common style classes
  const styles = {
    glassmorphism: 'bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg',
    input: 'appearance-none relative block w-full px-4 py-3 border bg-white/10 backdrop-blur-sm border-gray-300/50 placeholder-gray-400 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 ease-in-out sm:text-sm',
    button: 'group relative w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 ease-in-out',
    gradientText: 'bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent',
    page: 'min-h-screen bg-gradient-to-br from-light-lighter via-primary-50 to-accent-50 dark:from-dark-deepest dark:via-primary-950 dark:to-accent-950',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
  };
  // Add theme utility methods
  const theme = {
    getElevation: (level = 1) => {
      return isDark 
        ? `bg-dark-lighter/90 backdrop-blur-lg border border-white/10 shadow-xl` 
        : `bg-white/90 backdrop-blur-lg border border-gray-200 shadow-lg`;
    },
    getGlassStyle: (opacity = 0.7) => {
      return isDark 
        ? `bg-dark-lighter/80 backdrop-blur-md border-white/10` 
        : `bg-white/80 backdrop-blur-md border-gray-200/50`;
    }
  };
  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, animations, styles, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
