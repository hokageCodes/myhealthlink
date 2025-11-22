'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
  Phone,
  Lock,
  Key,
  Calendar,
  X
} from 'lucide-react';
import { authAPI } from '@/lib/api/auth';
import QRCodeModal from '@/components/QRCodeModal';

export default function PrivacyPage() {
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const queryClient = useQueryClient();

  // Get user profile from cache (layout fetches it)
  const userData = queryClient.getQueryData(['userProfile']);
  const isLoading = !userData;

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
    }, {
      onSuccess: () => {
        // Auto-advance to next step when public profile is enabled
        if (!userData?.isPublicProfile) {
          setTimeout(() => setActiveStep(2), 500);
        }
      }
    });
  };

  const handleShareLinkSettingsUpdate = async (settings) => {
    try {
      await updatePrivacyMutation.mutateAsync({
        shareLinkSettings: {
          ...userData?.shareLinkSettings,
          ...settings
        }
      });
    } catch (error) {
      throw error;
    }
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

  console.log('Privacy Page - User Data:', {
    username: userData?.username,
    isPublicProfile: userData?.isPublicProfile,
    shareLinkSettings: userData?.shareLinkSettings,
    shareUrl
  });

  const steps = [
    { number: 1, title: 'Enable Sharing', icon: Shield },
    { number: 2, title: 'Link Settings', icon: Link },
    { number: 3, title: 'What to Share', icon: Eye },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Privacy & Sharing</h1>
        <p className="text-gray-600 mt-2">Control what information you share publicly</p>
      </div>

      {/* Progress Steps */}
      {userData?.isPublicProfile && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.number;
              const isCompleted = activeStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setActiveStep(step.number)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-green-600 text-white shadow-lg' 
                          : isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 1: Enable Sharing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Public Profile</h3>
              <p className="text-sm text-gray-600">
                Allow others to view your health information via a public link
              </p>
              {!userData?.isPublicProfile && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ⚠️ Toggle ON to get started
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handlePublicToggle}
            disabled={updatePrivacyMutation.isPending}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
            } ${userData?.isPublicProfile ? 'bg-green-600' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                userData?.isPublicProfile ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Step 2: Share Link Settings */}
      {userData?.isPublicProfile && activeStep >= 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Link className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Share Link</h3>
                <p className="text-sm text-gray-600">Copy or share this link</p>
              </div>
            </div>
            {!userData?.username ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ Username is required to generate share link
                </p>
                <p className="text-xs text-red-700">
                  Please set a username in your profile settings to enable sharing.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700 font-mono break-all">{shareUrl}</p>
                  </div>
                  <button
                    onClick={copyShareLink}
                    disabled={!userData?.isPublicProfile || updatePrivacyMutation.isPending || !userData?.username}
                    className={`flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md ${
                      (!userData?.isPublicProfile || updatePrivacyMutation.isPending || !userData?.username) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                {userData?.shareLinkSettings?.expiresAt && new Date(userData.shareLinkSettings.expiresAt) < new Date() && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ Your share link has expired. Update the expiration setting below to fix this.
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Share this link with healthcare providers, emergency contacts, or anyone who needs access to your health information.
                </p>
              </>
            )}
          </div>
          
          {/* Share Link Security Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Link Security Settings</h3>
                <p className="text-sm text-gray-600">Control who can access your profile</p>
              </div>
            </div>
            
            {/* Access Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Type
              </label>
              <select
                value={userData?.shareLinkSettings?.accessType || 'public'}
                onChange={(e) => handleShareLinkSettingsUpdate({ accessType: e.target.value })}
                disabled={updatePrivacyMutation.isPending}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="public">Public (No protection)</option>
                <option value="password">Password Protected</option>
                <option value="otp">OTP Protected</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                💡 Choose <strong>Password Protected</strong> to share a password with viewers
              </p>
            </div>

            {/* Password Protection */}
            {userData?.shareLinkSettings?.accessType === 'password' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <Lock className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Password Protection</h4>
                </div>
                <PasswordInput 
                  onUpdate={(password) => handleShareLinkSettingsUpdate({ password })}
                  currentPassword={userData?.shareLinkSettings?.password ? '••••••••' : null}
                />
              </div>
            )}

            {/* Link Expiry */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Link Expiration (Optional)
              </label>
              <select
                value={(() => {
                  const expiresAt = userData?.shareLinkSettings?.expiresAt;
                  if (!expiresAt) return 'never';
                  const expiry = new Date(expiresAt);
                  const now = new Date();
                  const daysDiff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                  if (daysDiff <= 0) return 'expired';
                  if (daysDiff <= 7) return '7days';
                  if (daysDiff <= 30) return '30days';
                  if (daysDiff <= 90) return '90days';
                  return 'custom';
                })()}
                onChange={(e) => {
                  const value = e.target.value;
                  let expiresAt = null;
                  
                  if (value === 'expired' || value === 'never') {
                    // Remove expiry - set to null
                    expiresAt = null;
                  } else if (value !== 'never' && value !== 'expired') {
                    const now = new Date();
                    switch(value) {
                      case '7days':
                        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        break;
                      case '30days':
                        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                        break;
                      case '90days':
                        expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
                        break;
                    }
                  }
                  
                  handleShareLinkSettingsUpdate({ expiresAt });
                }}
                disabled={updatePrivacyMutation.isPending}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="never">Never expires</option>
                <option value="7days">Expires in 7 days</option>
                <option value="30days">Expires in 30 days</option>
                <option value="90days">Expires in 90 days</option>
                {userData?.shareLinkSettings?.expiresAt && (
                  <option value="expired">
                    {new Date(userData.shareLinkSettings.expiresAt) < new Date() 
                      ? 'Expired - Remove expiry' 
                      : `Current: ${new Date(userData.shareLinkSettings.expiresAt).toLocaleDateString()}`}
                  </option>
                )}
              </select>
              {userData?.shareLinkSettings?.expiresAt && new Date(userData.shareLinkSettings.expiresAt) < new Date() && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  ⚠️ Your link has expired. Select "Expired - Remove expiry" above and save to fix this.
                </p>
              )}
              {userData?.shareLinkSettings?.expiresAt && (
                <p className="mt-2 text-sm text-gray-500">
                  Link expires on: {new Date(userData.shareLinkSettings.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* OTP Info */}
            {userData?.shareLinkSettings?.accessType === 'otp' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Key className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">OTP Protection</h4>
                    <p className="text-sm text-gray-600">
                      Visitors will need to request and enter a 6-digit OTP sent via email to access your profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: What to Share */}
      {userData?.isPublicProfile && activeStep >= 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">What to Share</h3>
              <p className="text-sm text-gray-600">Choose which information is visible</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Blood Type */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Blood Type</h4>
                  <p className="text-sm text-gray-500">Essential for emergency situations</p>
                </div>
              </div>
              <button
                onClick={() => handleFieldToggle('bloodType')}
                disabled={updatePrivacyMutation.isPending}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                } ${userData?.publicFields?.includes('bloodType') ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                    userData?.publicFields?.includes('bloodType') ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Allergies */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Allergies</h4>
                  <p className="text-sm text-gray-500">Critical for medical treatment</p>
                </div>
              </div>
              <button
                onClick={() => handleFieldToggle('allergies')}
                disabled={updatePrivacyMutation.isPending}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                } ${userData?.publicFields?.includes('allergies') ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                    userData?.publicFields?.includes('allergies') ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Emergency Contact */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
                  <p className="text-sm text-gray-500">Contact information for emergencies</p>
                </div>
              </div>
              <button
                onClick={() => handleFieldToggle('emergencyContact')}
                disabled={updatePrivacyMutation.isPending}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                } ${userData?.publicFields?.includes('emergencyContact') ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
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
        <div className="bg-green-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Profile</span>
            </a>
            <button 
              onClick={() => setQrModalOpen(true)}
              disabled={updatePrivacyMutation.isPending}
              className={`flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium ${
                updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Generate QR Code</span>
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'My Health Profile', text: 'Access my health information', url: shareUrl }).catch(() => {});
                } else {
                  copyShareLink();
                }
              }}
              disabled={updatePrivacyMutation.isPending}
              className={`flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium ${
                updatePrivacyMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
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

// Password Input Component
function PasswordInput({ onUpdate, currentPassword }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await onUpdate(password);
      setPassword('');
      setConfirmPassword('');
      toast.success('Share link password updated');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove password protection?')) {
      onUpdate('');
      toast.success('Password protection removed');
    }
  };

  return (
    <div className="space-y-4">
      {currentPassword && (
        <div className="flex items-center justify-between p-2 bg-white rounded border">
          <span className="text-sm text-gray-600">Password is set</span>
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </button>
        </div>
      )}
      
      {!currentPassword && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Set Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Confirm password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Setting...' : 'Set Password'}
          </button>
        </form>
      )}
    </div>
  );
}
