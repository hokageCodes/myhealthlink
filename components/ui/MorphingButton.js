'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';

export default function MorphingButton({ 
  children, 
  onClick, 
  className = '',
  loading = false,
  success = false,
  disabled = false,
  variant = 'primary' // primary, secondary, accent
}) {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: {
      initial: 'bg-brand-600 hover:bg-brand-700 text-white',
      pressed: 'bg-brand-700 text-white',
      success: 'bg-accent-600 text-white',
      loading: 'bg-brand-500 text-white cursor-not-allowed'
    },
    secondary: {
      initial: 'bg-surface-100 hover:bg-surface-200 text-surface-700 dark:bg-surface-700 dark:hover:bg-surface-600 dark:text-surface-300',
      pressed: 'bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300',
      success: 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300',
      loading: 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-500 cursor-not-allowed'
    },
    accent: {
      initial: 'bg-accent-600 hover:bg-accent-700 text-white',
      pressed: 'bg-accent-700 text-white',
      success: 'bg-brand-600 text-white',
      loading: 'bg-accent-500 text-white cursor-not-allowed'
    }
  };

  const getVariantClasses = () => {
    if (loading) return variants[variant].loading;
    if (success) return variants[variant].success;
    if (isPressed) return variants[variant].pressed;
    return variants[variant].initial;
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onTapStart={() => setIsPressed(true)}
      onTapEnd={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        disabled:cursor-not-allowed overflow-hidden
        ${getVariantClasses()}
        ${className}
      `}
    >
      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isPressed ? 1 : 0, 
          opacity: isPressed ? 1 : 0 
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : success ? (
          <>
            <Check className="w-4 h-4" />
            <span>Success!</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </div>

      {/* Progress bar for loading state */}
      {loading && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
}

// Floating action button with morphing
export function FloatingMorphButton({ 
  children, 
  onClick, 
  expanded = false,
  className = ''
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      animate={{ 
        width: expanded ? 'auto' : 56,
        borderRadius: expanded ? 28 : 28
      }}
      className={`
        fixed bottom-6 right-6 h-14 bg-brand-600 hover:bg-brand-700 
        text-white shadow-strong z-50 overflow-hidden
        flex items-center justify-center space-x-2
        ${className}
      `}
    >
      <motion.div
        animate={{ rotate: expanded ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
      
      {expanded && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          transition={{ delay: 0.1 }}
          className="whitespace-nowrap pr-4"
        >
          Quick Action
        </motion.span>
      )}
    </motion.button>
  );
}
