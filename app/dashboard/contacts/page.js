'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Heart,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.get(token);
    },
  });

  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isPrimary: false
  });

  // Initialize contacts from user data
  useState(() => {
    if (userData?.data?.contacts) {
      setContacts(userData.data.contacts);
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const token = getToken();
      if (!token) throw new Error('No token');
      return await authAPI.profile.update(token, { contacts: data });
    },
    onSuccess: () => {
      toast.success('Contacts updated successfully');
      setIsEditing(false);
      setEditingIndex(null);
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: () => {
      toast.error('Failed to update contacts');
    }
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please fill in at least name and phone number');
      return;
    }
    const updated = [...contacts, { ...newContact, id: Date.now().toString() }];
    setContacts(updated);
    updateMutation.mutate(updated);
    setNewContact({ name: '', phone: '', email: '', relationship: '', isPrimary: false });
  };

  const handleUpdateContact = (index) => {
    updateMutation.mutate(contacts);
    setEditingIndex(null);
  };

  const handleDeleteContact = (index) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updated = contacts.filter((_, i) => i !== index);
      setContacts(updated);
      updateMutation.mutate(updated);
    }
  };

  const handleEditContact = (index, field, value) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
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
          <h1 className="text-2xl font-light text-gray-900">Emergency Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your trusted emergency contacts</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          {isEditing ? <CheckCircle className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Done Editing' : 'Edit Contacts'}</span>
        </button>
      </motion.div>

      {/* Primary Emergency Contact */}
      {userData?.data?.emergencyContact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 border-2 border-red-300 rounded-xl p-6"
        >
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-red-900">Primary Emergency Contact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-red-600 font-medium mb-1">Name</p>
              <p className="text-red-900 font-semibold">{userData.data.emergencyContact.name}</p>
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium mb-1">Phone</p>
              <p className="text-red-900 font-semibold">{userData.data.emergencyContact.phone}</p>
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium mb-1">Relationship</p>
              <p className="text-red-900 font-semibold">{userData.data.emergencyContact.relationship}</p>
            </div>
          </div>
          <p className="text-xs text-red-700 mt-4">
            * Primary contact can be updated in Profile settings
          </p>
        </motion.div>
      )}

      {/* Add New Contact */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                placeholder="+2348012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
              <input
                type="text"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                placeholder="e.g., Family, Friend, Healthcare Provider"
              />
            </div>
          </div>
          <button
            onClick={handleAddContact}
            className="mt-4 flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </motion.div>
      )}

      {/* Contacts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Contacts</h2>
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No additional contacts added yet</p>
            {!isEditing && (
              <p className="text-sm text-gray-400 mt-2">Click "Edit Contacts" to add contacts</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact, index) => (
              <div key={contact.id || index} className="border border-gray-200 rounded-lg p-4">
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleEditContact(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleEditContact(index, 'phone', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Phone"
                    />
                    <input
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => handleEditContact(index, 'email', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={contact.relationship || ''}
                      onChange={(e) => handleEditContact(index, 'relationship', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Relationship"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateContact(index)}
                        className="flex-1 px-2 py-1 bg-brand-600 text-white rounded text-sm hover:bg-brand-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      {contact.isPrimary && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {contact.phone}
                    </div>
                    {contact.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {contact.email}
                      </div>
                    )}
                    {contact.relationship && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {contact.relationship}
                      </div>
                    )}
                    {isEditing && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setEditingIndex(index)}
                          className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                        >
                          <Edit className="w-3 h-3 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContact(index)}
                          className="flex-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

