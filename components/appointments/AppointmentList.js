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
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  Plus,
  Stethoscope,
  FileText,
  Heart
} from 'lucide-react';

const AppointmentList = ({ 
  appointments = [], 
  onEdit, 
  onDelete, 
  onStatusChange,
  onNewAppointment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Use only real appointments data from props
  const appointmentsToShow = appointments;

  // Filter and sort appointments
  const filteredAppointments = appointmentsToShow
    .filter(appointment => {
      const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'time':
          return a.time.localeCompare(b.time);
        case 'doctor':
          return a.doctor.localeCompare(b.doctor);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'checkup':
        return <Stethoscope className="w-4 h-4 text-green-600" />;
      case 'followup':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'consultation':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'lab':
        return <FileText className="w-4 h-4 text-orange-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low':
        return 'text-green-600';
      case 'normal':
        return 'text-blue-600';
      case 'high':
        return 'text-orange-600';
      case 'urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-surface-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-surface-900">Appointments</h2>
            <p className="text-surface-600 mt-1">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewAppointment}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="checkup">Checkup</option>
            <option value="followup">Follow-up</option>
            <option value="consultation">Consultation</option>
            <option value="lab">Lab Tests</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="time">Sort by Time</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Appointment List */}
      <div className="divide-y divide-surface-200">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-surface-900 mb-1">No appointments found</h3>
            <p className="text-surface-600 mb-4">Try adjusting your search or filters</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewAppointment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book New Appointment
            </motion.button>
          </div>
        ) : (
          filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-surface-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(appointment.type)}
                    <h3 className="text-lg font-medium text-surface-900">
                      {appointment.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center space-x-2 text-surface-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{appointment.doctor}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-surface-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-surface-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{appointment.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-surface-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`font-medium ${getUrgencyColor(appointment.urgency)}`}>
                        {appointment.urgency} priority
                      </span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <p className="text-sm text-surface-600 mt-2">{appointment.notes}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(appointment.status)}
                    {isUpcoming(appointment.date) && (
                      <span className="text-xs text-blue-600 font-medium">Upcoming</span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedAppointment(appointment)}
                      className="p-1 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-surface-400" />
                    </motion.button>

                    {/* Dropdown Menu */}
                    {selectedAppointment?.id === appointment.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-8 bg-white border border-surface-200 rounded-lg shadow-lg z-10 min-w-[150px]"
                      >
                        <button
                          onClick={() => {
                            onEdit(appointment);
                            setSelectedAppointment(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 rounded-t-lg"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            onDelete(appointment.id);
                            setSelectedAppointment(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
