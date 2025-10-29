'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
  Save,
  Edit,
  Download,
  FileText,
  FileJson,
  Calendar,
  Pill
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authAPI } from '@/lib/api/auth';
import { exportAPI } from '@/lib/api/export';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('account');

  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.get(token);
    },
  });

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      reminders: true,
      appointments: true,
      documents: false
    },
    privacy: {
      profileVisibility: 'private',
      requirePassword: false,
      shareCriticalInfo: false
    },
    security: {
      twoFactorEnabled: false
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.update(token, { settings: data });
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'export', label: 'Data Export', icon: Download }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-light text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Settings */}
      {activeTab === 'account' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={userData?.data?.name || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={userData?.data?.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={userData?.data?.phone || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            To update your account information, please visit the{' '}
            <a href="/dashboard/profile" className="text-brand-600 hover:underline">
              Profile page
            </a>
          </p>
        </motion.div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, sms: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium text-gray-900 mb-4">Notification Types</h3>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Medication Reminders</h4>
                  <p className="text-sm text-gray-500">Get reminded about your medications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.reminders}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, reminders: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                  <p className="text-sm text-gray-500">Get reminded about upcoming appointments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.appointments}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, appointments: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Privacy Settings */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, profileVisibility: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Control who can view your health profile
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Require Password for Access</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.requirePassword}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, requirePassword: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, twoFactorEnabled: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </motion.div>
      )}

      {/* Data Export */}
      {activeTab === 'export' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Data Export</h2>
            <p className="text-sm text-gray-500 mt-1">Export your health data for backup or sharing with healthcare providers</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileJson className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Export as JSON</h3>
                    <p className="text-sm text-gray-500">Complete health data in JSON format</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const token = getToken();
                      if (!token) throw new Error('No token');
                      await exportAPI.exportJSON(token);
                      toast.success('Data exported successfully');
                    } catch (error) {
                      toast.error(error.message || 'Failed to export data');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export JSON
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Export Metrics as CSV</h3>
                    <p className="text-sm text-gray-500">Health metrics in spreadsheet format</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const token = getToken();
                      if (!token) throw new Error('No token');
                      await exportAPI.exportCSV(token, 'metrics');
                      toast.success('Metrics exported successfully');
                    } catch (error) {
                      toast.error(error.message || 'Failed to export CSV');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Export Appointments as CSV</h3>
                    <p className="text-sm text-gray-500">Appointment history in spreadsheet format</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const token = getToken();
                      if (!token) throw new Error('No token');
                      await exportAPI.exportCSV(token, 'appointments');
                      toast.success('Appointments exported successfully');
                    } catch (error) {
                      toast.error(error.message || 'Failed to export CSV');
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Pill className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Export Medications as CSV</h3>
                    <p className="text-sm text-gray-500">Medication history in spreadsheet format</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const token = getToken();
                      if (!token) throw new Error('No token');
                      await exportAPI.exportCSV(token, 'medications');
                      toast.success('Medications exported successfully');
                    } catch (error) {
                      toast.error(error.message || 'Failed to export CSV');
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Exported data contains sensitive health information. 
              Keep it secure and only share with trusted healthcare providers.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

