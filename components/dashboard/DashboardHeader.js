'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, User, Settings, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useLogout } from '@/lib/hooks/useAuth';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardHeader({ user, sidebarOpen, setSidebarOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const dropdownRef = useRef(null);
  const logoutMutation = useLogout();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setProfileDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left side - Menu + Search */}
          <div className="flex items-center flex-1 gap-4">
            {/* Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-neutral-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search records, medications, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 border border-neutral-300 rounded-xl bg-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2.5 text-neutral-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all duration-200 group"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger-500 rounded-full ring-2 ring-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle showLabel={false} />
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-2 rounded-xl hover:bg-neutral-50 transition-all duration-200 group"
              >
                <div className="relative w-9 h-9 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-brand-300 transition-all duration-200">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name || 'User'}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-brand-600" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-neutral-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    View Profile
                  </p>
                </div>
                <ChevronDown className={`hidden md:block w-4 h-4 text-neutral-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* Profile Info */}
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3 mb-3">
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
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block w-full px-4 py-2 text-sm font-medium text-center text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors duration-200"
                    >
                      View Full Profile
                    </Link>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-600" />
                      </div>
                      <span className="font-medium">Profile Settings</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="w-8 h-8 bg-accent-50 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-accent-600" />
                      </div>
                      <span className="font-medium">Account Settings</span>
                    </Link>

                    <div className="my-2 border-t border-neutral-100"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-danger-50 rounded-lg flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-danger-600" />
                      </div>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}