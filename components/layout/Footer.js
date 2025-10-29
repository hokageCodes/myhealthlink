'use client';

import { Facebook, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A2342] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold mb-4">MyHealthLink</h3>
          <p className="text-sm leading-relaxed text-gray-300">
            A secure, mobile-first platform to store, manage, and share your health records safely — anytime, anywhere.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/features" className="hover:text-white">Features</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
            <li><Link href="/security" className="hover:text-white">Security</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Connect</h4>
          <div className="flex space-x-4">
            <Link href="https://twitter.com" target="_blank" className="hover:text-blue-400">
              <Twitter size={20} />
            </Link>
            <Link href="https://facebook.com" target="_blank" className="hover:text-blue-400">
              <Facebook size={20} />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-blue-400">
              <Linkedin size={20} />
            </Link>
            <Link href="mailto:support@myhealthlink.com" className="hover:text-blue-400">
              <Mail size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10"></div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} MyHealthLink. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-3 md:mt-0">
          Made with <Heart size={14} className="text-red-500" /> in Lagos.
        </p>
      </div>
    </footer>
  );
}
