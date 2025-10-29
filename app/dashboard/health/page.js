'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  Plus, 
  Heart, 
  Activity, 
  Thermometer,
  Droplets,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Filter
} from 'lucide-react';
import { healthAPI } from '@/lib/api/health';
import MetricChart from '@/components/health/MetricChart';

const metricTypes = [
  {
    type: 'bloodPressure',
    name: 'Blood Pressure',
    icon: Heart,
    unit: 'mmHg',
    description: 'Systolic/Diastolic',
    color: 'red'
  },
  {
    type: 'weight',
    name: 'Weight',
    icon: Activity,
    unit: 'kg',
    description: 'Body weight',
    color: 'blue'
  },
  {
    type: 'glucose',
    name: 'Blood Glucose',
    icon: Droplets,
    unit: 'mg/dL',
    description: 'Blood sugar level',
    color: 'orange'
  },
  {
    type: 'heartRate',
    name: 'Heart Rate',
    icon: Heart,
    unit: 'bpm',
    description: 'Pulse rate',
    color: 'green'
  },
  {
    type: 'temperature',
    name: 'Temperature',
    icon: Thermometer,
    unit: '°C',
    description: 'Body temperature',
    color: 'yellow'
  }
];

const metricSchema = Yup.object({
  type: Yup.string().required('Metric type is required'),
  value: Yup.mixed().required('Value is required'),
  unit: Yup.string().required('Unit is required'),
  notes: Yup.string().max(500, 'Notes cannot exceed 500 characters'),
  date: Yup.date().required('Date is required')
});

export default function HealthPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [selectedMetricType, setSelectedMetricType] = useState(null);
  const [dateRange, setDateRange] = useState(30);
  const queryClient = useQueryClient();

  // Fetch health metrics
  const { data: metricsResponse, isLoading } = useQuery({
    queryKey: ['healthMetrics', selectedMetricType],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      const params = { limit: 100 };
      if (selectedMetricType) params.type = selectedMetricType;
      const response = await healthAPI.getMetrics(token, params);
      // Handle both array and object responses
      if (Array.isArray(response)) {
        return response;
      }
      if (response?.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    },
    staleTime: 30000, // 30 seconds
  });

  const metrics = Array.isArray(metricsResponse) ? metricsResponse : [];

  // Fetch health summary
  const { data: summary } = useQuery({
    queryKey: ['healthSummary'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.getSummary(token, 30);
    },
    staleTime: 60000, // 1 minute
  });

  // Add metric mutation
  const addMetricMutation = useMutation({
    mutationFn: async (metricData) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.addMetric(token, metricData);
    },
    onSuccess: () => {
      toast.success('Health metric added successfully');
      setShowAddForm(false);
      formik.resetForm();
      queryClient.invalidateQueries(['healthMetrics']);
      queryClient.invalidateQueries(['healthSummary']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add health metric');
    },
  });

  // Update metric mutation
  const updateMetricMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.updateMetric(token, id, data);
    },
    onSuccess: () => {
      toast.success('Health metric updated successfully');
      setEditingMetric(null);
      formik.resetForm();
      queryClient.invalidateQueries(['healthMetrics']);
      queryClient.invalidateQueries(['healthSummary']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update health metric');
    },
  });

  // Delete metric mutation
  const deleteMetricMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await healthAPI.deleteMetric(token, id);
    },
    onSuccess: () => {
      toast.success('Health metric deleted successfully');
      queryClient.invalidateQueries(['healthMetrics']);
      queryClient.invalidateQueries(['healthSummary']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete health metric');
    },
  });

  const formik = useFormik({
    initialValues: {
      type: '',
      value: '',
      unit: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    },
    validationSchema: metricSchema,
    onSubmit: (values) => {
      if (editingMetric) {
        updateMetricMutation.mutate({ id: editingMetric._id, data: values });
      } else {
        addMetricMutation.mutate(values);
      }
    },
  });

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setShowAddForm(true);
    formik.setValues({
      type: metric.type,
      value: typeof metric.value === 'object' ? 
        `${metric.value.systolic}/${metric.value.diastolic}` : 
        metric.value.toString(),
      unit: metric.unit,
      notes: metric.notes || '',
      date: new Date(metric.date).toISOString().split('T')[0]
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this health metric?')) {
      deleteMetricMutation.mutate(id);
    }
  };

  const getMetricType = (type) => {
    return metricTypes.find(mt => mt.type === type);
  };

  const formatValue = (metric) => {
    if (metric.type === 'bloodPressure' && typeof metric.value === 'object') {
      return `${metric.value.systolic}/${metric.value.diastolic}`;
    }
    return metric.value;
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      
      if (!metrics || metrics.length === 0) {
        toast.error('No metrics to export');
        return;
      }
      
      // Dynamic import for jsPDF
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Health Metrics Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      
      let yPos = 40;
      
      // Group metrics by type
      const groupedMetrics = metrics.reduce((acc, metric) => {
        if (!acc[metric.type]) acc[metric.type] = [];
        acc[metric.type].push(metric);
        return acc;
      }, {});
      
      // Add metrics by type
      Object.entries(groupedMetrics).forEach(([type, typeMetrics]) => {
        const metricType = getMetricType(type);
        if (!metricType) return;
        
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text(metricType.name, 14, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        typeMetrics.forEach((metric) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          
          try {
            const dateStr = metric.date || metric.recordedAt || metric.createdAt;
            const date = dateStr ? new Date(dateStr).toLocaleDateString() : 'Unknown';
            const value = formatValue(metric);
            const unit = metric.unit || '';
            const text = `${date}: ${value}${unit ? ' ' + unit : ''}`;
            
            // Truncate long text
            if (text.length > 80) {
              doc.text(text.substring(0, 77) + '...', 20, yPos);
            } else {
              doc.text(text, 20, yPos);
            }
            yPos += 6;
          } catch (err) {
            console.error('Error formatting metric for PDF:', err);
          }
        });
        
        yPos += 5;
      });
      
      // Save the PDF
      doc.save(`health-metrics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Health Metrics</h1>
          <p className="text-gray-500 mt-1">Track and monitor your health data</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingMetric(null);
            formik.resetForm();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Metric</span>
        </button>
      </div>

      {/* Health Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.latest.map((metric) => {
            const metricType = getMetricType(metric._id);
            if (!metricType) return null;
            
            return (
              <div key={metric._id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        metricType.color === 'red' ? 'bg-red-100' :
                        metricType.color === 'blue' ? 'bg-blue-100' :
                        metricType.color === 'orange' ? 'bg-orange-100' :
                        metricType.color === 'green' ? 'bg-green-100' :
                        metricType.color === 'yellow' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                      <metricType.icon className={`w-5 h-5 ${
                        metricType.color === 'red' ? 'text-red-600' :
                        metricType.color === 'blue' ? 'text-blue-600' :
                        metricType.color === 'orange' ? 'text-orange-600' :
                        metricType.color === 'green' ? 'text-green-600' :
                        metricType.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{metricType.name}</p>
                      <p className="text-xs text-gray-500">{metricType.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatValue({ type: metric._id, value: metric.latestValue })}
                    </p>
                    <p className="text-xs text-gray-500">{metric.latestUnit}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMetric ? 'Edit Health Metric' : 'Add New Health Metric'}
          </h3>
          
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Metric Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Type
                </label>
                <select
                  {...formik.getFieldProps('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select metric type</option>
                  {metricTypes.map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.name} ({type.unit})
                    </option>
                  ))}
                </select>
                {formik.touched.type && formik.errors.type && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.type}</p>
                )}
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('value')}
                  placeholder={formik.values.type === 'bloodPressure' ? '120/80' : 'Enter value'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.value && formik.errors.value && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.value}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('unit')}
                  placeholder="e.g., mmHg, kg, mg/dL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.unit && formik.errors.unit && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.unit}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  {...formik.getFieldProps('date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.date && formik.errors.date && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.date}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                {...formik.getFieldProps('notes')}
                rows={3}
                placeholder="Add any notes about this measurement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              {formik.touched.notes && formik.errors.notes && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.notes}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMetric(null);
                  formik.resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMetricMutation.isPending || updateMetricMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {editingMetric ? 'Update' : 'Add'} Metric
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trend Charts */}
      {metrics && metrics.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedMetricType || ''}
                onChange={(e) => setSelectedMetricType(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Metrics</option>
                {metricTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleExportPDF()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {selectedMetricType ? (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">
                {getMetricType(selectedMetricType)?.name || selectedMetricType} Trends
              </h4>
              <MetricChart
                metrics={metrics.filter(m => m.type === selectedMetricType)}
                type={selectedMetricType}
                chartType="line"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metricTypes.map((metricType) => {
                const typeMetrics = metrics.filter(m => m.type === metricType.type);
                if (typeMetrics.length === 0) return null;
                
                return (
                  <div key={metricType.type} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      {metricType.name} Trends
                    </h4>
                    <MetricChart
                      metrics={typeMetrics}
                      type={metricType.type}
                      chartType="line"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Measurements</h3>
        
        {metrics && metrics.length > 0 ? (
          <div className="space-y-3">
            {metrics.map((metric) => {
              const metricType = getMetricType(metric.type);
              if (!metricType) return null;
              
              return (
                <div key={metric._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      metricType.color === 'red' ? 'bg-red-100' :
                      metricType.color === 'blue' ? 'bg-blue-100' :
                      metricType.color === 'orange' ? 'bg-orange-100' :
                      metricType.color === 'green' ? 'bg-green-100' :
                      metricType.color === 'yellow' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <metricType.icon className={`w-5 h-5 ${
                        metricType.color === 'red' ? 'text-red-600' :
                        metricType.color === 'blue' ? 'text-blue-600' :
                        metricType.color === 'orange' ? 'text-orange-600' :
                        metricType.color === 'green' ? 'text-green-600' :
                        metricType.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{metricType.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(metric.date || metric.recordedAt || metric.createdAt).toLocaleDateString()} • {metric.notes || 'No notes'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatValue(metric)} {metric.unit}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(metric)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(metric._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No health metrics recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking your health data</p>
          </div>
        )}
      </div>
    </div>
  );
}
