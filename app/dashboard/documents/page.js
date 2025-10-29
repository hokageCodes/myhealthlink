'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  FileText,
  Upload,
  Folder,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileImage,
  File,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { documentsAPI } from '@/lib/api/documents';

const documentCategories = [
  { value: 'lab-results', label: 'Lab Results', icon: FileText, color: 'blue' },
  { value: 'prescriptions', label: 'Prescriptions', icon: FileText, color: 'green' },
  { value: 'medical-reports', label: 'Medical Reports', icon: FileText, color: 'red' },
  { value: 'insurance', label: 'Insurance', icon: FileText, color: 'purple' },
  { value: 'vaccination', label: 'Vaccination Records', icon: FileText, color: 'orange' },
  { value: 'imaging', label: 'Imaging (X-ray, MRI, etc.)', icon: FileImage, color: 'indigo' },
  { value: 'other', label: 'Other', icon: File, color: 'gray' }
];

const fileTypeIcons = {
  'application/pdf': File,
  'image/jpeg': FileImage,
  'image/png': FileImage,
  'image/jpg': FileImage,
  'default': File
};

const uploadSchema = Yup.object({
  title: Yup.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .required('Title is required'),
  category: Yup.string()
    .oneOf(documentCategories.map(cat => cat.value))
    .required('Category is required'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters'),
  date: Yup.date()
    .max(new Date(), 'Date cannot be in the future')
    .required('Date is required')
});

export default function DocumentsPage() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documentsResponse, isLoading } = useQuery({
    queryKey: ['documents', selectedCategory],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await documentsAPI.getDocuments(token, { 
        category: selectedCategory || undefined,
        limit: 50 
      });
    },
    staleTime: 30000, // 30 seconds
  });

  // Extract documents array from response
  const documents = documentsResponse?.data || [];

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, metadata }) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await documentsAPI.uploadDocument(token, file, metadata);
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      setShowUploadForm(false);
      setSelectedFile(null);
      formik.resetForm();
      queryClient.invalidateQueries(['documents']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await documentsAPI.updateDocument(token, id, data);
    },
    onSuccess: () => {
      toast.success('Document updated successfully');
      setEditingDocument(null);
      formik.resetForm();
      queryClient.invalidateQueries(['documents']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update document');
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');
      return await documentsAPI.deleteDocument(token, id);
    },
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries(['documents']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    },
    validationSchema: uploadSchema,
    onSubmit: (values) => {
      if (!selectedFile) {
        toast.error('Please select a file to upload');
        return;
      }

      if (editingDocument) {
        updateMutation.mutate({ id: editingDocument._id, data: values });
      } else {
        uploadMutation.mutate({ file: selectedFile, metadata: values });
      }
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and image files are allowed');
        return;
      }

      setSelectedFile(file);
      
      // Auto-fill title if empty
      if (!formik.values.title) {
        formik.setFieldValue('title', file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleEdit = (document) => {
    setEditingDocument(document);
    setShowUploadForm(true);
    formik.setValues({
      title: document.title,
      category: document.category,
      description: document.description || '',
      date: new Date(document.date).toISOString().split('T')[0]
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = async (document) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');

      const blob = await documentsAPI.downloadDocument(token, document._id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.originalName || document.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to download document');
    }
  };

  const getFileIcon = (mimeType) => {
    return fileTypeIcons[mimeType] || fileTypeIcons.default;
  };

  const getCategoryInfo = (category) => {
    return documentCategories.find(cat => cat.value === category) || documentCategories[6];
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Manage your medical documents and records</p>
        </div>
        <button
          onClick={() => {
            setShowUploadForm(true);
            setEditingDocument(null);
            setSelectedFile(null);
            formik.resetForm();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {documentCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingDocument ? 'Edit Document' : 'Upload New Document'}
            </h3>
            <button
              onClick={() => {
                setShowUploadForm(false);
                setEditingDocument(null);
                setSelectedFile(null);
                formik.resetForm();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* File Upload */}
            {!editingDocument && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  placeholder="Enter document title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  {...formik.getFieldProps('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {documentCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {formik.touched.category && formik.errors.category && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.category}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Date
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                {...formik.getFieldProps('description')}
                rows={3}
                placeholder="Add any additional notes about this document..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.description}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setEditingDocument(null);
                  setSelectedFile(null);
                  formik.resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {editingDocument ? 'Update' : 'Upload'} Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Documents</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredDocuments?.length || 0} documents found
          </p>
        </div>

        {filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((document) => {
              const categoryInfo = getCategoryInfo(document.category);
              const FileIcon = getFileIcon(document.mimeType);
              
              return (
                <div key={document._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-${categoryInfo.color}-100 rounded-lg flex items-center justify-center`}>
                        <FileIcon className={`w-6 h-6 text-${categoryInfo.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{document.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Folder className="w-3 h-3" />
                            <span>{categoryInfo.label}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(document.date).toLocaleDateString()}</span>
                          </span>
                          <span>{document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}</span>
                        </div>
                        {document.description && (
                          <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(document)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(document)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
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
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try adjusting your search criteria' : 'Upload your first document to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

