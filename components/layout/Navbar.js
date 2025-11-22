'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth, useLogout } from '@/lib/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  // Get user data from cache
  const userData = queryClient.getQueryData(['userProfile']);

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

  // Handle hash navigation on page load
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [pathname]);

  const handleLogout = () => {
    logoutMutation.mutate();
    setProfileDropdownOpen(false);
  };

  const handleScrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    
    // If not on homepage, navigate to homepage with hash first
    if (pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }

    // If on homepage, scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { sectionId: 'features', label: 'Features' },
    { sectionId: 'how-it-works', label: 'How It Works' },
    { sectionId: 'faqs', label: 'FAQs' },
    { sectionId: 'contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10">
              {/* Shield background for security */}
              <svg className="absolute inset-0 w-full h-full text-brand-500 group-hover:text-brand-600 transition-colors duration-200" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 2L6 8v10c0 8.84 6.12 17.12 14 19 7.88-1.88 14-10.16 14-19V8L20 2z" />
              </svg>
              
              {/* Heart + Link symbol inside shield */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Heart with pulse effect */}
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {/* Link chain overlay */}
                <svg className="absolute w-3 h-3 text-white/90 translate-x-2 translate-y-2" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M7 5L5 7M4.5 2.5L3 4M8 9.5L9.5 8" />
                </svg>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-brand-400/30 rounded-lg blur-lg group-hover:bg-brand-500/40 transition-all duration-200" />
            </div>
            
            <span className="text-2xl font-bold font-heading text-neutral-900 group-hover:text-brand-600 transition-colors duration-200">
              MyHealthLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.sectionId}
                onClick={() => handleScrollToSection(link.sectionId)}
                className="relative text-neutral-700 hover:text-brand-600 font-medium transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-200" />
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  {userData?.profilePicture ? (
                    <Image
                      src={userData.profilePicture}
                      alt={userData.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  <span className="text-neutral-700 font-medium">{userData?.name || 'User'}</span>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-100 transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-600" />
                      <span className="text-neutral-700">Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-600" />
                      <span className="text-neutral-700">Settings</span>
                    </Link>
                    <div className="border-t border-neutral-200 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span className="text-red-600 font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-neutral-700 hover:text-green-600 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.sectionId}
                  onClick={() => handleScrollToSection(link.sectionId)}
                  className="px-4 py-2.5 text-left text-neutral-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg font-medium transition-all duration-200"
                >
                  {link.label}
                </button>
              ))}
              {isAuthenticated ? (
                <div className="pt-3 border-t border-neutral-200 flex flex-col space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    {userData?.profilePicture ? (
                      <Image
                        src={userData.profilePicture}
                        alt={userData.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    <span className="text-neutral-700 font-medium">{userData?.name || 'User'}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-center text-neutral-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2.5 text-center text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-neutral-200 flex flex-col space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-center text-neutral-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-center bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-md transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}