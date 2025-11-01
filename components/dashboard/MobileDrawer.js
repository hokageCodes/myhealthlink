'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogout } from '@/lib/hooks/useAuth';
import {
  X,
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
  UserCircle,
  Target,
  Pill,
} from 'lucide-react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
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

export default function MobileDrawer({ user, isOpen, onClose }) {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const [imageError, setImageError] = useState(false);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset image error state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
    }
  }, [isOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-[60] w-screen max-w-sm bg-white shadow-strong md:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col overflow-y-auto">
              {/* Header */}
              <div className="px-4 py-6 border-b border-surface-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="ml-2 text-lg font-semibold text-surface-900">
                      MyHealthLink
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-lg text-surface-400 hover:text-surface-500 hover:bg-surface-100 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="px-4 py-6">
                <div className="bg-brand-600 rounded-xl p-4 text-white">
                  <div className="flex items-center mb-4">
                    <div className="relative w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profilePicture && !imageError ? (
                        <Image
                          src={user.profilePicture}
                          alt={user.name || 'User'}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <UserCircle className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold">
                        {user?.name || 'User'}
                      </h3>
                      <p className="text-brand-100 text-sm">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-brand-100 text-xs">Documents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-brand-100 text-xs">Appointments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-brand-100 text-xs">Health Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4">
                <div className="space-y-1">
                  {navigation.map((item, index) => {
                    // Improved active state detection
                    const isActive = item.href === '/dashboard' 
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.03,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-brand-100 text-brand-700 shadow-sm'
                              : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                          }`}
                        >
                          <item.icon
                            className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                              isActive ? 'text-brand-500' : 'text-surface-400 group-hover:text-surface-600'
                            }`}
                          />
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Logout Button */}
              <div className="px-4 py-6 border-t border-surface-200">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="group flex items-center w-full px-3 py-3 text-sm font-medium text-danger-600 rounded-lg hover:bg-danger-50 hover:text-danger-700 transition-colors"
                >
                  <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-danger-400" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}