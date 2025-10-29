'use client';

import { Facebook, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { href: '/features', label: 'Features' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/faqs', label: 'FAQs' },
        { href: '/demo', label: 'Demo' }
      ]
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/blog', label: 'Blog' },
        { href: '/careers', label: 'Careers' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { href: '/privacy-policy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/security', label: 'Security' },
        { href: '/compliance', label: 'Compliance' }
      ]
    },
    {
      title: 'Support',
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/contact', label: 'Contact Support' },
        { href: '/api-docs', label: 'API Docs' },
        { href: '/status', label: 'Status' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:support@myhealthlink.com', label: 'Email' }
  ];

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative container mx-auto px-4 lg:px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Link href="/" className="flex items-center space-x-3 group mb-6">
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
            <p className="text-neutral-300 leading-relaxed mb-6 max-w-sm">
              A secure, mobile-first platform to store, manage, and share your health records safely — accessible anytime, anywhere.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-neutral-800 hover:bg-brand-500 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-200 border border-neutral-700 hover:border-brand-500"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h4 className="text-lg font-semibold font-heading text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-neutral-400 hover:text-brand-400 transition-colors duration-200 text-sm group"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 group-hover:w-full transition-all duration-200" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

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
          className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-400"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
            <p>© {currentYear} MyHealthLink. All rights reserved.</p>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-brand-400 transition-colors duration-200">
                Privacy
              </Link>
              <span className="text-neutral-600">•</span>
              <Link href="/terms" className="hover:text-brand-400 transition-colors duration-200">
                Terms
              </Link>
              <span className="text-neutral-600">•</span>
              <Link href="/security" className="hover:text-brand-400 transition-colors duration-200">
                Security
              </Link>
            </div>
          </div>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={14} className="text-brand-400" fill="currentColor" /> in Lagos, Nigeria
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
