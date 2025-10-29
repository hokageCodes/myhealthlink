'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Target, Plus, TrendingUp, Calendar, Edit, Trash2, CheckCircle, 
  Clock, Award, BarChart3, Filter
} from 'lucide-react';
import { healthGoalsAPI } from '@/lib/api/healthGoals';
import toast from 'react-hot-toast';

export default function HealthGoalsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const queryClient = useQueryClient();

  const { data: goalsResponse, isLoading } = useQuery({
    queryKey: ['healthGoals', statusFilter, categoryFilter],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      return await healthGoalsAPI.getGoals(token, params);
    },
    staleTime: 30000,
  });

  const goals = goalsResponse?.data || [];

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthGoalsAPI.createGoal(token, goalData);
    },
    onSuccess: () => {
      toast.success('Goal created successfully');
      setShowModal(false);
      setEditingGoal(null);
      queryClient.invalidateQueries(['healthGoals']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, goalData }) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthGoalsAPI.updateGoal(token, goalId, goalData);
    },
    onSuccess: () => {
      toast.success('Goal updated successfully');
      setShowModal(false);
      setEditingGoal(null);
      queryClient.invalidateQueries(['healthGoals']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update goal');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthGoalsAPI.deleteGoal(token, goalId);
    },
    onSuccess: () => {
      toast.success('Goal deleted successfully');
      queryClient.invalidateQueries(['healthGoals']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete goal');
    },
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async ({ goalId, milestoneData }) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthGoalsAPI.addMilestone(token, goalId, milestoneData);
    },
    onSuccess: () => {
      toast.success('Milestone added');
      queryClient.invalidateQueries(['healthGoals']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add milestone');
    },
  });

  const handleSave = (formData) => {
    if (editingGoal) {
      updateGoalMutation.mutate({
        goalId: editingGoal._id,
        goalData: formData
      });
    } else {
      createGoalMutation.mutate(formData);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  const handleDelete = (goalId) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const categories = [
    { id: 'weight', label: 'Weight', icon: BarChart3 },
    { id: 'exercise', label: 'Exercise', icon: TrendingUp },
    { id: 'blood-pressure', label: 'Blood Pressure', icon: BarChart3 },
    { id: 'blood-sugar', label: 'Blood Sugar', icon: BarChart3 },
    { id: 'cholesterol', label: 'Cholesterol', icon: BarChart3 },
    { id: 'sleep', label: 'Sleep', icon: Clock },
    { id: 'nutrition', label: 'Nutrition', icon: Award },
    { id: 'mental-health', label: 'Mental Health', icon: Target },
    { id: 'other', label: 'Other', icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Health Goals</h1>
          <p className="text-gray-500 mt-1">Set and track your health goals</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-6">Set your first health goal to start tracking progress</p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => handleDelete(goal._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => handleDelete(goal._id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal Modal */}
      {showModal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false);
            setEditingGoal(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete }) {
  const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0 && goal.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress */}
      {goal.targetValue !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-gray-900">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                goal.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, goal.progress)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>Current: {goal.currentValue} {goal.unit}</span>
            <span>Target: {goal.targetValue} {goal.unit}</span>
          </div>
        </div>
      )}

      {/* Status and Date */}
      <div className="flex items-center justify-between text-sm">
        <span className={`px-2 py-1 rounded ${
          goal.status === 'completed' ? 'bg-green-100 text-green-800' :
          goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          isOverdue ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {goal.status === 'completed' ? 'Completed' :
           goal.status === 'paused' ? 'Paused' :
           isOverdue ? 'Overdue' : 'Active'}
        </span>
        <span className="text-gray-600">
          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` :
           daysRemaining >= 0 ? `${daysRemaining} days left` : 'Past due'}
        </span>
      </div>
    </motion.div>
  );
}

function GoalModal({ goal, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'weight',
    targetValue: goal?.targetValue || '',
    currentValue: goal?.currentValue || 0,
    unit: goal?.unit || '',
    targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
    reminders: goal?.reminders || { enabled: false, frequency: 'daily' }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
      currentValue: formData.currentValue ? parseFloat(formData.currentValue) : 0,
      targetDate: formData.targetDate
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {goal ? 'Edit Goal' : 'New Goal'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="weight">Weight</option>
                <option value="exercise">Exercise</option>
                <option value="blood-pressure">Blood Pressure</option>
                <option value="blood-sugar">Blood Sugar</option>
                <option value="cholesterol">Cholesterol</option>
                <option value="sleep">Sleep</option>
                <option value="hydration">Hydration</option>
                <option value="nutrition">Nutrition</option>
                <option value="mental-health">Mental Health</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date *</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {['weight', 'exercise', 'blood-pressure', 'blood-sugar', 'cholesterol', 'sleep', 'hydration'].includes(formData.category) && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Value *</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, lbs, minutes, etc"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

