'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/placeholder-avatar.png',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate blur data URL if not provided
  const generateBlurDataURL = (w, h) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    
    // Create a simple gradient blur
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    return canvas.toDataURL();
  };

  const finalBlurDataURL = blurDataURL || generateBlurDataURL(width || 100, height || 100);
  const finalSrc = hasError ? fallbackSrc : src;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-surface-200 dark:bg-surface-700 animate-pulse rounded"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Image
            src={finalSrc}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={finalBlurDataURL}
            onLoad={handleLoad}
            onError={handleError}
            className="transition-opacity duration-300"
            style={{
              opacity: isLoaded ? 1 : 0,
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// Avatar component with fallback
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = '',
  fallbackIcon = null,
  ...props
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      fallbackSrc="/placeholder-avatar.png"
      {...props}
    />
  );
}

// Lazy loaded image with intersection observer
export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView && (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          {...props}
        />
      )}
    </div>
  );
}

// Progressive image loading
export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  lowQualitySrc,
  className = '',
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    if (!lowQualitySrc) {
      setCurrentSrc(src);
      return;
    }

    // Load high quality image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsHighQualityLoaded(true);
    };
    img.src = src;
  }, [src, lowQualitySrc]);

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <OptimizedImage
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-all duration-500 ${
          isHighQualityLoaded ? 'blur-0' : 'blur-sm'
        }`}
        {...props}
      />
    </motion.div>
  );
}
