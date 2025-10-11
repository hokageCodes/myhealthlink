'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Link, 
  QrCode, 
  Share2,
  Check,
  Copy,
  Heart,
  Phone
} from 'lucide-react';
import { authAPI } from '@/lib/api/auth';
import QRCodeModal from '@/components/QRCodeModal';

export default function PrivacyPage() {
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user privacy settings
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await authAPI.profile.get(token);
    },
    staleTime: Infinity,
  });

  // Update privacy settings mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (privacyData) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await authAPI.profile.update(token, privacyData);
    },
    onSuccess: () => {
      toast.success('Privacy settings updated successfully');
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update privacy settings');
    },
  });

  const handleFieldToggle = (field) => {
    const currentFields = userData?.publicFields || [];
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field];
    
    updatePrivacyMutation.mutate({
      publicFields: newFields
    });
  };

  const handlePublicToggle = () => {
    updatePrivacyMutation.mutate({
      isPublicProfile: !userData?.isPublicProfile
    });
  };

  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}/share/${userData?.username}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${userData?.username}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Privacy & Sharing</h1>
          <p className="text-gray-500 mt-1">Control what information you share publicly</p>
        </div>
      </div>

      {/* Public Profile Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Public Profile</h3>
              <p className="text-sm text-gray-500">
                Allow others to view your health information via a public link
              </p>
            </div>
          </div>
          <button
            onClick={handlePublicToggle}
            disabled={updatePrivacyMutation.isPending}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              userData?.isPublicProfile ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                userData?.isPublicProfile ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Share Link */}
      {userData?.isPublicProfile && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Share Link</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-50 rounded-lg p-3 border">
              <p className="text-sm text-gray-600 font-mono">{shareUrl}</p>
            </div>
            <button
              onClick={copyShareLink}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this link with doctors, emergency contacts, or anyone who needs access to your health information.
          </p>
        </div>
      )}

      {/* Privacy Controls */}
      {userData?.isPublicProfile && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What to Share</h3>
          <p className="text-sm text-gray-500 mb-6">
            Choose which information is visible on your public profile:
          </p>

          <div className="space-y-4">
            {/* Blood Type */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Blood Type</h4>
                  <p className="text-sm text-gray-500">Essential for emergency situations</p>
                </div>
              </div>
              <button
                onClick={() => handleFieldToggle('bloodType')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  userData?.publicFields?.includes('bloodType') ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userData?.publicFields?.includes('bloodType') ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Allergies */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Allergies</h4>
                  <p className="text-sm text-gray-500">Critical for medical treatment</p>
                </div>
              </div>
              <button
                onClick={() => handleFieldToggle('allergies')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  userData?.publicFields?.includes('allergies') ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userData?.publicFields?.includes('allergies') ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Emergency Contact */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Emergency Contact</h4>
                  <p className="text-sm text-gray-500">Contact information for emergencies</p>
                </div>
              </div>
              <button
                onClick={() => handleFieldToggle('emergencyContact')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  userData?.publicFields?.includes('emergencyContact') ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userData?.publicFields?.includes('emergencyContact') ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {userData?.isPublicProfile && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Profile</span>
            </a>
            <button 
              onClick={() => setQrModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate QR Code</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        shareUrl={shareUrl}
        userName={userData?.name || 'User'}
      />
    </div>
  );
}
