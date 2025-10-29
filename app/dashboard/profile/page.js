'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Heart,
  Camera,
  Save,
  Edit3,
  Check
} from 'lucide-react';
import { authAPI } from '@/lib/api/auth';
import Image from 'next/image';

// Profile validation schema
const profileSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^(\+234|0)?[789][01]\d{8}$/, 'Invalid Nigerian phone number')
    .required('Phone number is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Please select a valid gender')
    .required('Gender is required'),
  bloodType: Yup.string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '', null], 'Invalid blood type'),
  allergies: Yup.string()
    .max(500, 'Allergies description cannot exceed 500 characters'),
  emergencyContact: Yup.object({
    name: Yup.string().max(50, 'Emergency contact name cannot exceed 50 characters'),
    phone: Yup.string().matches(/^(\+234|0)?[789][01]\d{8}$/, 'Invalid Nigerian phone number'),
    relationship: Yup.string().max(30, 'Relationship cannot exceed 30 characters'),
  }),
});

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await authAPI.profile.get(token);
    },
    staleTime: Infinity,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await authAPI.profile.update(token, profileData);
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      dateOfBirth: userData?.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
      gender: userData?.gender || '',
      bloodType: userData?.bloodType || '',
      allergies: userData?.allergies || '',
      emergencyContact: {
        name: userData?.emergencyContact?.name || '',
        phone: userData?.emergencyContact?.phone || '',
        relationship: userData?.emergencyContact?.relationship || '',
      },
    },
    validationSchema: profileSchema,
    onSubmit: (values) => {
      updateProfileMutation.mutate(values);
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Upload to server immediately
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No token');
        
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/profile/upload-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success('Profile picture uploaded successfully!');
          // Refresh user data to get the new profile picture URL
          queryClient.invalidateQueries(['userProfile']);
        } else {
          toast.error(result.message || 'Failed to upload profile picture');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload profile picture');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-2 -mx-2 py-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your information</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? 'bg-gray-100 text-gray-700'
                : 'bg-gray-900 text-white'
            }`}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditing ? 'Done' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isEditing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="space-y-4 lg:space-y-6">

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Profile Photo Section */}
        <div className="bg-white rounded-xl lg:rounded-lg border border-gray-100 lg:border-gray-200 p-4 lg:p-6">
          {/* Mobile Layout */}
          <div className="lg:hidden text-center">
            <div className="relative inline-block">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mx-auto relative">
  {profileImage ? (
    <Image
      src={URL.createObjectURL(profileImage)}
      alt="Profile"
      fill
      className="object-cover"
      sizes="80px"
    />
  ) : userData?.profilePicture ? (
    <Image
      src={userData.profilePicture}
      alt="Profile"
      fill
      className="object-cover"
      sizes="80px"
    />
  ) : (
    <User className="w-10 h-10 text-gray-400" />
  )}
</div>

              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full cursor-pointer">
                  <Camera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-3">
              {userData?.name || 'User'}
            </h3>
            <p className="text-sm text-gray-500">{userData?.email || 'user@example.com'}</p>
            {isEditing && (
              <p className="text-xs text-gray-400 mt-1">Tap camera icon to change photo</p>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden relative">
  {profileImage ? (
    <Image
      src={URL.createObjectURL(profileImage)}
      alt="Profile"
      fill
      className="object-cover"
      sizes="96px"
    />
  ) : userData?.profilePicture ? (
    <Image
      src={userData.profilePicture}
      alt="Profile"
      fill
      className="object-cover"
      sizes="96px"
    />
  ) : (
    <User className="w-12 h-12 text-gray-400" />
  )}
</div>

              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {userData?.name || 'User'}
              </h3>
              <p className="text-gray-500">{userData?.email || 'user@example.com'}</p>
              {isEditing && (
                <p className="text-sm text-gray-400 mt-1">Click camera icon to change photo</p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl lg:rounded-lg border border-gray-100 lg:border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold lg:font-medium text-gray-900 mb-4 lg:mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...formik.getFieldProps('name')}
                  className="w-full px-3 py-3 lg:py-2 border border-gray-200 lg:border-gray-300 rounded-xl lg:rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors text-base lg:text-sm"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{userData?.name || 'Not provided'}</span>
                </div>
              )}
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{userData?.email || 'Not provided'}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  {...formik.getFieldProps('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{userData?.phone || 'Not provided'}</span>
                </div>
              )}
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  {...formik.getFieldProps('dateOfBirth')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
                </div>
              )}
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.dateOfBirth}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              {isEditing ? (
                <select
                  {...formik.getFieldProps('gender')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{userData?.gender || 'Not provided'}</span>
                </div>
              )}
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.gender}</p>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-xl lg:rounded-lg border border-gray-100 lg:border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold lg:font-medium text-gray-900 mb-4 lg:mb-6">Medical Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              {isEditing ? (
                <select
                  {...formik.getFieldProps('bloodType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Heart className="w-4 h-4 text-gray-400" />
                  <span>{userData?.bloodType || 'Not provided'}</span>
                </div>
              )}
              {formik.touched.bloodType && formik.errors.bloodType && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.bloodType}</p>
              )}
            </div>

            {/* Allergies */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              {isEditing ? (
                <textarea
                  {...formik.getFieldProps('allergies')}
                  rows={3}
                  placeholder="List any allergies or reactions to medications..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors resize-none"
                />
              ) : (
                <div className="text-gray-900">
                  <p>{userData?.allergies || 'No known allergies'}</p>
                </div>
              )}
              {formik.touched.allergies && formik.errors.allergies && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.allergies}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl lg:rounded-lg border border-gray-100 lg:border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold lg:font-medium text-gray-900 mb-4 lg:mb-6">Emergency Contact</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Emergency Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...formik.getFieldProps('emergencyContact.name')}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{userData?.emergencyContact?.name || 'Not provided'}</span>
                </div>
              )}
              {formik.touched.emergencyContact?.name && formik.errors.emergencyContact?.name && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.emergencyContact.name}</p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  {...formik.getFieldProps('emergencyContact.phone')}
                  placeholder="Phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{userData?.emergencyContact?.phone || 'Not provided'}</span>
                </div>
              )}
              {formik.touched.emergencyContact?.phone && formik.errors.emergencyContact?.phone && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.emergencyContact.phone}</p>
              )}
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...formik.getFieldProps('emergencyContact.relationship')}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>{userData?.emergencyContact?.relationship || 'Not provided'}</span>
                </div>
              )}
              {formik.touched.emergencyContact?.relationship && formik.errors.emergencyContact?.relationship && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.emergencyContact.relationship}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="px-4 lg:px-0 pb-6 lg:pb-0">
            <div className="flex justify-center lg:justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 lg:py-2 rounded-xl lg:rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base lg:text-sm font-medium w-full lg:w-auto justify-center"
              >
                <Save className="w-5 h-5 lg:w-4 lg:h-4" />
                <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}
