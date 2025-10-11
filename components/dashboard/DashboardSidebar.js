'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/lib/hooks/useAuth';
import {
  Home,
  User,
  FileText,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  Shield,
  Heart,
  Phone,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Privacy & Sharing', href: '/dashboard/privacy', icon: Shield },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Health Data', href: '/dashboard/health', icon: BarChart3 },
  { name: 'Emergency', href: '/dashboard/emergency', icon: Shield },
  { name: 'Medications', href: '/dashboard/medications', icon: Heart },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Phone },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar({ user, sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      sidebarOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                MyHealthLink
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* User Profile Section */}
      {sidebarOpen && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                  fill
                  sizes="40px"
                />
              ) : (
                <User className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {sidebarOpen && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-red-400 group-hover:text-red-500" />
          {sidebarOpen && <span className="truncate">Logout</span>}
        </button>
      </div>
    </div>
  );
}
