'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity,
  Heart,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const TrendAnalysis = ({ data, type = 'health' }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend, isPositive = true) => {
    if (trend === 'up') {
      return isPositive ? 'text-green-600' : 'text-red-600';
    } else if (trend === 'down') {
      return isPositive ? 'text-red-600' : 'text-green-600';
    }
    return 'text-gray-600';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-5 h-5" />;
      case 'activity':
        return <Activity className="w-5 h-5" />;
      case 'energy':
        return <Zap className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'heart':
        return 'text-red-500 bg-red-50';
      case 'activity':
        return 'text-blue-500 bg-blue-50';
      case 'energy':
        return 'text-yellow-500 bg-yellow-50';
      case 'alert':
        return 'text-orange-500 bg-orange-50';
      default:
        return 'text-green-500 bg-green-50';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-surface-200">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Trend Analysis</h3>
        <div className="text-center py-8 text-surface-500">
          <Activity className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="text-sm">No trend data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border border-surface-200"
    >
      <h3 className="text-lg font-semibold text-surface-900 mb-4">Trend Analysis</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg border border-surface-100 hover:bg-surface-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>
              <div>
                <h4 className="font-medium text-surface-900">{item.name}</h4>
                <p className="text-sm text-surface-600">{item.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className={`font-semibold ${getTrendColor(item.trend, item.isPositive)}`}>
                  {item.value}
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(item.trend)}
                  <span className={`text-sm ${getTrendColor(item.trend, item.isPositive)}`}>
                    {item.change}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall Health Score */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-surface-900">Overall Health Score</h4>
            <p className="text-sm text-surface-600">Based on your recent trends</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+5% this week</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendAnalysis;
