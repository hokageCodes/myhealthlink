'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        {/* Brand Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-3 group mb-4">
            <div className="relative w-10 h-10">
              <svg className="absolute inset-0 w-full h-full text-brand-500 group-hover:text-brand-400 transition-colors duration-200" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 2L6 8v10c0 8.84 6.12 17.12 14 19 7.88-1.88 14-10.16 14-19V8L20 2z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-brand-500/30 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <span className="text-2xl font-bold font-heading text-white group-hover:text-brand-400 transition-colors duration-200">
              MyHealthLink
            </span>
          </Link>
          <p className="text-neutral-300 leading-relaxed max-w-2xl mx-auto">
            A secure, mobile-first platform to store, manage, and share your health records safely — accessible anytime, anywhere.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-neutral-700 my-8"
        />

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center justify-center text-sm text-neutral-400 space-y-2"
        >
          <p>© {currentYear} MyHealthLink. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={14} className="text-brand-400" fill="currentColor" /> in Lagos, Nigeria
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
