'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Share2, 
  Copy, 
  User, 
  Heart, 
  Shield, 
  Phone,
  Lock,
  Key,
  AlertTriangle,
  Calendar,
  Pill
} from 'lucide-react';
import Image from 'next/image';
import { shareAPI } from '@/lib/api/share';
import toast from 'react-hot-toast';

export default function PublicSharePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username;
  const accessToken = searchParams.get('token');
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [accessType, setAccessType] = useState(null);
  
  // Auth states
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPublicProfile = useCallback(async (token = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const tokenToUse = token || accessToken;
      console.log('Fetching public profile for:', username, 'with token:', tokenToUse);
      const { response, result } = await shareAPI.getPublicProfile(username, tokenToUse);
      
      console.log('Response status:', response.status);
      console.log('Result:', result);
      
      if (response.ok && result.success) {
        setProfileData(result.data);
        setRequiresAuth(false);
        setAccessType(null);
      } else if (response.status === 401 && result.requiresAuth) {
        console.log('Authentication required:', result.accessType);
        setRequiresAuth(true);
        setAccessType(result.accessType);
      } else {
        console.error('Error response:', result);
        setError(result.message || 'Failed to load profile');
        setRequiresAuth(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [username, accessToken]);

  useEffect(() => {
    if (username) {
      fetchPublicProfile();
    }
  }, [username, fetchPublicProfile]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      console.log('🔐 Submitting password for username:', username);
      const { response, result } = await shareAPI.verifyPassword(username, password);
      
      console.log('✅ Password verify complete:', {
        status: response.status,
        success: result.success,
        message: result.message,
        token: result.token ? '✓' : '✗'
      });
      
      if (response.ok && result.success) {
        toast.success('Access granted!');
        // Update URL with token without reload
        const newUrl = `${window.location.pathname}?token=${result.token}`;
        console.log('🔄 Updating URL:', newUrl);
        window.history.replaceState(null, '', newUrl);
        // Fetch profile with token
        await fetchPublicProfile(result.token);
      } else {
        console.error('❌ Password verification failed:', result);
        toast.error(result.message || 'Invalid password');
        setError(result.message || 'Invalid password');
      }
    } catch (err) {
      console.error('❌ Password verify error:', err);
      toast.error(err.message || 'Failed to verify password');
      setError(err.message || 'Failed to verify password');
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const { response, result } = await shareAPI.requestOTP(username, email || null);
      
      console.log('OTP request response:', response.status, result);
      
      if (response.ok && result.success) {
        toast.success(result.message || 'OTP sent successfully');
        setOtpRequested(true);
        setError(null);
      } else {
        toast.error(result.message || 'Failed to send OTP');
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP request error:', err);
      toast.error(err.message || 'Failed to request OTP');
      setError(err.message || 'Failed to request OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const { response, result } = await shareAPI.verifyOTP(username, otp);
      
      console.log('OTP verify response:', response.status, result);
      
      if (response.ok && result.success) {
        toast.success('Access granted!');
        // Update URL with token without reload
        const newUrl = `${window.location.pathname}?token=${result.token}`;
        window.history.replaceState(null, '', newUrl);
        // Fetch profile with token
        await fetchPublicProfile(result.token);
      } else {
        toast.error(result.message || 'Invalid OTP');
        setError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      toast.error(err.message || 'Failed to verify OTP');
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData?.name || 'Shared'} Health Profile`,
          text: 'View this health profile',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !requiresAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Available</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Password Auth Form
  if (requiresAuth && accessType === 'password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Protected Health Profile</h1>
            <p className="text-gray-600">Please enter the password to view this profile</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifying ? 'Verifying...' : 'View Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // OTP Auth Form
  if (requiresAuth && accessType === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Protected Health Profile</h1>
            <p className="text-gray-600">Request an OTP to view this profile</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!otpRequested ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {verifying ? 'Requesting...' : 'Request OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button
                type="button"
                onClick={() => setOtpRequested(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Request new OTP
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Profile Display
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data</h1>
          <p className="text-gray-600">Profile information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Profile</h1>
              <p className="text-gray-600">Shared health information</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden relative">
                {profileData.profilePicture ? (
                  <Image
                    src={profileData.profilePicture}
                    alt={profileData.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profileData.name}</h1>
                {profileData.dateOfBirth && (
                  <p className="text-green-100 mt-1">
                    Age: {new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear()} years
                  </p>
                )}
                {profileData.gender && (
                  <p className="text-green-100 mt-1 capitalize">{profileData.gender}</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-6 space-y-6">
            {/* Blood Type */}
            {profileData.bloodType && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Heart className="h-6 w-6 text-red-600 mr-2" />
                  <h2 className="text-xl font-bold text-red-900">Blood Type</h2>
                </div>
                <p className="text-2xl font-bold text-red-900">{profileData.bloodType}</p>
              </div>
            )}

            {/* Genotype */}
            {profileData.genotype && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Heart className="h-6 w-6 text-yellow-600 mr-2" />
                  <h2 className="text-xl font-bold text-yellow-900">Genotype</h2>
                </div>
                <p className="text-2xl font-bold text-yellow-900">{profileData.genotype}</p>
              </div>
            )}

            {/* Age */}
            {profileData.dateOfBirth && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                  <h2 className="text-xl font-bold text-purple-900">Age</h2>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {(() => {
                    const birthDate = new Date(profileData.dateOfBirth);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }
                    return age;
                  })()} years old
                </p>
              </div>
            )}

            {/* Allergies */}
            {profileData.allergies && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Shield className="h-6 w-6 text-orange-600 mr-2" />
                  <h2 className="text-xl font-bold text-orange-900">Allergies & Reactions</h2>
                </div>
                <p className="text-orange-900 text-lg leading-relaxed">{profileData.allergies}</p>
              </div>
            )}

            {/* Current Medications */}
            {profileData.currentMedications && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Pill className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-bold text-indigo-900">Current Medications</h2>
                </div>
                <p className="text-indigo-900 text-lg leading-relaxed whitespace-pre-line">{profileData.currentMedications}</p>
              </div>
            )}

            {/* Emergency Contact */}
            {profileData.emergencyContact && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Phone className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-blue-900">Emergency Contact</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-700 font-semibold mb-1">Contact Name</p>
                    <p className="text-lg font-bold text-blue-900">{profileData.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-semibold mb-1">Phone Number</p>
                    <a 
                      href={`tel:${profileData.emergencyContact.phone}`}
                      className="text-lg font-bold text-blue-900 hover:text-blue-700"
                    >
                      {profileData.emergencyContact.phone}
                    </a>
                  </div>
                  {profileData.emergencyContact.relationship && (
                    <div>
                      <p className="text-sm text-blue-700 font-semibold mb-1">Relationship</p>
                      <p className="text-lg font-semibold text-blue-900">{profileData.emergencyContact.relationship}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>This information is shared securely with authorized access only.</p>
        </div>
      </div>
    </div>
  );
}