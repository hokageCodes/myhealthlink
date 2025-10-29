// Image utility functions for Next.js Image optimization

export const getImageDimensions = (containerSize) => {
  // Common container sizes and their corresponding image dimensions
  const sizeMap = {
    'w-8 h-8': { width: 32, height: 32 },
    'w-10 h-10': { width: 40, height: 40 },
    'w-12 h-12': { width: 48, height: 48 },
    'w-16 h-16': { width: 64, height: 64 },
    'w-20 h-20': { width: 80, height: 80 },
    'w-24 h-24': { width: 96, height: 96 },
    'w-32 h-32': { width: 128, height: 128 },
    'w-40 h-40': { width: 160, height: 160 },
    'w-48 h-48': { width: 192, height: 192 },
  };
  
  return sizeMap[containerSize] || { width: 100, height: 100 };
};

export const generateBlurDataURL = (width = 10, height = 10) => {
  // Generate a simple blur placeholder
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  
  // Create a simple gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

export const getImageProps = (src, alt, containerClass = '') => {
  const { width, height } = getImageDimensions(containerClass);
  
  return {
    src,
    alt,
    width,
    height,
    placeholder: 'blur',
    blurDataURL: generateBlurDataURL(width, height),
  };
};

// Common image configurations for different use cases
export const imageConfigs = {
  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
    xlarge: { width: 96, height: 96 },
  },
  thumbnail: {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 200, height: 200 },
  },
  cover: {
    small: { width: 300, height: 200 },
    medium: { width: 600, height: 400 },
    large: { width: 1200, height: 800 },
  },
};

export const getOptimizedImageProps = (type, size, src, alt) => {
  const config = imageConfigs[type]?.[size] || { width: 100, height: 100 };
  
  return {
    src,
    alt,
    ...config,
    placeholder: 'blur',
    blurDataURL: generateBlurDataURL(config.width, config.height),
  };
};
