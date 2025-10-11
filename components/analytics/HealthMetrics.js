'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Zap, 
  Moon,
  Droplets,
  Scale,
  Thermometer,
  Gauge
} from 'lucide-react';

const HealthMetrics = ({ metrics = [] }) => {
  const getMetricIcon = (type) => {
    switch (type) {
      case 'heart_rate':
        return <Heart className="w-5 h-5" />;
      case 'steps':
        return <Activity className="w-5 h-5" />;
      case 'calories':
        return <Zap className="w-5 h-5" />;
      case 'sleep':
        return <Moon className="w-5 h-5" />;
      case 'hydration':
        return <Droplets className="w-5 h-5" />;
      case 'weight':
        return <Scale className="w-5 h-5" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5" />;
      default:
        return <Gauge className="w-5 h-5" />;
    }
  };

  const getMetricColor = (type, value, target) => {
    const percentage = target ? (value / target) * 100 : 0;
    
    if (percentage >= 100) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (type, value, target) => {
    const percentage = target ? (value / target) * 100 : 0;
    
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatValue = (value, unit) => {
    if (unit === 'bpm') return `${value} BPM`;
    if (unit === 'steps') return `${value.toLocaleString()} steps`;
    if (unit === 'cal') return `${value} cal`;
    if (unit === 'hours') return `${value}h`;
    if (unit === 'ml') return `${value}ml`;
    if (unit === 'kg') return `${value}kg`;
    if (unit === '°C') return `${value}°C`;
    return value;
  };

  // Default metrics if none provided
  const defaultMetrics = [
    {
      id: 1,
      type: 'heart_rate',
      name: 'Heart Rate',
      value: 72,
      target: 80,
      unit: 'bpm',
      trend: 'stable',
      lastUpdated: '2 minutes ago'
    },
    {
      id: 2,
      type: 'steps',
      name: 'Daily Steps',
      value: 8500,
      target: 10000,
      unit: 'steps',
      trend: 'up',
      lastUpdated: '5 minutes ago'
    },
    {
      id: 3,
      type: 'calories',
      name: 'Calories Burned',
      value: 450,
      target: 500,
      unit: 'cal',
      trend: 'up',
      lastUpdated: '1 hour ago'
    },
    {
      id: 4,
      type: 'sleep',
      name: 'Sleep Duration',
      value: 7.5,
      target: 8,
      unit: 'hours',
      trend: 'stable',
      lastUpdated: '6 hours ago'
    },
    {
      id: 5,
      type: 'hydration',
      name: 'Water Intake',
      value: 1800,
      target: 2500,
      unit: 'ml',
      trend: 'down',
      lastUpdated: '30 minutes ago'
    },
    {
      id: 6,
      type: 'weight',
      name: 'Weight',
      value: 70.5,
      target: 70,
      unit: 'kg',
      trend: 'stable',
      lastUpdated: '1 day ago'
    }
  ];

  const metricsToShow = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border border-surface-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-900">Health Metrics</h3>
        <div className="text-sm text-surface-600">
          Last updated: {metricsToShow[0]?.lastUpdated || 'Recently'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricsToShow.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-surface-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMetricColor(metric.type, metric.value, metric.target)}`}>
                  {getMetricIcon(metric.type)}
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">{metric.name}</h4>
                  <p className="text-sm text-surface-600">{formatValue(metric.value, metric.unit)}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                </div>
                {metric.target && (
                  <div className="text-xs text-surface-500">
                    Goal: {formatValue(metric.target, metric.unit)}
                  </div>
                )}
              </div>
            </div>

            {metric.target && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Progress</span>
                  <span className="font-medium">
                    {Math.round((metric.value / metric.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-surface-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%` 
                    }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-2 rounded-full ${getProgressColor(metric.type, metric.value, metric.target)}`}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Metric
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 text-sm font-medium border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
        >
          Set Goals
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 text-sm font-medium border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
        >
          View History
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HealthMetrics;
