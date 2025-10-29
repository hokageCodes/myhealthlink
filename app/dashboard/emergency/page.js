'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Heart,
  QrCode,
  Link as LinkIcon,
  Save,
  User,
  Mail,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authAPI } from '@/lib/api/auth';
import { emergencyAPI } from '@/lib/api/emergency';
import toast from 'react-hot-toast';
import QRCodeModal from '@/components/QRCodeModal';
import { AlertCircle } from 'lucide-react';

export default function EmergencyPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [emergencyLink, setEmergencyLink] = useState('');
  const [sosLoading, setSosLoading] = useState(false);
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.get(token);
    },
  });

  const [emergencyData, setEmergencyData] = useState({
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    emergencyMode: {
      enabled: false,
      showCriticalOnly: true,
      criticalFields: ['bloodType', 'allergies', 'emergencyContact', 'chronicConditions']
    },
    additionalContacts: []
  });

  useEffect(() => {
    if (userData?.data) {
      setEmergencyData({
        emergencyContact: userData.data.emergencyContact || emergencyData.emergencyContact,
        emergencyMode: {
          enabled: userData.data.emergencyMode?.enabled || false,
          showCriticalOnly: userData.data.emergencyMode?.showCriticalOnly !== false,
          criticalFields: userData.data.emergencyMode?.criticalFields || emergencyData.emergencyMode.criticalFields
        },
        additionalContacts: userData.data.additionalContacts || []
      });

      if (userData.data.username) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        setEmergencyLink(`${baseUrl}/emergency/${userData.data.username}`);
      }
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.update(token, data);
    },
    onSuccess: () => {
      toast.success('Emergency settings saved successfully');
      setIsEditing(false);
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: () => {
      toast.error('Failed to save emergency settings');
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      emergencyContact: emergencyData.emergencyContact,
      emergencyMode: emergencyData.emergencyMode,
      additionalContacts: emergencyData.additionalContacts
    });
  };

  // SOS Trigger
  const triggerSOSMutation = useMutation({
    mutationFn: async (location) => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await emergencyAPI.triggerSOS(token, { location });
    },
    onSuccess: (response) => {
      toast.success('Emergency SOS activated! Contacts have been notified.');
      queryClient.invalidateQueries(['emergencyEvents']);
      setShowSOSConfirm(false);
      // Could show the access link or redirect
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to trigger SOS');
      setShowSOSConfirm(false);
    },
  });

  const handleTriggerSOS = async () => {
    setShowSOSConfirm(true);
  };

  const confirmTriggerSOS = async () => {
    setSosLoading(true);
    
    // Get location if available
    let location = null;
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        // Try to reverse geocode for address (optional)
        // Could integrate with geocoding service
      } catch (geoError) {
        console.warn('Location access denied or failed:', geoError);
        // Continue without location
      }
    }

    triggerSOSMutation.mutate(location);
    setSosLoading(false);
  };

  const addContact = () => {
    setEmergencyData(prev => ({
      ...prev,
      additionalContacts: [...prev.additionalContacts, { name: '', phone: '', relationship: '' }]
    }));
  };

  const removeContact = (index) => {
    setEmergencyData(prev => ({
      ...prev,
      additionalContacts: prev.additionalContacts.filter((_, i) => i !== index)
    }));
  };

  const updateContact = (index, field, value) => {
    setEmergencyData(prev => ({
      ...prev,
      additionalContacts: prev.additionalContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-light text-gray-900">Emergency Access</h1>
          <p className="text-gray-500 mt-1">Configure emergency access and critical health information</p>
        </div>
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Settings</span>
            </button>
            <button
              onClick={handleTriggerSOS}
              disabled={sosLoading || triggerSOSMutation.isPending}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>SOS</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset to original data
                if (userData?.data) {
                  setEmergencyData({
                    emergencyContact: userData.data.emergencyContact || { name: '', phone: '', relationship: '' },
                    emergencyMode: {
                      enabled: userData.data.emergencyMode?.enabled || false,
                      showCriticalOnly: userData.data.emergencyMode?.showCriticalOnly !== false,
                      criticalFields: userData.data.emergencyMode?.criticalFields || ['bloodType', 'allergies', 'emergencyContact']
                    },
                    additionalContacts: userData.data.additionalContacts || []
                  });
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-red-50 border border-red-200 rounded-xl p-6"
      >
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
          <h2 className="text-xl font-semibold text-red-900">Primary Emergency Contact</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-red-900 mb-2">Contact Name</label>
            {isEditing ? (
              <input
                type="text"
                value={emergencyData.emergencyContact.name || ''}
                onChange={(e) => setEmergencyData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Full name"
              />
            ) : (
              <p className="text-red-900 font-semibold">{emergencyData.emergencyContact.name || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-red-900 mb-2">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={emergencyData.emergencyContact.phone || ''}
                onChange={(e) => setEmergencyData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+2348012345678"
              />
            ) : (
              <p className="text-red-900 font-semibold">{emergencyData.emergencyContact.phone || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-red-900 mb-2">Relationship</label>
            {isEditing ? (
              <input
                type="text"
                value={emergencyData.emergencyContact.relationship || ''}
                onChange={(e) => setEmergencyData(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Spouse, Parent"
              />
            ) : (
              <p className="text-red-900 font-semibold">{emergencyData.emergencyContact.relationship || 'Not set'}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Emergency Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Emergency Mode</h2>
          </div>
          {isEditing && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyData.emergencyMode.enabled}
                onChange={(e) => setEmergencyData(prev => ({
                  ...prev,
                  emergencyMode: { ...prev.emergencyMode, enabled: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          )}
        </div>
        <p className="text-gray-600 mb-4">
          Emergency mode allows quick access to critical health information without revealing your full medical history.
        </p>
        {emergencyData.emergencyMode.enabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">Emergency Link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emergencyLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(emergencyLink);
                  toast.success('Link copied to clipboard');
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Additional Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Additional Emergency Contacts</h2>
          {isEditing && (
            <button
              onClick={addContact}
              className="flex items-center space-x-2 px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          )}
        </div>
        {emergencyData.additionalContacts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No additional contacts added</p>
        ) : (
          <div className="space-y-4">
            {emergencyData.additionalContacts.map((contact, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <p className="text-gray-900">{contact.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <p className="text-gray-900">{contact.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={contact.relationship}
                          onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                        />
                        <button
                          onClick={() => removeContact(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-900">{contact.relationship}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SOS Confirmation Modal */}
      {showSOSConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activate Emergency SOS?</h2>
              <p className="text-gray-600">
                This will immediately notify your emergency contacts and generate a temporary access link for first responders.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSOSConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmTriggerSOS}
                disabled={sosLoading || triggerSOSMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {sosLoading || triggerSOSMutation.isPending ? 'Activating...' : 'Activate SOS'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shareUrl={emergencyLink}
        userName={userData?.data?.name || 'User'}
      />
    </div>
  );
}

