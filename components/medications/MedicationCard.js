'use client';

import { motion } from 'framer-motion';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Bell,
  Calendar,
  User,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

const MedicationCard = ({ medication, onEdit, onDelete, onToggleReminder, onLogIntake }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-accent-100 text-accent-700 border-accent-200';
      case 'completed':
        return 'bg-surface-100 text-surface-700 border-surface-200';
      case 'discontinued':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'paused':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      default:
        return 'bg-surface-100 text-surface-700 border-surface-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'discontinued':
        return <AlertTriangle className="w-4 h-4" />;
      case 'paused':
        return <Clock className="w-4 h-4" />;
      default:
        return <Pill className="w-4 h-4" />;
    }
  };

  const getDosageFrequency = (frequency) => {
    switch (frequency) {
      case 'daily':
        return 'Once daily';
      case 'twice_daily':
        return 'Twice daily';
      case 'three_times_daily':
        return 'Three times daily';
      case 'four_times_daily':
        return 'Four times daily';
      case 'as_needed':
        return 'As needed';
      case 'weekly':
        return 'Once weekly';
      default:
        return frequency;
    }
  };

  const getInteractionSeverity = (severity) => {
    switch (severity) {
      case 'major':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'moderate':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'minor':
        return 'bg-accent-100 text-accent-700 border-accent-200';
      default:
        return 'bg-surface-100 text-surface-700 border-surface-200';
    }
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
            <Pill className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">
              {medication.name}
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              {medication.dosage} • {medication.form}
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(medication.status)}`}>
          {getStatusIcon(medication.status)}
          <span>{medication.status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
          <Clock className="w-4 h-4" />
          <span>{getDosageFrequency(medication.frequency)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
          <Calendar className="w-4 h-4" />
          <span>Started: {medication.startDate}</span>
        </div>

        {medication.endDate && (
          <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
            <Calendar className="w-4 h-4" />
            <span>Ends: {medication.endDate}</span>
          </div>
        )}

        {medication.prescribedBy && (
          <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
            <User className="w-4 h-4" />
            <span>Prescribed by: {medication.prescribedBy}</span>
          </div>
        )}
      </div>

      {medication.instructions && (
        <div className="mb-4 p-3 bg-surface-50 dark:bg-surface-700 rounded-lg">
          <p className="text-sm text-surface-700 dark:text-surface-300">
            <strong>Instructions:</strong> {medication.instructions}
          </p>
        </div>
      )}

      {/* Drug Interactions */}
      {medication.interactions && medication.interactions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-surface-900 dark:text-white mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 text-warning-600 mr-2" />
            Drug Interactions
          </h4>
          <div className="space-y-2">
            {medication.interactions.map((interaction, index) => (
              <div key={index} className={`p-2 rounded-lg border ${getInteractionSeverity(interaction.severity)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{interaction.drug}</span>
                  <span className="text-xs font-medium capitalize">{interaction.severity}</span>
                </div>
                <p className="text-xs">{interaction.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminder Status */}
      {medication.reminderEnabled && (
        <div className="mb-4 p-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-accent-600" />
            <span className="text-sm text-accent-700 dark:text-accent-400">
              Reminders enabled • Next: {medication.nextReminder}
            </span>
          </div>
        </div>
      )}

      {/* Adherence Tracking - Always show for active medications */}
      {medication.status === 'active' && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Adherence (30 days)</span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {(() => {
                // Calculate adherence on frontend if not provided
                if (medication.adherencePercentage !== undefined) {
                  return `${medication.adherencePercentage.toFixed(0)}%`;
                }
                // Try to calculate from adherence log
                if (medication.adherenceLog && medication.adherenceLog.length > 0) {
                  const last30Days = medication.adherenceLog.filter(log => {
                    const logDate = new Date(log.date);
                    const daysAgo = (new Date() - logDate) / (1000 * 60 * 60 * 24);
                    return daysAgo <= 30;
                  });
                  const takenCount = last30Days.filter(log => log.taken === true).length;
                  // Estimate expected doses (simplified)
                  const expected = Math.max(1, last30Days.length);
                  const percentage = ((takenCount / expected) * 100).toFixed(0);
                  return `${percentage}%`;
                }
                return 'N/A';
              })()}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ 
                width: `${(() => {
                  if (medication.adherencePercentage !== undefined) {
                    return Math.min(100, medication.adherencePercentage);
                  }
                  if (medication.adherenceLog && medication.adherenceLog.length > 0) {
                    const last30Days = medication.adherenceLog.filter(log => {
                      const logDate = new Date(log.date);
                      const daysAgo = (new Date() - logDate) / (1000 * 60 * 60 * 24);
                      return daysAgo <= 30;
                    });
                    const takenCount = last30Days.filter(log => log.taken === true).length;
                    const expected = Math.max(1, last30Days.length);
                    return Math.min(100, ((takenCount / expected) * 100));
                  }
                  return 0;
                })()}%` 
              }}
            ></div>
          </div>
          {onLogIntake && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLogIntake(medication._id || medication.id, true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                Log Taken
              </button>
              <button
                onClick={() => onLogIntake(medication._id || medication.id, false)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                title="Mark as missed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {medication.status === 'active' && (
            <button
              onClick={() => onToggleReminder(medication._id || medication.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                medication.reminderEnabled
                  ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              }`}
            >
              {medication.reminderEnabled ? 'Disable Reminders' : 'Enable Reminders'}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(medication)}
            className="p-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(medication._id || medication.id)}
            className="p-2 text-surface-600 dark:text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicationCard;
