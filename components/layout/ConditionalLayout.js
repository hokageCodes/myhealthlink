'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

const AUTH_PATHS = [
  '/login',
  '/register',
  '/verify-otp',
  '/reset-password',
  '/forgot-password',
];

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isDashboardPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/emergency');
  const shouldShowNavAndFooter = !isAuthPage && !isDashboardPage;

  return (
    <>
      {shouldShowNavAndFooter && <Navbar />}
      {children}
      {shouldShowNavAndFooter && <Footer />}
    </>
  );
}

