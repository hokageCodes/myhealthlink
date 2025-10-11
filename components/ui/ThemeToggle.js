'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = true }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
          Theme
        </span>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="relative p-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: isDark ? 180 : 0,
            scale: isDark ? 0.8 : 1
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 text-surface-600" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

// Alternative theme selector with all three options
export function ThemeSelector({ className = '' }) {
  const { theme, setLightTheme, setDarkTheme, isDark } = useTheme();

  return (
    <div className={`flex items-center space-x-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={setLightTheme}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light' 
            ? 'bg-white dark:bg-surface-700 shadow-sm' 
            : 'hover:bg-surface-200 dark:hover:bg-surface-700'
        }`}
        aria-label="Light mode"
      >
        <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-yellow-500' : 'text-surface-500'}`} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={setDarkTheme}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' 
            ? 'bg-white dark:bg-surface-700 shadow-sm' 
            : 'hover:bg-surface-200 dark:hover:bg-surface-700'
        }`}
        aria-label="Dark mode"
      >
        <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-surface-500'}`} />
      </motion.button>
    </div>
  );
}
