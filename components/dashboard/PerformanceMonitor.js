'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Zap,
  Clock,
  MemoryStick,
  TrendingUp
} from 'lucide-react';
import { usePerformance } from '@/lib/hooks/usePerformance';

export default function PerformanceMonitor({ className = '' }) {
  const { 
    metrics, 
    getPerformanceScore, 
    getPerformanceRecommendations 
  } = usePerformance();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const score = getPerformanceScore();
  const recommendations = getPerformanceRecommendations();

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-accent-600 bg-accent-100 dark:bg-accent-900 dark:text-accent-400';
    if (score >= 70) return 'text-warning-600 bg-warning-100 dark:bg-warning-900 dark:text-warning-400';
    return 'text-danger-600 bg-danger-100 dark:bg-danger-900 dark:text-danger-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return CheckCircle;
    if (score >= 70) return AlertTriangle;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon(score);

  const formatMetric = (value, unit = 'ms') => {
    if (value === 0) return 'N/A';
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === 'MB') return `${value.toFixed(1)}MB`;
    return value.toFixed(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-surface-800 rounded-xl border border-surface-300 dark:border-surface-700 shadow-medium ${className}`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white">
                Performance Monitor
              </h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Core Web Vitals & Performance Metrics
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${getScoreColor(score)}`}>
              <ScoreIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{score}</span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp className="w-5 h-5 text-surface-500" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-surface-200 dark:border-surface-700">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
                  <Clock className="w-5 h-5 text-brand-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-surface-900 dark:text-white">
                    {formatMetric(metrics.largestContentfulPaint)}
                  </div>
                  <div className="text-xs text-surface-600 dark:text-surface-400">LCP</div>
                </div>
                
                <div className="text-center p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
                  <Zap className="w-5 h-5 text-accent-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-surface-900 dark:text-white">
                    {formatMetric(metrics.firstInputDelay)}
                  </div>
                  <div className="text-xs text-surface-600 dark:text-surface-400">FID</div>
                </div>
                
                <div className="text-center p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
                  <Activity className="w-5 h-5 text-warning-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-surface-900 dark:text-white">
                    {formatMetric(metrics.cumulativeLayoutShift, '')}
                  </div>
                  <div className="text-xs text-surface-600 dark:text-surface-400">CLS</div>
                </div>
                
                <div className="text-center p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
                  <MemoryStick className="w-5 h-5 text-danger-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-surface-900 dark:text-white">
                    {formatMetric(metrics.memoryUsage, 'MB')}
                  </div>
                  <div className="text-xs text-surface-600 dark:text-surface-400">Memory</div>
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-surface-900 dark:text-white mb-2">
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border-l-4 ${
                          rec.type === 'warning' 
                            ? 'bg-warning-50 dark:bg-warning-900/20 border-warning-400' 
                            : 'bg-brand-50 dark:bg-brand-900/20 border-brand-400'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {rec.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                          )}
                          <p className={`text-sm ${
                            rec.type === 'warning' 
                              ? 'text-warning-800 dark:text-warning-200' 
                              : 'text-brand-800 dark:text-brand-200'
                          }`}>
                            {rec.message}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Score Breakdown */}
              <div className="mt-4 p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
                <h4 className="font-medium text-surface-900 dark:text-white mb-2">
                  Performance Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600 dark:text-surface-400">Largest Contentful Paint</span>
                    <span className={`font-medium ${
                      metrics.largestContentfulPaint < 2500 ? 'text-accent-600' :
                      metrics.largestContentfulPaint < 4000 ? 'text-warning-600' : 'text-danger-600'
                    }`}>
                      {metrics.largestContentfulPaint < 2500 ? 'Good' :
                       metrics.largestContentfulPaint < 4000 ? 'Needs Improvement' : 'Poor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600 dark:text-surface-400">First Input Delay</span>
                    <span className={`font-medium ${
                      metrics.firstInputDelay < 100 ? 'text-accent-600' :
                      metrics.firstInputDelay < 300 ? 'text-warning-600' : 'text-danger-600'
                    }`}>
                      {metrics.firstInputDelay < 100 ? 'Good' :
                       metrics.firstInputDelay < 300 ? 'Needs Improvement' : 'Poor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600 dark:text-surface-400">Cumulative Layout Shift</span>
                    <span className={`font-medium ${
                      metrics.cumulativeLayoutShift < 0.1 ? 'text-accent-600' :
                      metrics.cumulativeLayoutShift < 0.25 ? 'text-warning-600' : 'text-danger-600'
                    }`}>
                      {metrics.cumulativeLayoutShift < 0.1 ? 'Good' :
                       metrics.cumulativeLayoutShift < 0.25 ? 'Needs Improvement' : 'Poor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
