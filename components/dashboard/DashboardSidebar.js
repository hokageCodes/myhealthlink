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
  Target,
  Pill,
} from 'lucide-react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Privacy & Sharing', href: '/dashboard/privacy', icon: Shield },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Health Data', href: '/dashboard/health', icon: Heart },
  { name: 'Health Goals', href: '/dashboard/health/goals', icon: Target },
  { name: 'Emergency', href: '/dashboard/emergency', icon: Shield },
  { name: 'Medications', href: '/dashboard/medications', icon: Pill },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Phone },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar({ user, sidebarOpen, setSidebarOpen, hideToggle = false }) {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={`bg-white border-r border-neutral-200 transition-all duration-300 h-full flex flex-col ${
      sidebarOpen ? 'w-64' : 'w-20'
    }`}>
      {/* Sidebar Header */}
      <div className="flex-shrink-0 p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          {sidebarOpen ? (
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-10 h-10">
                {/* Shield with heart logo */}
                <svg className="absolute inset-0 w-full h-full text-brand-500 group-hover:text-brand-600 transition-colors duration-200" viewBox="0 0 40 40" fill="currentColor">
                  <path d="M20 2L6 8v10c0 8.84 6.12 17.12 14 19 7.88-1.88 14-10.16 14-19V8L20 2z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
              </div>
              <span className="text-xl font-bold font-heading text-neutral-900 group-hover:text-brand-600 transition-colors duration-200">
                MyHealthLink
              </span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center justify-center w-full group">
              <div className="relative w-10 h-10">
                <svg className="absolute inset-0 w-full h-full text-brand-500 group-hover:text-brand-600 transition-colors duration-200" viewBox="0 0 40 40" fill="currentColor">
                  <path d="M20 2L6 8v10c0 8.84 6.12 17.12 14 19 7.88-1.88 14-10.16 14-19V8L20 2z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
              </div>
            </Link>
          )}
          
          {!hideToggle && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg hover:bg-brand-50 text-neutral-600 hover:text-brand-600 transition-all duration-200 ${!sidebarOpen && 'absolute top-4 right-2'}`}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex-shrink-0 p-4 border-b border-neutral-200">
        {sidebarOpen ? (
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-brand-300">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.name || 'User'}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-brand-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-brand-300">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.name || 'User'}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-brand-600" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-neutral-700 hover:bg-brand-50 hover:text-brand-700'
              } ${!sidebarOpen && 'justify-center'}`}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon
                className={`flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-white' : 'text-neutral-500 group-hover:text-brand-600'
                } ${sidebarOpen && 'mr-3'}`}
              />
              {sidebarOpen && (
                <span className="truncate">{item.name}</span>
              )}
              {isActive && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="flex-shrink-0 p-3 border-t border-neutral-200">
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full px-3 py-3 text-sm font-medium text-danger-600 rounded-xl hover:bg-danger-50 hover:text-danger-700 transition-all duration-200 ${!sidebarOpen && 'justify-center'}`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut className={`flex-shrink-0 h-5 w-5 text-danger-500 group-hover:text-danger-600 ${sidebarOpen && 'mr-3'}`} />
          {sidebarOpen && <span className="truncate">Logout</span>}
        </button>
      </div>
    </div>
  );
}