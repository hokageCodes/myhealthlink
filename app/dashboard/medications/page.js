'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Pill, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import MedicationCard from '@/components/medications/MedicationCard';
import MedicationModal from '@/components/medications/MedicationModal';
import { medicationsAPI } from '@/lib/api/medications';
import { toast } from 'react-hot-toast';

export default function MedicationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const queryClient = useQueryClient();

  const { data: medicationsResponse, isLoading } = useQuery({
    queryKey: ['medications', statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await medicationsAPI.getMedications(token, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100
      });
    },
    staleTime: 30000,
  });

  const medications = medicationsResponse?.data || [];

  // Filter medications
  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.prescribedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || med.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeMedications = filteredMedications.filter(m => m.status === 'active');
  const completedMedications = filteredMedications.filter(m => m.status === 'completed');
  const inactiveMedications = filteredMedications.filter(m => m.status === 'inactive');

  const handleAddMedication = () => {
    setEditingMedication(null);
    setIsModalOpen(true);
  };

  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setIsModalOpen(true);
  };

  const saveMedicationMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      
      const formattedData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      if (editingMedication?._id || editingMedication?.id) {
        const id = editingMedication._id || editingMedication.id;
        return await medicationsAPI.updateMedication(token, id, formattedData);
      } else {
        return await medicationsAPI.createMedication(token, formattedData);
      }
    },
    onSuccess: () => {
      toast.success('Medication saved successfully');
      queryClient.invalidateQueries(['medications']);
      setIsModalOpen(false);
      setEditingMedication(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save medication');
    },
  });

  // Log medication intake mutation
  const logIntakeMutation = useMutation({
    mutationFn: async ({ medicationId, taken, notes = '' }) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await medicationsAPI.logIntake(token, medicationId, { taken, notes });
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Medication intake logged');
      queryClient.invalidateQueries(['medications']);
      // Also invalidate adherence if needed
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log medication intake');
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      const medicationId = id._id || id.id || id;
      return await medicationsAPI.deleteMedication(token, medicationId);
    },
    onSuccess: () => {
      toast.success('Medication deleted successfully');
      queryClient.invalidateQueries(['medications']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete medication');
    },
  });

  const handleSaveMedication = (formData) => {
    saveMedicationMutation.mutate(formData);
  };

  const handleDeleteMedication = (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      deleteMedicationMutation.mutate(id);
    }
  };

  const handleLogIntake = (medicationId, taken) => {
    logIntakeMutation.mutate({ medicationId, taken });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-light text-gray-900">Medications</h1>
          <p className="text-gray-500 mt-1">Manage your medications and reminders</p>
        </div>
        <button
          onClick={handleAddMedication}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Active</p>
              <p className="text-2xl font-bold text-surface-900">{activeMedications.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Completed</p>
              <p className="text-2xl font-bold text-surface-900">{completedMedications.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-gray-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">Total</p>
              <p className="text-2xl font-bold text-surface-900">{filteredMedications.length}</p>
            </div>
            <Pill className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600">With Reminders</p>
              <p className="text-2xl font-bold text-surface-900">
                {filteredMedications.filter(m => m.reminderEnabled).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-surface-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Medications List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-surface-200 animate-pulse">
              <div className="h-24 bg-surface-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredMedications.length === 0 ? (
        <div className="bg-white rounded-lg border border-surface-200 p-12 text-center">
          <Pill className="w-16 h-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">No medications found</h3>
          <p className="text-surface-600 mb-6">Get started by adding your first medication</p>
          <button
            onClick={handleAddMedication}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Add Medication
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeMedications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Active Medications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMedications.map((medication) => (
                  <MedicationCard
                    key={medication._id || medication.id}
                    medication={medication}
                    onEdit={() => handleEditMedication(medication)}
                    onDelete={() => handleDeleteMedication(medication._id || medication.id)}
                    onLogIntake={handleLogIntake}
                  />
                ))}
              </div>
            </div>
          )}

          {completedMedications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Completed Medications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMedications.map((medication) => (
                  <MedicationCard
                    key={medication._id || medication.id}
                    medication={medication}
                    onEdit={() => handleEditMedication(medication)}
                    onDelete={() => handleDeleteMedication(medication._id || medication.id)}
                    onLogIntake={handleLogIntake}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medication Modal */}
      <MedicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMedication(null);
        }}
        onSave={handleSaveMedication}
        medication={editingMedication}
        mode={editingMedication ? 'edit' : 'create'}
      />
    </div>
  );
}

