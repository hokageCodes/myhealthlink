'use client';

import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Video, 
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AppointmentCard = ({ appointment, onEdit, onDelete, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-accent-100 text-accent-700 border-accent-200';
      case 'pending':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'cancelled':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'completed':
        return 'bg-surface-100 text-surface-700 border-surface-200';
      default:
        return 'bg-surface-100 text-surface-700 border-surface-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <User className="w-4 h-4" />;
      case 'follow-up':
        return <Calendar className="w-4 h-4" />;
      case 'emergency':
        return <AlertCircle className="w-4 h-4" />;
      case 'checkup':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getLocationIcon = (location) => {
    if (location?.includes('Virtual') || location?.includes('Online')) {
      return <Video className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700 hover:shadow-medium transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
            {getTypeIcon(appointment.type)}
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">
              {appointment.title}
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              {appointment.provider}
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
          {getStatusIcon(appointment.status)}
          <span>{appointment.status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
          <Clock className="w-4 h-4" />
          <span>
            {appointment.date ? (typeof appointment.date === 'string' 
              ? new Date(appointment.date).toLocaleDateString() 
              : appointment.date) : 'N/A'} 
            {appointment.time ? ` at ${appointment.time}` : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
          {getLocationIcon(appointment.location)}
          <span>{appointment.location}</span>
        </div>

        {appointment.phone && (
          <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
            <Phone className="w-4 h-4" />
            <span>{appointment.phone}</span>
          </div>
        )}
      </div>

      {appointment.notes && (
        <div className="mb-4 p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
          <p className="text-sm text-surface-700 dark:text-surface-300">
            {appointment.notes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {appointment.status === 'pending' && (
            <button
              onClick={() => onStatusChange(appointment._id || appointment.id, 'confirmed')}
              className="px-3 py-1 text-xs font-medium bg-accent-100 text-accent-700 rounded-lg hover:bg-accent-200 transition-colors"
            >
              Confirm
            </button>
          )}
          {appointment.status === 'confirmed' && (
            <button
              onClick={() => onStatusChange(appointment._id || appointment.id, 'completed')}
              className="px-3 py-1 text-xs font-medium bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-200 transition-colors"
            >
              Mark Complete
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(appointment)}
            className="p-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(appointment._id || appointment.id)}
            className="p-2 text-surface-600 dark:text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentCard;
