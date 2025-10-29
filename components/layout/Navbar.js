'use client';

import Link from 'next/link';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/services', label: 'Services' },
    { href: '/providers', label: 'Find Providers' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
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
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="relative text-neutral-700 hover:text-brand-600 font-medium transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-neutral-700 hover:text-brand-600 font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>
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
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-neutral-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg font-medium transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-neutral-200 flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-center text-neutral-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg font-medium transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-center bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full shadow-md transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}