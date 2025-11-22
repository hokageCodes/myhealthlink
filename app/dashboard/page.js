'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Heart, 
  FileText, 
  User,
  Activity,
  ArrowUpRight,
  Shield,
  Plus,
  Share2,
  Phone,
  Eye,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { documentsAPI } from '@/lib/api/documents';
import { healthAPI } from '@/lib/api/health';
import { authAPI } from '@/lib/api/auth';

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
  if (!metrics || metrics.length === 0) return 85;
  let score = 100;
  const recentMetrics = metrics.slice(0, 5);
  
  recentMetrics.forEach(metric => {
    if (metric.type === 'blood-pressure') {
      if (metric.systolic > 140 || metric.diastolic > 90) score -= 10;
      else if (metric.systolic > 130 || metric.diastolic > 85) score -= 5;
    }
  });
  
  return Math.max(0, Math.min(100, score));
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [greeting, setGreeting] = useState('');
  
  // Get cached user profile from layout (shared query cache)
  const userData = queryClient.getQueryData(['userProfile']);
  
  // Fetch documents
  const { data: documentsResponse, isLoading: documentsLoading } = useQuery({
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
  const { data: healthMetrics, isLoading: healthLoading } = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.getMetrics(token, { limit: 10 });
    },
    staleTime: 30000,
    retry: false,
  });

  // Extract data
  const documents = documentsResponse?.data || [];
  const metrics = healthMetrics || [];
  const healthScore = getHealthScore(metrics);
  const userName = userData?.name || 'there';

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const stats = [
    {
      label: 'Total Documents',
      value: documents.length,
      icon: FileText,
      color: 'brand',
      href: '/dashboard/documents'
    },
    {
      label: 'Health Records',
      value: metrics.length,
      icon: Activity,
      color: 'accent',
      href: '/dashboard/health'
    },
    {
      label: 'Emergency Contacts',
      value: userData?.emergencyContact?.name ? '1' : '0',
      icon: Phone,
      color: 'danger',
      href: '/dashboard/contacts'
    }
  ];

  const quickActions = [
    {
      name: 'Share Profile',
      icon: Share2,
      color: 'accent',
      href: '/dashboard/privacy',
      description: 'Generate QR code & link'
    },
    {
      name: 'Upload Document',
      icon: Plus,
      color: 'brand',
      href: '/dashboard/documents',
      description: 'Add medical records'
    },
    {
      name: 'Log Health Data',
      icon: Heart,
      color: 'danger',
      href: '/dashboard/health',
      description: 'Record vitals'
    },
    {
      name: 'Emergency Contacts',
      icon: Phone,
      color: 'warning',
      href: '/dashboard/contacts',
      description: 'Manage contacts'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 lg:p-12"
        >
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <p className="text-gray-600 font-medium">
                  {greeting}{userName !== 'there' ? `, ${userName}` : ''}!
                </p>
                {userName !== 'there' ? (
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Welcome back</h1>
                ) : (
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Welcome</h1>
                )}
                <p className="text-gray-600 text-lg max-w-2xl">
                  Your health dashboard is ready. Track your wellness journey, manage records, and stay on top of your health goals.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/documents"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Document
                </Link>
                <Link
                  href="/dashboard/privacy"
                  className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 border border-green-200 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Profile
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            return (
              <Link key={stat.label} href={stat.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-heading text-neutral-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              return (
                <Link key={action.name} href={action.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                      <action.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{action.name}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Health Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Health Metrics</h2>
                  <p className="text-sm text-gray-500">Your latest vitals</p>
                </div>
              </div>
              <Link 
                href="/dashboard/health"
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold group"
              >
                View all
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
            
            {healthLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse bg-neutral-100 rounded-xl p-4 h-32" />
                ))}
              </div>
            ) : metrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.slice(0, 4).map((metric, index) => (
                  <motion.div
                    key={metric._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{formatTimeAgo(metric.recordedAt)}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.type === 'blood-pressure' 
                        ? `${metric.systolic}/${metric.diastolic}` 
                        : (() => {
                            const value = metric.value?.numeric || metric.value;
                            // Handle object values (like blood pressure objects)
                            if (typeof value === 'object' && value !== null) {
                              if (value.systolic && value.diastolic) {
                                return `${value.systolic}/${value.diastolic}`;
                              }
                              return String(value);
                            }
                            return value;
                          })()}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {metric.value?.unit || metric.unit}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 capitalize font-medium">
                      {metric.type.replace('-', ' ')}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">No health metrics yet</p>
                <Link 
                  href="/dashboard/health"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Start tracking your health →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Emergency Contact Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
                <p className="text-gray-600 text-xs">Quick access</p>
              </div>
            </div>
            
            {userData?.emergencyContact?.name ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{userData.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{userData.emergencyContact.phone}</p>
                </div>
                {userData.emergencyContact.relationship && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Relationship</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.emergencyContact.relationship}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-4">No emergency contact set</p>
              </div>
            )}
            
            <Link
              href="/dashboard/contacts"
              className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center font-semibold transition-all duration-200 mt-6"
            >
              {userData?.emergencyContact?.name ? 'Manage Contacts' : 'Add Emergency Contact'}
            </Link>
          </motion.div>
        </div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
                <p className="text-sm text-gray-500">Your latest medical records</p>
              </div>
            </div>
            <Link 
              href="/dashboard/documents"
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold group"
            >
              View all
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          {documentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-neutral-100 rounded-xl p-4 h-20" />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.slice(0, 6).map((doc, index) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-green-100">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{formatTimeAgo(doc.createdAt)}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{doc.title}</h4>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No documents yet</p>
              <Link 
                href="/dashboard/documents"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Upload your first document →
              </Link>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}