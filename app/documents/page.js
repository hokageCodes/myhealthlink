'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ArrowLeft, 
  Upload, 
  Search, 
  Filter,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  Plus,
  Calendar,
  Building
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const categories = [
  { id: 'all', label: 'All Documents', icon: FileText },
  { id: 'lab-results', label: 'Lab Results', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { id: 'medical-images', label: 'Medical Images', icon: Image },
  { id: 'medical-notes', label: 'Medical Notes', icon: FileText },
  { id: 'insurance-documents', label: 'Insurance', icon: File },
  { id: 'vaccination-records', label: 'Vaccinations', icon: FileText },
  { id: 'other', label: 'Other', icon: File }
];

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, searchTerm]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else if (response.status === 401) {
        // Token is invalid, clear it and redirect to login
        localStorage.removeItem('accessToken');
        router.push('/login');
      } else {
        toast.error('Failed to load documents');
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.')[0]);
      formData.append('category', 'other');
      formData.append('documentDate', new Date().toISOString());

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDocuments(prev => [result.document, ...prev]);
        toast.success('Document uploaded successfully!');
        setShowUploadModal(false);
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : FileText;
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.label : 'Other';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">MyHealthLink</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Documents</h1>
          <p className="text-gray-600">
            Upload and organize your health documents for easy access and sharing.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your first health document to get started.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const IconComponent = getCategoryIcon(doc.category);
              return (
                <div key={doc.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{getCategoryLabel(doc.category)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(doc.documentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                    {doc.issuedBy?.name && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>{doc.issuedBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Enter document title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select className="input w-full">
                    {categories.slice(1).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Date
                  </label>
                  <input
                    type="date"
                    className="input w-full"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG up to 10MB
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn btn-outline mt-2 cursor-pointer"
                    >
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-outline"
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
