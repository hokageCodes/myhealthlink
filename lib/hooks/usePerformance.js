'use client';

import { useState, useEffect, useCallback } from 'react';

export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    memoryUsage: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    setIsMonitoring(true);

    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({
            ...prev,
            largestContentfulPaint: lastEntry.startTime
          }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            setMetrics(prev => ({
              ...prev,
              firstInputDelay: entry.processingStart - entry.startTime
            }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          setMetrics(prev => ({
            ...prev,
            cumulativeLayoutShift: clsValue
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      };
      
      updateMemoryUsage();
      const memoryInterval = setInterval(updateMemoryUsage, 5000);
      
      return () => clearInterval(memoryInterval);
    }

    // Page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.fetchStart
        }));
      }
    });

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            setMetrics(prev => ({
              ...prev,
              firstContentfulPaint: fcpEntry.startTime
            }));
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const getPerformanceScore = useCallback(() => {
    const { largestContentfulPaint, firstInputDelay, cumulativeLayoutShift } = metrics;
    
    let score = 100;
    
    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s)
    if (largestContentfulPaint > 4000) score -= 30;
    else if (largestContentfulPaint > 2500) score -= 15;
    
    // FID scoring (Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms)
    if (firstInputDelay > 300) score -= 25;
    else if (firstInputDelay > 100) score -= 10;
    
    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (cumulativeLayoutShift > 0.25) score -= 25;
    else if (cumulativeLayoutShift > 0.1) score -= 10;
    
    return Math.max(0, score);
  }, [metrics]);

  const getPerformanceRecommendations = useCallback(() => {
    const recommendations = [];
    const { largestContentfulPaint, firstInputDelay, cumulativeLayoutShift, memoryUsage } = metrics;
    
    if (largestContentfulPaint > 2500) {
      recommendations.push({
        type: 'warning',
        message: 'Largest Contentful Paint is slow. Consider optimizing images and reducing server response time.'
      });
    }
    
    if (firstInputDelay > 100) {
      recommendations.push({
        type: 'warning',
        message: 'First Input Delay is high. Consider reducing JavaScript execution time.'
      });
    }
    
    if (cumulativeLayoutShift > 0.1) {
      recommendations.push({
        type: 'warning',
        message: 'Cumulative Layout Shift detected. Ensure images and ads have size attributes.'
      });
    }
    
    if (memoryUsage > 50) {
      recommendations.push({
        type: 'info',
        message: 'High memory usage detected. Consider implementing virtual scrolling for large lists.'
      });
    }
    
    return recommendations;
  }, [metrics]);

  useEffect(() => {
    startMonitoring();
    return stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceScore,
    getPerformanceRecommendations
  };
};

// Hook for monitoring component render performance
export const useRenderPerformance = (componentName) => {
  const [renderTime, setRenderTime] = useState(0);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setRenderTime(duration);
      setRenderCount(prev => prev + 1);
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && duration > 16) {
        console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  });

  return { renderTime, renderCount };
};

// Hook for lazy loading with intersection observer
export const useLazyLoad = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasLoaded, options.threshold, options.rootMargin]);

  return { ref, isInView, hasLoaded };
};
