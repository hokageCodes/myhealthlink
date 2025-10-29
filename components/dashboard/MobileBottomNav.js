'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  Calendar,
  BarChart3,
  User,
  Heart,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Health', href: '/dashboard/health', icon: Heart },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Improved active state detection - handles exact and nested routes
  const isActiveRoute = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="fixed bottom-3 left-3 right-3 bg-white border border-surface-200 shadow-medium rounded-2xl md:hidden z-[50]"
      style={{ 
        paddingBottom: `max(0.75rem, env(safe-area-inset-bottom))`,
        marginBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navigation.map((item) => {
          const isActive = isActiveRoute(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <item.icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-brand-600' : 'text-surface-400'
                    }`}
                  />
                </motion.div>
                <motion.span 
                  className={`text-xs mt-1 font-medium transition-colors duration-200 ${
                    isActive ? 'text-brand-600' : 'text-surface-500'
                  }`}
                  animate={{ opacity: isActive ? 1 : 0.7 }}
                >
                  {item.name}
                </motion.span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-600 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}