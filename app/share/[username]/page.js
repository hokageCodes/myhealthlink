'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, 
  Heart, 
  Phone, 
  Calendar, 
  Shield, 
  AlertTriangle,
  Download,
  Share2,
  QrCode
} from 'lucide-react';
import Image from 'next/image';

export default function PublicProfilePage() {
  const params = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/public/profile/${params.username}`);
        const result = await response.json();
        
        if (result.success) {
          setProfileData(result.data);
        } else {
          setError(result.message || 'Profile not found');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (params.username) {
      fetchPublicProfile();
    }
  }, [params.username]);

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

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">{error || 'This profile does not exist or is not public.'}</p>
        </div>
      </div>
    );
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
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                {profileData.profilePicture ? (
                  <Image
                    src={profileData.profilePicture}
                    alt={profileData.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profileData.name}</h1>
                <p className="text-blue-100 mt-1">
                  {new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear()} years old
                </p>
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
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      DOB: {new Date(profileData.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 capitalize">Gender: {profileData.gender}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </button>
                <button className="flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR Code
                </button>
                <button className="flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Download Info
                </button>
              </div>
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
