'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Target
} from 'lucide-react';
import HealthChart from '@/components/analytics/HealthChart';
import TrendAnalysis from '@/components/analytics/TrendAnalysis';
import HealthInsights from '@/components/analytics/HealthInsights';
import HealthMetrics from '@/components/analytics/HealthMetrics';
import { healthAPI } from '@/lib/api/health';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch health metrics data
  const { data: healthMetrics, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-health', selectedPeriod],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.getMetrics(token, { period: selectedPeriod, limit: 30 });
    },
    staleTime: 30000,
    retry: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Process metrics into chart data
  const processChartData = (metrics) => {
    if (!metrics || metrics.length === 0) {
      return {
        heartRate: [],
        steps: [],
        sleep: []
      };
    }

    // Group by type
    const heartRate = metrics.filter(m => m.type === 'heart-rate');
    const steps = metrics.filter(m => m.type === 'steps');
    const sleep = metrics.filter(m => m.type === 'sleep');

    const formatChartData = (data) => {
      return data.slice(0, 7).map((item, index) => ({
        label: new Date(item.recordedAt || item.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
        value: parseFloat(item.value?.numeric || item.value || 0)
      }));
    };

    return {
      heartRate: formatChartData(heartRate),
      steps: formatChartData(steps),
      sleep: formatChartData(sleep)
    };
  };

  // Process trend data
  const processTrendData = (metrics) => {
    if (!metrics || metrics.length === 0) {
      return [];
    }

    // Group by type and calculate averages and trends
    const grouped = metrics.reduce((acc, m) => {
      if (!acc[m.type]) acc[m.type] = [];
      acc[m.type].push(m);
      return acc;
    }, {});

    const trends = Object.entries(grouped).map(([type, data]) => {
      const sorted = data.sort((a, b) => new Date(b.recordedAt || b.createdAt) - new Date(a.recordedAt || a.createdAt));
      const recent = sorted.slice(0, 7);
      const older = sorted.slice(7, 14);
      
      const recentAvg = recent.reduce((sum, m) => sum + parseFloat(m.value?.numeric || m.value || 0), 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + parseFloat(m.value?.numeric || m.value || 0), 0) / older.length : recentAvg;
      
      const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100).toFixed(0) : 0;
      const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

      const typeMapping = {
        'heart-rate': { name: 'Heart Rate', desc: 'Average resting heart rate', icon: 'heart', unit: ' BPM' },
        'steps': { name: 'Daily Steps', desc: 'Average steps per day', icon: 'activity', unit: '' },
        'sleep': { name: 'Sleep Quality', desc: 'Average sleep duration', icon: 'energy', unit: 'h' }
      };

      const mapping = typeMapping[type] || { name: type, desc: type, icon: 'heart', unit: '' };
      
      return {
        name: mapping.name,
        description: mapping.desc,
        value: `${recentAvg.toFixed(0)}${mapping.unit}`,
        trend,
        change: Math.abs(change),
        isPositive: trend === 'up' || trend === 'stable',
        type: mapping.icon
      };
    });

    return trends;
  };

  const chartData = processChartData(healthMetrics);
  const trendData = processTrendData(healthMetrics);

  return (
    <div className="space-y-6 bg-white dark:bg-surface-900">
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 border border-surface-200 animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </>
        ) : trendData.length > 0 ? (
          trendData.slice(0, 4).map((stat, index) => {
            const icons = {
              heart: Activity,
              activity: TrendingUp,
              energy: BarChart3,
              alert: Eye
            };
            const StatIcon = icons[stat.type] || Activity;
            const colors = {
              heart: 'text-red-500',
              activity: 'text-blue-500',
              energy: 'text-green-500',
              alert: 'text-purple-500'
            };
            const color = colors[stat.type] || 'text-blue-500';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
                    <StatIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change > 0 && stat.isPositive ? '+' : ''}{stat.change}%
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No analytics data available. Start tracking your health metrics to see insights.</p>
          </div>
        )}
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
            href: '/dashboard/goals'
          },
          {
            title: 'Schedule Checkup',
            description: 'Book your next health appointment',
            icon: Calendar,
            href: '/dashboard/appointments'
          },
          {
            title: 'Export Report',
            description: 'Download your health data',
            icon: Download,
            href: '/dashboard/export'
          }
        ].map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-gray-200 dark:border-surface-700 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <action.icon className="w-6 h-6 text-green-600" />
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
