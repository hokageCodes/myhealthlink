'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Edit3,
  User,
  Phone,
  Mail,
  Calendar,
  Droplets,
  AlertTriangle,
  Pill,
  Shield,
  Share,
  QrCode
} from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Set form values
        Object.keys(data.user).forEach(key => {
          if (data.user[key] !== null && data.user[key] !== undefined) {
            setValue(key, data.user[key]);
          }
        });
      } else if (response.status === 401) {
        // Token is invalid, clear it and redirect to login
        localStorage.removeItem('accessToken');
        router.push('/login');
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result.user);
        toast.success('Profile updated successfully!');
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addAllergy = () => {
    const currentAllergies = watch('allergies') || [];
    setValue('allergies', [...currentAllergies, { allergen: '', severity: 'mild', notes: '' }]);
  };

  const removeAllergy = (index) => {
    const currentAllergies = watch('allergies') || [];
    setValue('allergies', currentAllergies.filter((_, i) => i !== index));
  };

  const addCondition = () => {
    const currentConditions = watch('chronicConditions') || [];
    setValue('chronicConditions', [...currentConditions, { condition: '', diagnosedDate: '', status: 'active', notes: '' }]);
  };

  const removeCondition = (index) => {
    const currentConditions = watch('chronicConditions') || [];
    setValue('chronicConditions', currentConditions.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    const currentMedications = watch('medications') || [];
    setValue('medications', [...currentMedications, { name: '', dosage: '', frequency: '', startDate: '', prescribedBy: '', notes: '' }]);
  };

  const removeMedication = (index) => {
    const currentMedications = watch('medications') || [];
    setValue('medications', currentMedications.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Please log in to access your profile.</p>
          <Link href="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">MyHealthLink</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="btn btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  Profile Completion: {user.profileCompletion}%
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${user.profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'medical', label: 'Medical Info', icon: Droplets },
                { id: 'medications', label: 'Medications', icon: Pill },
                { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
                { id: 'privacy', label: 'Privacy', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className="input w-full"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      {...register('dateOfBirth', { required: 'Date of birth is required' })}
                      className="input w-full"
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      {...register('gender', { required: 'Gender is required' })}
                      className="input w-full"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="input w-full bg-gray-50"
                      />
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={user.phone}
                        disabled
                        className="input w-full bg-gray-50"
                      />
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Phone cannot be changed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Information Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type
                    </label>
                    <select
                      {...register('bloodType')}
                      className="input w-full"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genotype
                    </label>
                    <select
                      {...register('genotype')}
                      className="input w-full"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="AA">AA</option>
                      <option value="AS">AS</option>
                      <option value="SS">SS</option>
                      <option value="AC">AC</option>
                      <option value="SC">SC</option>
                      <option value="CC">CC</option>
                    </select>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900">Allergies</h3>
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="btn btn-outline text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Allergy
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(watch('allergies') || []).map((allergy, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Allergen
                            </label>
                            <input
                              type="text"
                              {...register(`allergies.${index}.allergen`)}
                              className="input w-full"
                              placeholder="e.g., Peanuts"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Severity
                            </label>
                            <select
                              {...register(`allergies.${index}.severity`)}
                              className="input w-full"
                            >
                              <option value="mild">Mild</option>
                              <option value="moderate">Moderate</option>
                              <option value="severe">Severe</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeAllergy(index)}
                              className="btn btn-outline text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            {...register(`allergies.${index}.notes`)}
                            className="input w-full"
                            rows={2}
                            placeholder="Additional details about this allergy"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900">Chronic Conditions</h3>
                    <button
                      type="button"
                      onClick={addCondition}
                      className="btn btn-outline text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(watch('chronicConditions') || []).map((condition, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Condition
                            </label>
                            <input
                              type="text"
                              {...register(`chronicConditions.${index}.condition`)}
                              className="input w-full"
                              placeholder="e.g., Diabetes Type 2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Diagnosed Date
                            </label>
                            <input
                              type="date"
                              {...register(`chronicConditions.${index}.diagnosedDate`)}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              {...register(`chronicConditions.${index}.status`)}
                              className="input w-full"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="managed">Managed</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between">
                          <div className="flex-1 mr-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              {...register(`chronicConditions.${index}.notes`)}
                              className="input w-full"
                              rows={2}
                              placeholder="Additional details about this condition"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeCondition(index)}
                              className="btn btn-outline text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === 'medications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Current Medications</h2>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="btn btn-outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(watch('medications') || []).map((medication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medication Name
                          </label>
                          <input
                            type="text"
                            {...register(`medications.${index}.name`)}
                            className="input w-full"
                            placeholder="e.g., Metformin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            {...register(`medications.${index}.dosage`)}
                            className="input w-full"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            {...register(`medications.${index}.frequency`)}
                            className="input w-full"
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prescribed By
                          </label>
                          <input
                            type="text"
                            {...register(`medications.${index}.prescribedBy`)}
                            className="input w-full"
                            placeholder="e.g., Dr. Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            {...register(`medications.${index}.startDate`)}
                            className="input w-full"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="btn btn-outline text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          {...register(`medications.${index}.notes`)}
                          className="input w-full"
                          rows={2}
                          placeholder="Additional notes about this medication"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contact Tab */}
            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      {...register('emergencyContact.name')}
                      className="input w-full"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('emergencyContact.phone')}
                      className="input w-full"
                      placeholder="+2348012345678"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      {...register('emergencyContact.relationship')}
                      className="input w-full"
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Share Profile</h3>
                      <p className="text-sm text-gray-600">Allow others to view your health profile via link</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('privacySettings.shareProfile')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Require Passcode</h3>
                      <p className="text-sm text-gray-600">Add extra security with a passcode for profile access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('privacySettings.requirePasscode')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {watch('privacySettings.requirePasscode') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passcode
                      </label>
                      <input
                        type="password"
                        {...register('privacySettings.passcode')}
                        className="input w-full"
                        placeholder="Enter passcode"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Share Profile Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Share Your Profile</h2>
              <p className="text-sm text-gray-600">Generate QR codes and share your health information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/share">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <QrCode className="w-5 h-5" />
                <span>Generate QR Code</span>
              </motion.button>
            </Link>

            <Link href="/dashboard/share">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full border border-blue-600 text-blue-600 px-6 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Share className="w-5 h-5" />
                <span>Share Profile</span>
              </motion.button>
            </Link>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-900 mb-1">Privacy Notice</h3>
                <p className="text-sm text-yellow-800">
                  Only share your profile with trusted healthcare providers and emergency contacts. 
                  Your profile contains sensitive medical information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

