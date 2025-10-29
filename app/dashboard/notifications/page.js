'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Calendar, 
  Pill,
  FileText,
  Settings,
  Trash2,
  Filter,
  XCircle
} from 'lucide-react';
import { notificationsAPI } from '@/lib/api/notifications';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // Fetch notifications from API
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      
      const params = {
        limit: 50
      };
      
      if (filter === 'unread') {
        params.read = false;
      } else if (filter !== 'all') {
        params.type = filter;
      }
      
      return await notificationsAPI.getNotifications(token, params);
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for new notifications
  });

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notificationsResponse?.unreadCount || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await notificationsAPI.markAsRead(token, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification marked as read');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await notificationsAPI.markAllAsRead(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark all as read');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await notificationsAPI.deleteNotification(token, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });

  const getIcon = (type) => {
    switch(type) {
      case 'reminder':
        return Pill;
      case 'appointment':
        return Calendar;
      case 'system':
        return Info;
      case 'alert':
      case 'emergency':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getColorClass = (color) => {
    switch(color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const markAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    if (notifications.length === 0) {
      toast.info('No notifications to mark as read');
      return;
    }
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotificationMutation.mutate(id);
    }
  };

  const formatTimestamp = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now - notificationDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notificationDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-light text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your health information</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {unreadCount} unread
            </span>
          )}
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markAllAsReadMutation.isPending || notifications.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{markAllAsReadMutation.isPending ? 'Marking...' : 'Mark All Read'}</span>
            </button>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === 'unread' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('reminder')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === 'reminder' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setFilter('appointment')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === 'appointment' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setFilter('system')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === 'system' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const colorClass = getColorClass(notification.color || 'blue');
            
            return (
              <motion.div
                key={notification._id || notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white rounded-lg border-2 p-4 ${
                  notification.read 
                    ? 'border-gray-200' 
                    : 'border-blue-400 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimestamp(notification.createdAt || notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            // Mark as read when clicking action
                            if (!notification.read) {
                              markAsRead(notification._id || notification.id);
                            }
                            window.location.href = notification.actionUrl;
                          }}
                        >
                          View →
                        </a>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id || notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id || notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="text-sm text-red-600 hover:text-red-700 ml-auto disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
