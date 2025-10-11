'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function AnimatedCard({ 
  children, 
  className = '',
  hoverScale = 1.02,
  tapScale = 0.98,
  tiltIntensity = 15,
  glowIntensity = 0.5,
  onClick
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(mouseX, [-300, 300], [-tiltIntensity, tiltIntensity]);
  const scale = useTransform(mouseX, [-300, 300], [1, hoverScale]);

  const handleMouseMove = (event) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ 
        scale: hoverScale,
        boxShadow: isHovered ? `0 20px 40px rgba(0,0,0,${glowIntensity})` : undefined
      }}
      whileTap={{ scale: tapScale }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-300
        ${className}
      `}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        animate={{
          opacity: isHovered ? 0.1 : 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Card with reveal animation
export function RevealCard({ 
  children, 
  className = '',
  direction = 'up', // up, down, left, right
  delay = 0
}) {
  const directions = {
    up: { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -60 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 } }
  };

  return (
    <motion.div
      initial={directions[direction].initial}
      animate={directions[direction].animate}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered reveal for multiple cards
export function StaggeredReveal({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  direction = 'up'
}) {
  return (
    <div className={className}>
      {Array.isArray(children) ? children.map((child, index) => (
        <RevealCard
          key={index}
          direction={direction}
          delay={index * staggerDelay}
        >
          {child}
        </RevealCard>
      )) : (
        <RevealCard direction={direction}>
          {children}
        </RevealCard>
      )}
    </div>
  );
}

// Card with magnetic hover effect
export function MagneticCard({ 
  children, 
  className = '',
  strength = 0.3
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = (event.clientX - centerX) * strength;
    const distanceY = (event.clientY - centerY) * strength;
    
    setPosition({ x: distanceX, y: distanceY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
