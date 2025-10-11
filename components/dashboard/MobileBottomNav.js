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
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-4 left-4 right-4 bg-white border border-surface-200 shadow-medium rounded-2xl md:hidden z-50"
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
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
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon
                    size={20}
                    className={`${
                      isActive ? 'text-brand-600' : 'text-surface-400'
                    }`}
                  />
                </motion.div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-brand-600' : 'text-surface-500'
                }`}>
                  {item.name}
                </span>
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