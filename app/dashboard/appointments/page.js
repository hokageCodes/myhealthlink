'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Filter, 
  Search,
  RefreshCw,
  Download,
  MapPin,
  User,
  Phone,
  Video,
  AlertCircle
} from 'lucide-react';
import Calendar from '@/components/appointments/Calendar';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import AppointmentModal from '@/components/appointments/AppointmentModal';
import { appointmentsAPI } from '@/lib/api/appointments';
import { toast } from 'react-hot-toast';

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const queryClient = useQueryClient();

  // Fetch appointments from API
  const { data: appointmentsResponse, isLoading } = useQuery({
    queryKey: ['appointments', statusFilter, typeFilter],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await appointmentsAPI.getAppointments(token, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        limit: 100
      });
    },
    staleTime: 30000,
  });

  const appointments = appointmentsResponse?.data || [];

  // Create/Update appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      
      if (editingAppointment?._id || editingAppointment?.id) {
        const id = editingAppointment._id || editingAppointment.id;
        return await appointmentsAPI.updateAppointment(token, id, appointmentData);
      } else {
        return await appointmentsAPI.createAppointment(token, appointmentData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      setIsModalOpen(false);
      setEditingAppointment(null);
      toast.success('Appointment saved successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save appointment');
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      const id = appointmentId._id || appointmentId.id || appointmentId;
      return await appointmentsAPI.deleteAppointment(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete appointment');
    },
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      const appointmentId = id._id || id.id || id;
      return await appointmentsAPI.updateAppointment(token, appointmentId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update appointment status');
    },
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.provider?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    // Status and type filters are already applied in API query
    return matchesSearch || searchTerm === '';
  });

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (appointmentData) => {
    // Format date for API
    const formattedData = {
      ...appointmentData,
      date: appointmentData.date ? new Date(appointmentData.date).toISOString() : new Date().toISOString(),
    };
    createAppointmentMutation.mutate(formattedData);
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const handleAppointmentClick = (appointment) => {
    handleEditAppointment(appointment);
  };

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
  }).slice(0, 3);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'checkup', label: 'Checkup' },
    { value: 'emergency', label: 'Emergency' },
  ];

  return (
    <div className="space-y-6 bg-surface-50 dark:bg-surface-900 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Appointments
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Manage your medical appointments and schedule new ones
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateAppointment}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center space-x-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-surface-900 dark:text-white">Total</span>
          </div>
          <div className="text-2xl font-bold text-brand-600">{appointments.length}</div>
          <div className="text-xs text-surface-600 dark:text-surface-400">appointments</div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-warning-600" />
            <span className="text-sm font-medium text-surface-900 dark:text-white">Pending</span>
          </div>
          <div className="text-2xl font-bold text-warning-600">
            {appointments.filter(apt => apt.status === 'pending').length}
          </div>
          <div className="text-xs text-surface-600 dark:text-surface-400">awaiting confirmation</div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-accent-600" />
            <span className="text-sm font-medium text-surface-900 dark:text-white">Confirmed</span>
          </div>
          <div className="text-2xl font-bold text-accent-600">
            {appointments.filter(apt => apt.status === 'confirmed').length}
          </div>
          <div className="text-xs text-surface-600 dark:text-surface-400">scheduled</div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-danger-600" />
            <span className="text-sm font-medium text-surface-900 dark:text-white">This Week</span>
          </div>
          <div className="text-2xl font-bold text-danger-600">
            {upcomingAppointments.length}
          </div>
          <div className="text-xs text-surface-600 dark:text-surface-400">upcoming</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Calendar
            appointments={appointments}
            onDateSelect={setSelectedDate}
            onAppointmentClick={handleAppointmentClick}
            selectedDate={selectedDate}
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-surface-200 dark:border-surface-700 shadow-medium"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Upcoming</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">Next appointments</p>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id || appointment.id}
                    onClick={() => handleEditAppointment(appointment)}
                    className="p-3 bg-surface-50 dark:bg-surface-700 rounded-lg cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-surface-900 dark:text-white text-sm">
                        {appointment.title}
                      </h4>
                      <span className="text-xs text-surface-500 dark:text-surface-400">
                        {appointment.time}
                      </span>
                    </div>
                    <p className="text-xs text-surface-600 dark:text-surface-400">
                      {appointment.provider}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {appointment.location.includes('Virtual') ? (
                        <Video className="w-3 h-3 text-surface-500" />
                      ) : (
                        <MapPin className="w-3 h-3 text-surface-500" />
                      )}
                      <span className="text-xs text-surface-500">
                        {appointment.location.split(',')[0]}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CalendarIcon className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    No upcoming appointments
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="p-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Appointments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-4"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700 animate-pulse">
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded mb-2"></div>
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded mb-4 w-2/3"></div>
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded mb-2"></div>
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id || appointment.id}
                appointment={appointment}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Schedule your first appointment to get started.'}
            </p>
            <button
              onClick={handleCreateAppointment}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Schedule Appointment
            </button>
          </div>
        )}
      </motion.div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        appointment={editingAppointment}
        mode={editingAppointment ? 'edit' : 'create'}
      />
    </div>
  );
}
