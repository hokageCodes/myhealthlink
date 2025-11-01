'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Heart,
  Camera,
  Save,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { authAPI } from '@/lib/api/auth';

/**
 * Profile page — improved UX and layout
 *
 * Notes:
 * - Expects authAPI.profile.get(token) and authAPI.profile.update(token, data).
 * - Upload endpoint used: `${NEXT_PUBLIC_API_URL}/profile/upload-picture` (same as you had).
 * - Uses local preview for immediate feedback and revokes URL to avoid memory leaks.
 */

const phoneRegex = /^(\+234|0)?[789][01]\d{8}$/;

const ProfileSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').max(50).required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(phoneRegex, 'Invalid Nigerian phone number').required('Phone number is required'),
  dateOfBirth: Yup.date().max(new Date(), 'Date cannot be in the future').required('Date of birth is required'),
  gender: Yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
  bloodType: Yup.string().oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], 'Invalid blood type'),
  allergies: Yup.string().max(500, 'Allergies cannot exceed 500 characters'),
  emergencyContact: Yup.object().shape({
    name: Yup.string().max(50, 'Name too long'),
    phone: Yup.string().matches(phoneRegex, 'Invalid Nigerian phone number'),
    relationship: Yup.string().max(30, 'Too long'),
  }),
});

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [localImage, setLocalImage] = useState(null); // File
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null); // blob url
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortUploadRef = useRef(null);

  // Get user profile from cache (layout fetches it)
  const userData = queryClient.getQueryData(['userProfile']);
  const isLoading = !userData;

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await authAPI.profile.update(token, values);
    },
    onSuccess: () => {
      toast.success('Profile updated');
      setIsEditing(false);
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update profile');
    },
  });

  // Formik setup
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
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      updateProfile.mutate(values);
    },
  });

  // Manage local preview URL lifecycle
  useEffect(() => {
    if (!localImage) return;
    const url = URL.createObjectURL(localImage);
    setLocalPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setLocalPreviewUrl(null);
    };
  }, [localImage]);

  // Reset local image preview when userData updates (successful upload)
  useEffect(() => {
    if (!userData?.profilePicture) return;
    setLocalImage(null);
    setLocalPreviewUrl(null);
    setUploadProgress(0);
  }, [userData?.profilePicture]);

  const handleStartEditing = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    formik.resetForm();
    // clear any selected image preview
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalImage(null);
    setLocalPreviewUrl(null);
    setUploadProgress(0);
    // abort upload if in progress
    if (abortUploadRef.current) {
      abortUploadRef.current.abort();
      abortUploadRef.current = null;
    }
  };

  // Upload image and refresh profile
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic client-side validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    // optional size limit (e.g., 5MB)
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxMB}MB`);
      return;
    }

    setLocalImage(file);
    // perform upload
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${API_URL}/profile/upload-picture`;
      const formData = new FormData();
      formData.append('profilePicture', file);

      // use fetch with AbortController to track progress — fetch doesn't support progress natively.
      // So we use XMLHttpRequest here for progress events.
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        abortUploadRef.current = xhr;
        xhr.open('POST', url);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };
        xhr.onload = () => {
          abortUploadRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText);
              if (resp.success) {
                toast.success('Profile picture uploaded');
                queryClient.invalidateQueries(['userProfile']);
                resolve(resp);
              } else {
                toast.error(resp.message || 'Upload failed');
                reject(new Error(resp.message || 'Upload failed'));
              }
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => {
          abortUploadRef.current = null;
          reject(new Error('Upload failed'));
        };
        xhr.onabort = () => {
          abortUploadRef.current = null;
          reject(new Error('Upload aborted'));
        };
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error?.message || 'Failed to upload image');
      setUploadProgress(0);
      setLocalImage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600" aria-hidden />
        <span className="sr-only">Loading profile</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white -mx-2 md:-mx-0">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg p-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/pattern.svg')] opacity-10" />
  
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between relative z-10">
            <div className="flex items-center space-x-5">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
                  {localPreviewUrl ? (
                    <img src={localPreviewUrl} alt="Profile" className="object-cover w-full h-full" />
                  ) : userData?.profilePicture ? (
                    <Image
                      src={userData.profilePicture}
                      alt="Profile"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-white/10">
                      <UserIcon className="w-10 h-10 text-white/70" />
                    </div>
                  )}
                </div>
  
                {isEditing && (
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-white text-gray-900 p-2 rounded-full cursor-pointer shadow-md hover:scale-105 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                    <input id="profile-upload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                )}
              </div>
  
              <div>
                <h1 className="text-2xl font-semibold">{userData?.name || 'Your Name'}</h1>
                <p className="text-sm text-gray-100">{userData?.email || 'you@email.com'}</p>
                <p className="text-xs text-gray-200 mt-1">Keep your profile updated for a personalized experience</p>
              </div>
            </div>
  
            <div className="mt-6 sm:mt-0 flex items-center space-x-3">
                {!isEditing ? (
                <button
                  onClick={handleStartEditing}
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-lg font-medium shadow hover:bg-green-50 transition"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 border border-white/50 text-white px-5 py-2.5 rounded-lg hover:bg-white/10 transition"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={formik.submitForm}
                    disabled={updateProfile.isLoading}
                    className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-lg font-medium hover:bg-green-50 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {updateProfile.isLoading ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
  
      {/* Form Cards */}
      <form onSubmit={formik.handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-md shadow-md rounded-2xl p-6 space-y-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
            <div className="space-y-3 text-gray-700">
              <p><Mail className="inline w-4 h-4 mr-2 text-green-600" /> {userData?.email}</p>
              <p><Phone className="inline w-4 h-4 mr-2 text-green-600" /> {userData?.phone || 'N/A'}</p>
              <p><Calendar className="inline w-4 h-4 mr-2 text-green-600" /> {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
  
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-md border border-gray-100 shadow-md rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Example input */}
              <label>
                <span className="text-sm font-medium text-gray-700">Full Name</span>
                <input
                  name="name"
                  {...formik.getFieldProps('name')}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-lg px-3 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-green-500' : 'border-transparent bg-gray-50 text-gray-500'} transition`}
                />
              </label>
  
              <label>
                <span className="text-sm font-medium text-gray-700">Phone</span>
                <input
                  name="phone"
                  {...formik.getFieldProps('phone')}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-lg px-3 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-green-500' : 'border-transparent bg-gray-50 text-gray-500'} transition`}
                />
              </label>
            </div>
          </div>
  
          <div className="bg-white/70 backdrop-blur-md border border-gray-100 shadow-md rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label>
                <span className="text-sm font-medium text-gray-700">Name</span>
                <input
                  name="emergencyContact.name"
                  {...formik.getFieldProps('emergencyContact.name')}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-lg px-3 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-green-500' : 'border-transparent bg-gray-50 text-gray-500'} transition`}
                />
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">Phone</span>
                <input
                  name="emergencyContact.phone"
                  {...formik.getFieldProps('emergencyContact.phone')}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-lg px-3 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-green-500' : 'border-transparent bg-gray-50 text-gray-500'} transition`}
                />
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">Relationship</span>
                <input
                  name="emergencyContact.relationship"
                  {...formik.getFieldProps('emergencyContact.relationship')}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-lg px-3 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-green-500' : 'border-transparent bg-gray-50 text-gray-500'} transition`}
                />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
  
}
