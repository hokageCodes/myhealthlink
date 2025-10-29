'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import MobileDrawer from '@/components/dashboard/MobileDrawer';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api/auth';
import PWAInstallBanner, { PWAUpdateBanner } from '@/components/ui/PWAInstallBanner';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, getToken, handleAuthError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check screen size
  useEffect(() => {
    setMounted(true);
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry user profile requests
  });

  // Handle auth errors
  useEffect(() => {
    if (error && (error.status === 401 || error.status === 403)) {
      handleAuthError();
    }
  }, [error, handleAuthError]);

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // Close drawer on route change for smooth UX
  useEffect(() => {
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Loading state or not mounted
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-surface-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-surface-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full">
        {/* Fixed Sidebar - Full Viewport Height */}
        <motion.div
          initial={false}
          animate={{ 
            width: sidebarOpen ? 280 : 80,
            transition: { duration: 0.3, ease: 'easeInOut' }
          }}
          className="fixed top-0 left-0 z-30 h-screen"
          style={{ height: '100vh' }}
        >
          <DashboardSidebar 
            user={userData} 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </motion.div>
        
        {/* Spacer for fixed sidebar - matches sidebar width */}
        <motion.div 
          initial={false}
          animate={{ 
            width: sidebarOpen ? 280 : 80,
            transition: { duration: 0.3, ease: 'easeInOut' }
          }}
          className="flex-shrink-0"
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Fixed Header */}
          <div className="flex-shrink-0">
            <DashboardHeader 
              user={userData}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
          
          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="px-2"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40"
        >
          <div className="flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
            <h1 className="ml-3 text-lg font-semibold text-surface-900">MyHealthLink</h1>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile Page Content */}
        <main className="flex-1 overflow-auto pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full px-2"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <MobileDrawer 
              user={userData}
              isOpen={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* PWA Banners */}
        <PWAUpdateBanner />
        <PWAInstallBanner />
      </div>
    </div>
  );
}