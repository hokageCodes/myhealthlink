'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api/auth';
import PWAInstallBanner, { PWAUpdateBanner } from '@/components/ui/PWAInstallBanner';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, getToken, handleAuthError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const authErrorHandled = useRef(false);

  // Check screen size and set defaults
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      // Set sidebar state based on screen size - responsive to all sizes
      if (width < 1024) {
        setSidebarOpen(false);
      } else if (width < 1280 && width >= 1024) {
        setSidebarOpen(false);
      } else if (width >= 1280) {
        setSidebarOpen(true);
      }
    };
    
    setMounted(true);
    checkScreenSize();
    
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch user data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.get(token);
    },
    enabled: isAuthenticated && mounted,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Handle auth errors (only once per error)
  useEffect(() => {
    if (error && !authErrorHandled.current) {
      // Check if it's an auth error
      if (error.status === 401 || error.status === 403) {
        authErrorHandled.current = true;
        handleAuthError(error);
      }
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Register service worker for push notifications
  useEffect(() => {
    if (mounted && isAuthenticated && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const { registerServiceWorker } = await import('@/lib/utils/pushNotifications');
          await registerServiceWorker();
        } catch (error) {
          console.warn('Service worker registration failed:', error);
        }
      };
      registerSW();
    }
  }, [mounted, isAuthenticated]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar - Responsive */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 256 : 80,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 z-50 h-full flex-shrink-0 hidden lg:block"
      >
        <DashboardSidebar 
          user={userData} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleToggleSidebar}
        />
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: 256,
          x: sidebarOpen ? 0 : -256
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 z-50 h-full lg:hidden"
      >
        <DashboardSidebar 
          user={userData} 
          sidebarOpen={true}
          setSidebarOpen={handleToggleSidebar}
          hideToggle={true}
        />
      </motion.aside>
      
      {/* Spacer - matches sidebar width (desktop only) */}
      <motion.div 
        initial={false}
        animate={{ 
          width: sidebarOpen ? 256 : 80,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 hidden lg:block"
      />
      
      {/* Main Content Area - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 h-full w-full lg:w-auto">
        {/* Fixed Header */}
        <div className="flex-shrink-0 sticky top-0 z-20">
          <DashboardHeader 
            user={userData}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={handleToggleSidebar}
          />
        </div>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="px-4 py-4 sm:px-6 sm:py-6 lg:px-6 lg:py-6 xl:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* PWA Banners */}
        <PWAUpdateBanner />
        <PWAInstallBanner />
      </div>
    </div>
  );
}