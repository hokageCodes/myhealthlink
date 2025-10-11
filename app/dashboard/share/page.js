'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Share2, 
  Copy, 
  Download, 
  ArrowLeft,
  User,
  Heart,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import QRCodeModal from '@/components/QRCodeModal';
import { authAPI } from '@/lib/api/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function SharePage() {
  const { getToken } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Fetch user profile
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.get(token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (userData?.data?.username) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/share/${userData.data.username}`);
    }
  }, [userData]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userData?.data?.name || 'My'} Health Profile`,
          text: 'Access my health information',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    setShowQRModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-surface-600">Loading...</p>
        </div>
      </div>
    );
  }

  const user = userData?.data;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-surface-600" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">Share Your Profile</h1>
              <p className="text-surface-600">Generate QR codes and share your health information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-surface-300 shadow-medium"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Profile Preview</h2>
                <p className="text-sm text-surface-600">How others will see your profile</p>
              </div>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-surface-200 rounded-xl flex items-center justify-center">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-xl"
                        fill
                        sizes="64px"
                      />
                    ) : (
                      <User className="w-8 h-8 text-surface-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900">{user.name}</h3>
                    <p className="text-sm text-surface-600">
                      {user.dateOfBirth ? 
                        `${new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()} years old` : 
                        'Age not specified'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {user.bloodType && (
                    <div className="bg-danger-50 rounded-lg p-3">
                      <p className="text-xs text-danger-600 font-medium">Blood Type</p>
                      <p className="text-danger-900 font-semibold">{user.bloodType}</p>
                    </div>
                  )}
                  {user.allergies && (
                    <div className="bg-warning-50 rounded-lg p-3">
                      <p className="text-xs text-warning-600 font-medium">Allergies</p>
                      <p className="text-warning-900 font-semibold text-sm">
                        {user.allergies.length > 20 ? `${user.allergies.substring(0, 20)}...` : user.allergies}
                      </p>
                    </div>
                  )}
                </div>

                {user.emergencyContact && (
                  <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-danger-600" />
                      <p className="text-sm font-medium text-danger-900">Emergency Contact</p>
                    </div>
                    <p className="text-danger-800 text-sm">{user.emergencyContact.name}</p>
                    <p className="text-danger-700 text-xs">{user.emergencyContact.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                <p className="text-surface-600">Complete your profile to enable sharing</p>
                <Link href="/dashboard/profile">
                  <button className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                    Complete Profile
                  </button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Share Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* QR Code Card */}
            <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-medium">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900">QR Code</h2>
                  <p className="text-sm text-surface-600">Generate a QR code for quick access</p>
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadQR}
                  disabled={!user}
                  className="w-full bg-brand-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-brand-700 disabled:bg-surface-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Generate QR Code</span>
                </motion.button>
              </div>
            </div>

            {/* Share Link Card */}
            <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-medium">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900">Share Link</h2>
                  <p className="text-sm text-surface-600">Copy or share your profile URL</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-surface-50 rounded-lg p-3 border border-surface-200">
                  <p className="text-xs text-surface-500 mb-1">Share URL:</p>
                  <p className="text-sm text-surface-700 font-mono break-all">{shareUrl || 'Loading...'}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyLink}
                    disabled={!shareUrl}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-surface-600 text-white rounded-lg hover:bg-surface-700 disabled:bg-surface-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    disabled={!shareUrl}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:bg-surface-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-warning-900 mb-1">Privacy Notice</h3>
                  <p className="text-sm text-warning-800">
                    Only share your profile with trusted healthcare providers and emergency contacts. 
                    Your profile contains sensitive medical information.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shareUrl={shareUrl}
        userName={user?.name || 'User'}
      />
    </div>
  );
}
