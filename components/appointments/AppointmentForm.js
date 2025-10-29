'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AppointmentForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  doctors = [],
  locations = []
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    doctorId: initialData?.doctorId || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    duration: initialData?.duration || 30,
    location: initialData?.location || '',
    type: initialData?.type || 'checkup',
    notes: initialData?.notes || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    urgency: initialData?.urgency || 'normal'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample doctors data
  const defaultDoctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialization: 'General Medicine', available: true },
    { id: 2, name: 'Dr. Michael Smith', specialization: 'Cardiology', available: true },
    { id: 3, name: 'Dr. Emily Davis', specialization: 'Dermatology', available: false },
    { id: 4, name: 'Dr. Robert Wilson', specialization: 'Orthopedics', available: true },
  ];

  // Sample locations data
  const defaultLocations = [
    'Main Hospital - Building A',
    'Health Center - Downtown',
    'Clinic - Westside',
    'Emergency Department',
    'Lab Building - Floor 2'
  ];

  const doctorsToShow = doctors.length > 0 ? doctors : defaultDoctors;
  const locationsToShow = locations.length > 0 ? locations : defaultLocations;

  const appointmentTypes = [
    { value: 'checkup', label: 'General Checkup', icon: Stethoscope, color: 'text-green-600' },
    { value: 'followup', label: 'Follow-up', icon: FileText, color: 'text-blue-600' },
    { value: 'consultation', label: 'Consultation', icon: User, color: 'text-purple-600' },
    { value: 'emergency', label: 'Emergency', icon: AlertCircle, color: 'text-red-600' },
    { value: 'lab', label: 'Lab Tests', icon: FileText, color: 'text-orange-600' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Appointment title is required';
    }

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Cannot book appointments in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (formData.contactPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Invalid phone number';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableTimeSlots = () => {
    // Generate time slots from 8 AM to 6 PM
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-surface-200 shadow-sm max-w-2xl mx-auto"
    >
      <div className="p-6 border-b border-surface-200">
        <h2 className="text-xl font-semibold text-surface-900">
          {initialData ? 'Edit Appointment' : 'Book New Appointment'}
        </h2>
        <p className="text-surface-600 mt-1">
          Fill in the details below to schedule your appointment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Appointment Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.title ? 'border-red-500' : 'border-surface-300'}
            `}
            placeholder="e.g., Annual Checkup, Follow-up Visit"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Doctor Selection */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Select Doctor *
          </label>
          <select
            value={formData.doctorId}
            onChange={(e) => handleInputChange('doctorId', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.doctorId ? 'border-red-500' : 'border-surface-300'}
            `}
          >
            <option value="">Choose a doctor...</option>
            {doctorsToShow.map(doctor => (
              <option 
                key={doctor.id} 
                value={doctor.id}
                disabled={!doctor.available}
              >
                {doctor.name} - {doctor.specialization}
                {!doctor.available ? ' (Not Available)' : ''}
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <p className="text-red-500 text-sm mt-1">{errors.doctorId}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.date ? 'border-red-500' : 'border-surface-300'}
              `}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Time *
            </label>
            <select
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.time ? 'border-red-500' : 'border-surface-300'}
              `}
            >
              <option value="">Select time...</option>
              {getAvailableTimeSlots().map(time => (
                <option key={time} value={time}>
                  {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </option>
              ))}
            </select>
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time}</p>
            )}
          </div>
        </div>

        {/* Duration and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Location *
            </label>
            <select
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.location ? 'border-red-500' : 'border-surface-300'}
              `}
            >
              <option value="">Choose location...</option>
              {locationsToShow.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-3">
            Appointment Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {appointmentTypes.map(type => (
              <motion.label
                key={type.value}
                whileHover={{ scale: 1.02 }}
                className={`
                  flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors
                  ${formData.type === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-surface-300 hover:bg-surface-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="sr-only"
                />
                <type.icon className={`w-4 h-4 ${type.color}`} />
                <span className="text-sm font-medium text-surface-700">{type.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-3">
            Priority Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {urgencyLevels.map(level => (
              <motion.label
                key={level.value}
                whileHover={{ scale: 1.02 }}
                className={`
                  flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors
                  ${formData.urgency === level.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-surface-300 hover:bg-surface-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={level.value}
                  checked={formData.urgency === level.value}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${level.color}`}>
                  {level.label}
                </span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.contactPhone ? 'border-red-500' : 'border-surface-300'}
              `}
              placeholder="+1 (555) 123-4567"
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.contactEmail ? 'border-red-500' : 'border-surface-300'}
              `}
              placeholder="your.email@example.com"
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional information or concerns..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
          >
            Cancel
          </motion.button>
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center
              ${isSubmitting 
                ? 'bg-surface-300 text-surface-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Booking...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {initialData ? 'Update Appointment' : 'Book Appointment'}
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AppointmentForm;
