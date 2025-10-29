'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import HealthChart from '@/components/analytics/HealthChart';
import TrendAnalysis from '@/components/analytics/TrendAnalysis';
import HealthInsights from '@/components/analytics/HealthInsights';
import HealthMetrics from '@/components/analytics/HealthMetrics';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  // Sample chart data
  const chartData = {
    heartRate: [
      { label: 'Mon', value: 72 },
      { label: 'Tue', value: 75 },
      { label: 'Wed', value: 70 },
      { label: 'Thu', value: 73 },
      { label: 'Fri', value: 68 },
      { label: 'Sat', value: 71 },
      { label: 'Sun', value: 74 }
    ],
    steps: [
      { label: 'Mon', value: 8500 },
      { label: 'Tue', value: 9200 },
      { label: 'Wed', value: 7800 },
      { label: 'Thu', value: 10500 },
      { label: 'Fri', value: 8800 },
      { label: 'Sat', value: 12000 },
      { label: 'Sun', value: 9500 }
    ],
    sleep: [
      { label: 'Mon', value: 7.5 },
      { label: 'Tue', value: 8.0 },
      { label: 'Wed', value: 7.0 },
      { label: 'Thu', value: 8.5 },
      { label: 'Fri', value: 7.8 },
      { label: 'Sat', value: 9.0 },
      { label: 'Sun', value: 8.2 }
    ]
  };

  // Sample trend data
  const trendData = [
    {
      name: 'Heart Rate',
      description: 'Average resting heart rate',
      value: '72 BPM',
      trend: 'stable',
      change: 0,
      isPositive: true,
      type: 'heart'
    },
    {
      name: 'Daily Steps',
      description: 'Average steps per day',
      value: '9,200',
      trend: 'up',
      change: 8,
      isPositive: true,
      type: 'activity'
    },
    {
      name: 'Sleep Quality',
      description: 'Average sleep duration',
      value: '7.8h',
      trend: 'up',
      change: 12,
      isPositive: true,
      type: 'energy'
    },
    {
      name: 'Hydration',
      description: 'Daily water intake',
      value: '1.8L',
      trend: 'down',
      change: 15,
      isPositive: false,
      type: 'alert'
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 bg-surface-50 dark:bg-surface-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Health Analytics
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Track your health trends and insights
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          {/* Metric Filter */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Metrics</option>
            <option value="heart">Heart Rate</option>
            <option value="steps">Steps</option>
            <option value="sleep">Sleep</option>
            <option value="hydration">Hydration</option>
          </select>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { title: 'Avg Heart Rate', value: '72 BPM', change: '+2%', icon: Activity, color: 'text-red-500' },
          { title: 'Daily Steps', value: '9,200', change: '+8%', icon: TrendingUp, color: 'text-blue-500' },
          { title: 'Sleep Score', value: '85%', change: '+12%', icon: BarChart3, color: 'text-green-500' },
          { title: 'Health Score', value: '78%', change: '+5%', icon: Eye, color: 'text-purple-500' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthChart
          data={chartData.heartRate}
          type="line"
          title="Heart Rate Trend"
          color="#ef4444"
          height={250}
        />
        <HealthChart
          data={chartData.steps}
          type="bar"
          title="Daily Steps"
          color="#3b82f6"
          height={250}
        />
      </div>

      {/* Sleep Chart */}
      <HealthChart
        data={chartData.sleep}
        type="line"
        title="Sleep Duration"
        color="#10b981"
        height={200}
      />

      {/* Metrics and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthMetrics />
        <HealthInsights />
      </div>

      {/* Trend Analysis */}
      <TrendAnalysis data={trendData} />

      {/* Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            title: 'Set Health Goals',
            description: 'Create personalized health targets',
            icon: Target,
            color: 'bg-blue-600',
            href: '/dashboard/goals'
          },
          {
            title: 'Schedule Checkup',
            description: 'Book your next health appointment',
            icon: Calendar,
            color: 'bg-green-600',
            href: '/dashboard/appointments'
          },
          {
            title: 'Export Report',
            description: 'Download your health data',
            icon: Download,
            color: 'bg-purple-600',
            href: '/dashboard/export'
          }
        ].map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-surface-200 dark:border-surface-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              {action.title}
            </h3>
            <p className="text-surface-600 dark:text-surface-400 text-sm">
              {action.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
