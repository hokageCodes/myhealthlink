'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedCounter({ 
  value, 
  duration = 1, 
  delay = 0,
  className = '',
  suffix = '',
  prefix = '',
  decimals = 0 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30,
    duration: duration * 1000
  });
  
  const display = useTransform(spring, (current) => {
    if (decimals === 0) {
      return Math.round(current);
    }
    return current.toFixed(decimals);
  });

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        spring.set(value);
      }, delay * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [value, spring, delay, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      onAnimationComplete={() => setIsVisible(true)}
      className={className}
    >
      {prefix}
      <motion.span>
        {display}
      </motion.span>
      {suffix}
    </motion.div>
  );
}

// Staggered counter animation for multiple values
export function StaggeredCounters({ items, className = '' }) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <AnimatedCounter
            value={item.value}
            duration={item.duration || 1}
            delay={item.delay || index * 0.1}
            suffix={item.suffix || ''}
            prefix={item.prefix || ''}
            decimals={item.decimals || 0}
            className={item.className || ''}
          />
        </motion.div>
      ))}
    </div>
  );
}
