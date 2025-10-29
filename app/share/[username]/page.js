'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  User, 
  Heart, 
  Phone, 
  Calendar, 
  Shield, 
  AlertTriangle,
  Download,
  Share2,
  QrCode,
  Lock,
  Key,
  Mail,
  Check
} from 'lucide-react';
import Image from 'next/image';
import { shareAPI } from '@/lib/api/share';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  
  // Password auth state
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // OTP auth state
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Check for token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAccessToken(token);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const result = await shareAPI.getPublicProfile(params.username, accessToken);
        
        if (result.success) {
          setProfileData(result.data);
          setRequiresAuth(false);
        }
      } catch (err) {
        const errorMessage = err.message || 'Failed to load profile';
        setError(errorMessage);
        
        // Check if authentication is required
        try {
          const errorResponse = await shareAPI.getPublicProfile(params.username);
          // If it throws, check the response structure
          if (err.toString().includes('requiresAuth') || errorMessage.includes('Password') || errorMessage.includes('OTP')) {
            setRequiresAuth(true);
            // Try to determine access type from error message
            if (errorMessage.includes('Password')) {
              setAccessType('password');
            } else if (errorMessage.includes('OTP')) {
              setAccessType('otp');
            }
          }
        } catch (fetchError) {
          // Parse the fetch error response if possible
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/public/profile/${params.username}`);
            const result = await response.json();
            
            if (result.requiresAuth) {
              setRequiresAuth(true);
              setAccessType(result.accessType);
              setError(result.message);
            } else {
              setError(result.message || 'Profile not found');
            }
          } catch {
            setError(errorMessage);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.username) {
      fetchPublicProfile();
    }
  }, [params.username, accessToken]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    try {
      const result = await shareAPI.verifyPassword(params.username, password);
      
      if (result.success && result.token) {
        setAccessToken(result.token);
        // Reload page with token
        window.location.href = `${window.location.pathname}?token=${result.token}`;
      }
    } catch (err) {
      setPasswordError(err.message || 'Incorrect password');
      toast.error(err.message || 'Failed to verify password');
    }
  };

  const handleRequestOTP = async () => {
    setOtpLoading(true);
    setOtpError('');

    try {
      const result = await shareAPI.requestOTP(params.username);
      setOtpRequested(true);
      
      // In development, show OTP in toast
      if (result.otp) {
        toast.success(`OTP: ${result.otp} (development mode)`);
      } else {
        toast.success('OTP sent! Check your email.');
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to request OTP');
      toast.error(err.message || 'Failed to request OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const result = await shareAPI.verifyOTP(params.username, otp);
      
      if (result.success && result.token) {
        setAccessToken(result.token);
        // Reload page with token
        window.location.href = `${window.location.pathname}?token=${result.token}`;
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP');
      toast.error(err.message || 'Failed to verify OTP');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Authentication required state
  if (requiresAuth && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {accessType === 'password' ? (
                <Lock className="w-8 h-8 text-blue-600" />
              ) : (
                <Key className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {accessType === 'password' ? 'Password Required' : 'OTP Verification Required'}
            </h1>
            <p className="text-gray-600">
              {accessType === 'password' 
                ? 'This profile is password protected. Please enter the password to continue.'
                : 'This profile requires OTP verification. Please request and enter the OTP to continue.'}
            </p>
          </div>

          {/* Password Form */}
          {accessType === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                  required
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Access Profile
              </button>
            </form>
          )}

          {/* OTP Form */}
          {accessType === 'otp' && (
            <div className="space-y-4">
              {!otpRequested ? (
                <button
                  onClick={handleRequestOTP}
                  disabled={otpLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {otpLoading ? 'Requesting...' : 'Request OTP'}
                </button>
              ) : (
                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest ${
                        otpError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    {otpError && (
                      <p className="mt-1 text-sm text-red-600">{otpError}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Check your email for the 6-digit code
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={otpLoading}
                    className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state (not auth-related)
  if (error && !requiresAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error.includes('expired') ? 'Link Expired' : 'Profile Not Found'}
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Profile display
  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MyHealthLink</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Shared Profile</span>
              {accessToken && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <Check className="w-3 h-3 inline mr-1" />
                  Protected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
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
                  <p className="text-blue-100 mt-1">
                    {new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear()} years old
                  </p>
                )}
                {profileData.bloodType && (
                  <p className="text-blue-100 mt-1">Blood Type: {profileData.bloodType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6 space-y-6">
            {/* Emergency Contact */}
            {profileData.emergencyContact && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <h2 className="text-xl font-semibold text-red-900">Emergency Contact</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Contact Name</p>
                    <p className="text-red-900 font-semibold">{profileData.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-600 font-medium">Phone</p>
                    <p className="text-red-900 font-semibold">{profileData.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-600 font-medium">Relationship</p>
                    <p className="text-red-900 font-semibold">{profileData.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allergies */}
              {profileData.allergies && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <Shield className="h-5 w-5 text-orange-600 mr-2" />
                    <h3 className="text-lg font-semibold text-orange-900">Allergies</h3>
                  </div>
                  <p className="text-orange-800">{profileData.allergies}</p>
                </div>
              )}

              {/* Basic Info */}
              {profileData.dateOfBirth && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">
                        DOB: {new Date(profileData.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                    {profileData.gender && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700 capitalize">Gender: {profileData.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600">
        <p className="text-sm">
          This profile was shared via MyHealthLink - One Link for Your Health
        </p>
      </div>
    </div>
  );
}
