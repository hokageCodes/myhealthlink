'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Heart, 
  FileText, 
  Calendar,
  BarChart3,
  Bell,
  User,
  Plus,
  Share,
  QrCode,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { documentsAPI } from '@/lib/api/documents';
import { healthAPI } from '@/lib/api/health';

// Utility functions
const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getHealthScore = (metrics) => {
  if (!metrics || metrics.length === 0) return 75;
  
  // Simple health score calculation based on recent metrics
  let score = 100;
  const recentMetrics = metrics.slice(0, 5);
  
  recentMetrics.forEach(metric => {
    // Adjust score based on metric type and value
    if (metric.type === 'blood-pressure') {
      if (metric.systolic > 140 || metric.diastolic > 90) score -= 10;
      else if (metric.systolic > 130 || metric.diastolic > 85) score -= 5;
    } else if (metric.type === 'weight') {
      // This would need more sophisticated logic in a real app
      score -= 2;
    }
  });
  
  return Math.max(0, Math.min(100, score));
};

const StatCard = ({ title, value, change, icon: Icon, color, href, loading }) => (
  <Link href={href || '#'} className="group">
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl p-4 shadow-medium border border-surface-300 hover:shadow-strong hover:border-surface-400 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {loading ? (
          <div className="animate-pulse bg-surface-200 h-4 w-12 rounded"></div>
        ) : change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${
            change > 0 ? 'text-accent-600' : change < 0 ? 'text-danger-600' : 'text-surface-500'
          }`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : 
             change < 0 ? <TrendingDown className="w-4 h-4" /> : null}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-xl font-bold text-surface-900 mb-1">
          {loading ? <div className="animate-pulse bg-surface-200 h-6 w-12 rounded"></div> : value}
        </div>
        <p className="text-sm text-surface-600">{title}</p>
      </div>
    </motion.div>
  </Link>
);

const MetricCard = ({ metric, loading }) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg p-4 border border-surface-300 shadow-soft"
      >
        <div className="animate-pulse space-y-3">
          <div className="bg-surface-200 h-4 w-20 rounded"></div>
          <div className="bg-surface-200 h-6 w-16 rounded"></div>
          <div className="bg-surface-200 h-3 w-24 rounded"></div>
        </div>
      </motion.div>
    );
  }

  const getMetricIcon = (type) => {
    switch (type) {
      case 'blood-pressure': return Heart;
      case 'weight': return Activity;
      case 'blood-glucose': return Zap;
      case 'heart-rate': return Heart;
      case 'temperature': return Activity;
      default: return BarChart3;
    }
  };

  const getMetricColor = (type) => {
    switch (type) {
      case 'blood-pressure': return 'danger';
      case 'weight': return 'brand';
      case 'blood-glucose': return 'warning';
      case 'heart-rate': return 'accent';
      case 'temperature': return 'warning';
      default: return 'surface';
    }
  };

  const Icon = getMetricIcon(metric.type);
  const color = getMetricColor(metric.type);

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="bg-white rounded-lg p-4 border border-surface-300 hover:shadow-soft hover:border-surface-400 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
        <span className="text-xs text-surface-500">{formatTimeAgo(metric.recordedAt)}</span>
      </div>
      <div>
        <p className="text-lg font-semibold text-surface-900">
          {metric.type === 'blood-pressure' 
            ? `${metric.systolic}/${metric.diastolic}` 
            : metric.value?.numeric || metric.value}
          <span className="text-sm font-normal text-surface-500 ml-1">
            {metric.value?.unit || metric.unit}
          </span>
        </p>
        <p className="text-sm text-surface-600 capitalize">
          {metric.type.replace('-', ' ')}
        </p>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ activity, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-3">
        <div className="animate-pulse bg-surface-200 w-8 h-8 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="animate-pulse bg-surface-200 h-4 w-3/4 rounded"></div>
          <div className="animate-pulse bg-surface-200 h-3 w-1/2 rounded"></div>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'document': return FileText;
      case 'health': return Heart;
      case 'profile': return User;
      default: return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'document': return 'brand';
      case 'health': return 'accent';
      case 'profile': return 'warning';
      default: return 'surface';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const color = getActivityColor(activity.type);

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-50 transition-colors"
    >
      <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-surface-900">{activity.message}</p>
        <p className="text-xs text-surface-500">{formatTimeAgo(activity.timestamp)}</p>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  
  // Fetch documents
  const { data: documentsResponse, isLoading: documentsLoading, error: documentsError } = useQuery({
    queryKey: ['dashboard-documents'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await documentsAPI.getDocuments(token, { limit: 5 });
    },
    staleTime: 30000,
    retry: false,
  });

  // Fetch health metrics
  const { data: healthMetrics, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.getMetrics(token, { limit: 10 });
    },
    staleTime: 30000,
    retry: false,
  });

  // Fetch health summary
  const { data: healthSummary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['dashboard-health-summary'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.getSummary(token, 30);
    },
    staleTime: 30000,
    retry: false,
  });

  // Extract data
  const documents = documentsResponse?.data || [];
  const metrics = healthMetrics || [];
  const summary = healthSummary || {};
  
  // Calculate stats
  const stats = {
    documents: documents.length,
    healthRecords: metrics.length,
    healthScore: getHealthScore(metrics),
    profileViews: 0 // This would come from analytics in a real app
  };

  // Generate activity feed
  const recentActivity = [
    ...documents.slice(0, 3).map(doc => ({
      id: `doc-${doc._id}`,
      type: 'document',
      message: `Uploaded ${doc.title}`,
      timestamp: doc.createdAt
    })),
    ...metrics.slice(0, 2).map(metric => ({
      id: `metric-${metric._id}`,
      type: 'health',
      message: `Recorded ${metric.type.replace('-', ' ')}`,
      timestamp: metric.recordedAt
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const quickActions = [
    {
      name: 'Upload Document',
      description: 'Add new medical records',
      icon: FileText,
      color: 'brand',
      href: '/dashboard/documents',
    },
    {
      name: 'Record Health Data',
      description: 'Log your vitals',
      icon: Heart,
      color: 'danger',
      href: '/dashboard/health',
    },
    {
      name: 'View Appointments',
      description: 'Schedule & manage',
      icon: Calendar,
      color: 'warning',
      href: '/dashboard/appointments',
    },
    {
      name: 'Update Profile',
      description: 'Manage your info',
      icon: User,
      color: 'accent',
      href: '/dashboard/profile',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-brand-600 rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{greeting}!</h1>
              <p className="text-brand-100 text-sm md:text-base">Welcome to your health dashboard</p>
            </div>
            
            {/* Health Score Badge */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Heart className="w-5 h-5 text-white" />
                <span className="text-xs font-medium text-white">Health Score</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {summaryLoading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-12 rounded mx-auto"></div>
                ) : (
                  `${stats.healthScore}%`
                )}
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-accent-300" />
                <span className="text-xs text-accent-300">+5%</span>
              </div>
            </div>
          </div>
          <p className="text-brand-100 text-sm md:text-lg max-w-2xl mb-6">
            Monitor your health, manage your documents, and share your medical information 
            with healthcare providers seamlessly.
          </p>
          
          {/* Quick Share Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard/share">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white text-brand-600 px-6 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors"
              >
                <QrCode className="w-5 h-5" />
                <span>Generate QR Code</span>
              </motion.button>
            </Link>
            <Link href="/dashboard/share">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                <Share className="w-5 h-5" />
                <span>Share Profile</span>
              </motion.button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/10 rounded-full"></div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <StatCard
          title="Documents"
          value={stats.documents}
          change={12}
          icon={FileText}
          color="brand"
          href="/dashboard/documents"
          loading={documentsLoading}
        />
        <StatCard
          title="Health Records"
          value={stats.healthRecords}
          change={8}
          icon={BarChart3}
          color="accent"
          href="/dashboard/health"
          loading={healthLoading}
        />
        <StatCard
          title="Profile Views"
          value={stats.profileViews}
          change={-2}
          icon={Eye}
          color="warning"
          href="/dashboard/share"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {quickActions.map((action, index) => (
          <Link key={action.name} href={action.href}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-black rounded-xl p-6 text-white hover:shadow-medium hover:bg-${action.color}-700 transition-all duration-200 border border-${action.color}-700`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <action.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{action.name}</h3>
              <p className="text-sm text-white/80">{action.description}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          {/* Recent Health Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="xl:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-xl p-4 md:p-6 border border-surface-300 shadow-medium">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-surface-900">Recent Health Metrics</h2>
                  <p className="text-sm text-surface-500">Your latest health data</p>
                </div>
              </div>
              <Link 
                href="/dashboard/health"
                className="flex items-center space-x-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
              >
                <span>View all</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            {healthLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <MetricCard key={i} loading={true} />
                ))}
              </div>
            ) : metrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.slice(0, 4).map(metric => (
                  <MetricCard key={metric._id} metric={metric} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-500 mb-2">No health metrics yet</p>
                <Link 
                  href="/dashboard/health"
                  className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                >
                  Start recording your health data
                </Link>
              </div>
            )}
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-surface-300 shadow-medium">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-surface-900">Recent Documents</h2>
                  <p className="text-sm text-surface-500">Your latest medical documents</p>
                </div>
              </div>
              <Link 
                href="/dashboard/documents"
                className="flex items-center space-x-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
              >
                <span>View all</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            {documentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <div className="animate-pulse bg-surface-200 w-12 h-12 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="animate-pulse bg-surface-200 h-4 w-3/4 rounded"></div>
                      <div className="animate-pulse bg-surface-200 h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-4">
                {documents.slice(0, 3).map(document => (
                  <motion.div
                    key={document._id}
                    whileHover={{ x: 4 }}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-surface-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-surface-900">{document.title}</h4>
                      <p className="text-sm text-surface-500">{formatTimeAgo(document.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-surface-400 hover:text-brand-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-surface-400 hover:text-accent-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-500 mb-2">No documents yet</p>
                <Link 
                  href="/dashboard/documents"
                  className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                >
                  Upload your first document
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Activity Feed */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-surface-300 shadow-medium">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Recent Activity</h2>
                <p className="text-sm text-surface-500">Your latest actions</p>
              </div>
            </div>
            
            <div className="space-y-1">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm text-surface-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Score Card */}
          <div className="bg-accent-600 rounded-xl p-4 md:p-6 text-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Health Score</h2>
                <p className="text-sm text-accent-100">Overall wellness</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stats.healthScore}%</div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <motion.div 
                    className="bg-white h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.healthScore}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  ></motion.div>
                </div>
              </div>
              <p className="text-sm text-accent-100 text-center">
                Based on your recent health metrics and activity
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}