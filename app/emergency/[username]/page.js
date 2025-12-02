'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  User, 
  Heart, 
  AlertTriangle,
  Shield,
  Phone,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import { emergencyAPI } from '@/lib/api/emergency';

export default function EmergencyProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmergencyProfile = async () => {
      try {
        setLoading(true);
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Emergency access token is required');
          setLoading(false);
          return;
        }

        const result = await emergencyAPI.getEmergencyProfile(params.username, token);
        
        if (result.success) {
          setProfileData(result.data);
        } else {
          setError(result.message || 'Failed to load emergency profile');
        }
      } catch (err) {
        setError(err.message || 'Failed to load emergency profile');
      } finally {
        setLoading(false);
      }
    };

    if (params.username) {
      fetchEmergencyProfile();
    }
  }, [params.username, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading emergency information</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error?.includes('token') || error?.includes('Invalid') ? 'Access Denied' : 'Emergency Profile Not Available'}
          </h1>
          <p className="text-gray-600">{error || 'This emergency profile is not available.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
              <div>
                <h1 className="text-xl font-bold">EMERGENCY ACCESS</h1>
                <p className="text-red-100 text-sm">Critical Health Information</p>
              </div>
            </div>
            {profileData.triggeredAt && (
              <div className="text-right">
                <p className="text-xs text-red-100">Activated</p>
                <p className="text-sm font-semibold">
                  {new Date(profileData.triggeredAt).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-red-200">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
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
                  <p className="text-red-100 mt-1">
                    Age: {new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear()} years
                  </p>
                )}
                {profileData.bloodType && (
                  <p className="text-red-100 mt-1 font-semibold">
                    Blood Type: {profileData.bloodType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Critical Information */}
          <div className="p-6 space-y-6">
            {/* Emergency Contact - ALWAYS SHOW FIRST */}
            {profileData.emergencyContact && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Phone className="h-6 w-6 text-red-600 mr-2" />
                  <h2 className="text-xl font-bold text-red-900">EMERGENCY CONTACT</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-red-700 font-semibold mb-1">Contact Name</p>
                    <p className="text-lg font-bold text-red-900">{profileData.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700 font-semibold mb-1">Phone Number</p>
                    <a 
                      href={`tel:${profileData.emergencyContact.phone}`}
                      className="text-lg font-bold text-red-900 hover:text-red-700"
                    >
                      {profileData.emergencyContact.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-red-700 font-semibold mb-1">Relationship</p>
                    <p className="text-lg font-semibold text-red-900">{profileData.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Allergies - CRITICAL */}
            {profileData.allergies && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
                  <h2 className="text-xl font-bold text-orange-900">ALLERGIES & REACTIONS</h2>
                </div>
                <p className="text-lg font-semibold text-orange-900">{profileData.allergies}</p>
              </div>
            )}

            {/* Blood Type */}
            {profileData.bloodType && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-2">
                  <Heart className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-red-900">Blood Type</h3>
                </div>
                <p className="text-2xl font-bold text-red-900">{profileData.bloodType}</p>
              </div>
            )}

            {/* Chronic Conditions */}
            {profileData.chronicConditions && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-900">Chronic Conditions</h3>
                </div>
                <p className="text-yellow-900">{profileData.chronicConditions}</p>
              </div>
            )}

            {/* Location if available */}
            {profileData.location && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-900">Last Known Location</h3>
                </div>
                {profileData.location.address && (
                  <p className="text-blue-900 mb-2">{profileData.location.address}</p>
                )}
                {profileData.location.latitude && profileData.location.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${profileData.location.latitude},${profileData.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    View on Map
                  </a>
                )}
              </div>
            )}

            {/* Event Info */}
            {profileData.eventId && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Emergency activated on {new Date(profileData.triggeredAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>This information is provided for emergency medical purposes only.</p>
          <p className="mt-1">Valid for 48 hours from activation.</p>
        </div>
      </div>
    </div>
  );
}

