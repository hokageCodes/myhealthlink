'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Target, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Star,
  Zap
} from 'lucide-react';

const HealthInsights = ({ insights = [] }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'goal':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'recommendation':
        return <Star className="w-5 h-5 text-indigo-500" />;
      default:
        return <Zap className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'tip':
        return 'border-yellow-200 bg-yellow-50';
      case 'goal':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-red-200 bg-red-50';
      case 'achievement':
        return 'border-green-200 bg-green-50';
      case 'trend':
        return 'border-purple-200 bg-purple-50';
      case 'reminder':
        return 'border-orange-200 bg-orange-50';
      case 'recommendation':
        return 'border-indigo-200 bg-indigo-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  // Default insights if none provided
  const defaultInsights = [
    {
      id: 1,
      type: 'achievement',
      title: 'Great Progress!',
      description: 'You\'ve maintained your exercise routine for 7 consecutive days.',
      priority: 'high',
      timestamp: '2 hours ago',
      actionable: true,
      actionText: 'Keep it up!'
    },
    {
      id: 2,
      type: 'tip',
      title: 'Hydration Tip',
      description: 'You\'re drinking 20% less water than recommended. Try setting hourly reminders.',
      priority: 'medium',
      timestamp: '1 day ago',
      actionable: true,
      actionText: 'Set Reminder'
    },
    {
      id: 3,
      type: 'trend',
      title: 'Sleep Quality Improving',
      description: 'Your sleep quality has improved by 15% over the past week.',
      priority: 'low',
      timestamp: '3 days ago',
      actionable: false
    },
    {
      id: 4,
      type: 'recommendation',
      title: 'New Goal Suggestion',
      description: 'Based on your activity level, consider adding 30 minutes of cardio.',
      priority: 'medium',
      timestamp: '5 days ago',
      actionable: true,
      actionText: 'Add Goal'
    }
  ];

  const insightsToShow = insights.length > 0 ? insights : defaultInsights;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border border-surface-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-900">Health Insights</h3>
        <div className="flex items-center space-x-2 text-sm text-surface-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>AI-Powered</span>
        </div>
      </div>

      <div className="space-y-4">
        {insightsToShow.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getInsightIcon(insight.type)}
                <h4 className="font-medium text-surface-900">{insight.title}</h4>
                {getPriorityBadge(insight.priority)}
              </div>
              <span className="text-xs text-surface-500">{insight.timestamp}</span>
            </div>
            
            <p className="text-sm text-surface-700 mb-3">{insight.description}</p>
            
            {insight.actionable && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-1 text-xs font-medium bg-white border border-surface-300 rounded-md hover:bg-surface-50 transition-colors"
              >
                {insight.actionText}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Insight Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-surface-900">Weekly Summary</h4>
            <p className="text-sm text-surface-600">
              You've received {insightsToShow.length} insights this week. Keep up the great work!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthInsights;
