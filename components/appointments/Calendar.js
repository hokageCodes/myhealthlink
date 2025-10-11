'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  User,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Calendar = ({ 
  appointments = [], 
  onDateSelect, 
  onAppointmentClick,
  selectedDate = null,
  view = 'month' // month, week, day
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Check if date has appointments
  const hasAppointments = (date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  // Check if date is today
  const isToday = (date) => {
    return date && date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return selectedDate && date && date.toDateString() === selectedDate.toDateString();
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  // Sample appointments data
  const sampleAppointments = [
    {
      id: 1,
      title: 'Dr. Smith - Checkup',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      time: '10:00 AM',
      duration: 30,
      location: 'Main Hospital',
      type: 'checkup',
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'Dr. Johnson - Follow-up',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      time: '2:30 PM',
      duration: 45,
      location: 'Health Center',
      type: 'followup',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Lab Tests',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      time: '9:00 AM',
      duration: 60,
      location: 'Lab Building',
      type: 'lab',
      status: 'confirmed'
    }
  ];

  const appointmentsToShow = appointments.length > 0 ? appointments : sampleAppointments;

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-surface-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-surface-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-surface-600" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-surface-600" />
          </motion.button>
        </div>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 border-b border-surface-200">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-surface-600 bg-surface-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`
              min-h-[80px] p-2 border-r border-b border-surface-100 cursor-pointer transition-colors
              ${date ? 'hover:bg-surface-50' : 'bg-surface-50'}
              ${isToday(date) ? 'bg-blue-50 border-blue-200' : ''}
              ${isSelected(date) ? 'bg-blue-100 border-blue-300' : ''}
            `}
            onClick={() => date && handleDateClick(date)}
          >
            {date && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className={`
                    text-sm font-medium
                    ${isToday(date) ? 'text-blue-600' : 'text-surface-900'}
                    ${isSelected(date) ? 'text-blue-700' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  {hasAppointments(date) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                
                {/* Show appointments for this date */}
                <div className="space-y-1">
                  {getAppointmentsForDate(date).slice(0, 2).map(appointment => (
                    <motion.div
                      key={appointment.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(appointment);
                      }}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${appointment.type === 'checkup' ? 'bg-green-100 text-green-800' : ''}
                        ${appointment.type === 'followup' ? 'bg-blue-100 text-blue-800' : ''}
                        ${appointment.type === 'lab' ? 'bg-purple-100 text-purple-800' : ''}
                        hover:shadow-sm transition-shadow
                      `}
                    >
                      {appointment.time} - {appointment.title}
                    </motion.div>
                  ))}
                  {getAppointmentsForDate(date).length > 2 && (
                    <div className="text-xs text-surface-500 text-center">
                      +{getAppointmentsForDate(date).length - 2} more
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">
                Appointment Details
              </h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-surface-500 hover:text-surface-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-surface-900">{selectedAppointment.title}</p>
                  <p className="text-sm text-surface-600">
                    {selectedAppointment.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-surface-900">{selectedAppointment.time}</p>
                  <p className="text-sm text-surface-600">
                    Duration: {selectedAppointment.duration} minutes
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-red-600" />
                <p className="text-surface-900">{selectedAppointment.location}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {selectedAppointment.status === 'confirmed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <p className="text-surface-900 capitalize">{selectedAppointment.status}</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Calendar;
