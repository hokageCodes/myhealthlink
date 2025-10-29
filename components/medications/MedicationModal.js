'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Pill, 
  Clock, 
  Calendar, 
  User, 
  AlertTriangle,
  Save,
  Search
} from 'lucide-react';

const MedicationModal = ({ isOpen, onClose, onSave, medication, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    form: 'tablet',
    frequency: 'daily',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    instructions: '',
    status: 'active',
    reminderEnabled: false,
    reminderTimes: []
  });

  const [drugSearch, setDrugSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (medication) {
      setFormData(medication);
    } else {
      setFormData({
        name: '',
        dosage: '',
        form: 'tablet',
        frequency: 'daily',
        startDate: '',
        endDate: '',
        prescribedBy: '',
        instructions: '',
        status: 'active',
        reminderEnabled: false,
        reminderTimes: []
      });
    }
  }, [medication, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDrugSearch = async (searchTerm) => {
    setDrugSearch(searchTerm);
    if (searchTerm.length > 2) {
      // Simulate drug database search
      const mockResults = [
        { name: 'Lisinopril', generic: 'Lisinopril', strength: '10mg' },
        { name: 'Metformin', generic: 'Metformin', strength: '500mg' },
        { name: 'Atorvastatin', generic: 'Atorvastatin', strength: '20mg' },
        { name: 'Omeprazole', generic: 'Omeprazole', strength: '20mg' },
        { name: 'Amlodipine', generic: 'Amlodipine', strength: '5mg' },
      ].filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.generic.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(mockResults);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const selectDrug = (drug) => {
    setFormData(prev => ({
      ...prev,
      name: drug.name,
      dosage: drug.strength
    }));
    setDrugSearch(drug.name);
    setShowSearchResults(false);
  };

  const addReminderTime = () => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, '']
    }));
  };

  const updateReminderTime = (index, time) => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.map((t, i) => i === index ? time : t)
    }));
  };

  const removeReminderTime = (index) => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter((_, i) => i !== index)
    }));
  };

  const medicationForms = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'liquid', label: 'Liquid' },
    { value: 'injection', label: 'Injection' },
    { value: 'topical', label: 'Topical' },
    { value: 'inhaler', label: 'Inhaler' },
    { value: 'patch', label: 'Patch' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'as_needed', label: 'As needed' },
    { value: 'weekly', label: 'Once weekly' },
    { value: 'monthly', label: 'Once monthly' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'discontinued', label: 'Discontinued' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-surface-800 rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-surface-900 dark:text-white">
                      {mode === 'create' ? 'Add Medication' : 'Edit Medication'}
                    </h2>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {mode === 'create' ? 'Add a new medication to your list' : 'Update medication details'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Drug Search */}
              <div>
                <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                  Medication Name *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
                  <input
                    type="text"
                    value={drugSearch}
                    onChange={(e) => handleDrugSearch(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Search for medication..."
                  />
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {searchResults.map((drug, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectDrug(drug)}
                          className="w-full px-3 py-2 text-left hover:bg-surface-50 dark:hover:bg-surface-700 border-b border-surface-200 dark:border-surface-700 last:border-b-0"
                        >
                          <div className="font-medium text-surface-900 dark:text-white">{drug.name}</div>
                          <div className="text-sm text-surface-600 dark:text-surface-400">
                            {drug.generic} • {drug.strength}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="e.g., 10mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                    Form
                  </label>
                  <select
                    name="form"
                    value={formData.form}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {medicationForms.map(form => (
                      <option key={form.value} value={form.value}>
                        {form.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                    Frequency *
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {frequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                  Prescribed By
                </label>
                <input
                  type="text"
                  name="prescribedBy"
                  value={formData.prescribedBy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-900 dark:text-white mb-2">
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  placeholder="Take with food, avoid alcohol, etc."
                />
              </div>

              {/* Reminder Settings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="reminderEnabled"
                      checked={formData.reminderEnabled}
                      onChange={handleChange}
                      className="w-4 h-4 text-brand-600 border-surface-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-surface-900 dark:text-white">
                      Enable Reminders
                    </span>
                  </label>
                </div>

                {formData.reminderEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-surface-900 dark:text-white">
                        Reminder Times
                      </h4>
                      <button
                        type="button"
                        onClick={addReminderTime}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        + Add Time
                      </button>
                    </div>
                    
                    {formData.reminderTimes.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateReminderTime(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeReminderTime(index)}
                          className="p-2 text-surface-600 dark:text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Add Medication' : 'Update'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MedicationModal;
