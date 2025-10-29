const EmergencyEvent = require('../models/EmergencyEvent');
const User = require('../models/User');
const crypto = require('crypto');
const { createNotification } = require('../services/notificationService');

// @desc    Trigger emergency SOS event
// @route   POST /api/emergency/sos
// @access  Private
const triggerSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { location, notes } = req.body;

    // Get user with emergency contacts
    const user = await User.findById(userId).select('emergencyContact additionalContacts emergencyMode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create emergency event
    const emergencyEvent = new EmergencyEvent({
      user: userId,
      eventType: 'sos',
      status: 'active',
      location: location || {},
      notes: notes || '',
      triggeredAt: new Date()
    });

    // Generate temporary access token
    await emergencyEvent.generateAccessToken();

    // Prepare contacts to notify
    const contactsToNotify = [];
    
    if (user.emergencyContact && user.emergencyContact.name && user.emergencyContact.phone) {
      contactsToNotify.push({
        contact: user.emergencyContact,
        method: 'sms' // Default to SMS
      });
    }

    if (user.additionalContacts && Array.isArray(user.additionalContacts)) {
      user.additionalContacts.forEach(contact => {
        if (contact.name && contact.phone) {
          contactsToNotify.push({
            contact,
            method: 'sms'
          });
        }
      });
    }

    // Store notifications
    emergencyEvent.contactsNotified = contactsToNotify.map(({ contact, method }) => ({
      contact,
      method,
      status: 'sent'
    }));

    await emergencyEvent.save();

    // TODO: Send SMS/WhatsApp notifications to contacts
    // This would integrate with Twilio/Africa's Talking
    // For now, create in-app notifications
    try {
      await createNotification(userId, {
        type: 'emergency',
        title: 'Emergency SOS Activated',
        message: `Your emergency SOS has been activated. Emergency contacts have been notified.`,
        actionUrl: `/dashboard/emergency`,
        priority: 'critical',
        color: 'red',
        sendEmail: true,
        sendPush: true
      });
    } catch (notifError) {
      console.error('Error creating emergency notification:', notifError);
    }

    // Generate emergency access link
    const accessLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/emergency/${user.username}?token=${emergencyEvent.temporaryAccessToken}`;

    res.status(201).json({
      success: true,
      message: 'Emergency SOS activated successfully',
      data: {
        event: emergencyEvent,
        accessLink,
        contactsNotified: contactsToNotify.length
      }
    });
  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger emergency SOS'
    });
  }
};

// @desc    Get emergency events for user
// @route   GET /api/emergency/events
// @access  Private
const getEmergencyEvents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 50 } = req.query;

    const query = { user: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const events = await EmergencyEvent.find(query)
      .sort({ triggeredAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching emergency events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency events'
    });
  }
};

// @desc    Resolve emergency event
// @route   PATCH /api/emergency/events/:id/resolve
// @access  Private
const resolveEmergencyEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.userId;

    const event = await EmergencyEvent.findOne({
      _id: id,
      user: userId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Emergency event not found'
      });
    }

    await event.resolve(userId, notes);

    res.status(200).json({
      success: true,
      message: 'Emergency event resolved',
      data: event
    });
  } catch (error) {
    console.error('Error resolving emergency event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve emergency event'
    });
  }
};

// @desc    Access emergency profile via temporary token
// @route   GET /api/public/emergency/:username
// @access  Public (with token)
const getEmergencyProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Emergency access token required'
      });
    }

    // Find user
    const user = await User.findOne({ username }).select(
      '-password -emailOTP -emailOTPExpires -resetPasswordToken -resetPasswordExpires -refreshTokens -email'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Find active emergency event with matching token
    const event = await EmergencyEvent.findOne({
      user: user._id,
      temporaryAccessToken: token,
      status: 'active',
      temporaryAccessExpires: { $gt: new Date() }
    });

    if (!event) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired emergency access token'
      });
    }

    // Log access
    const accessorType = req.query.accessor || 'other';
    const identifier = req.query.identifier || req.ip || 'Unknown';
    await event.logAccess(accessorType, identifier);

    // Get emergency mode critical fields
    const emergencyFields = user.emergencyMode?.criticalFields || [
      'bloodType',
      'allergies',
      'emergencyContact',
      'chronicConditions'
    ];

    // Build emergency data
    const emergencyData = {
      name: user.name,
      profilePicture: user.profilePicture,
      dateOfBirth: user.dateOfBirth,
      emergencyMode: true,
      eventId: event._id,
      triggeredAt: event.triggeredAt,
      location: event.location
    };

    if (emergencyFields.includes('bloodType') && user.bloodType) {
      emergencyData.bloodType = user.bloodType;
    }
    if (emergencyFields.includes('allergies') && user.allergies) {
      emergencyData.allergies = user.allergies;
    }
    if (emergencyFields.includes('emergencyContact') && user.emergencyContact) {
      emergencyData.emergencyContact = user.emergencyContact;
    }
    if (emergencyFields.includes('chronicConditions') && user.chronicConditions) {
      emergencyData.chronicConditions = user.chronicConditions;
    }
    if (emergencyFields.includes('medications')) {
      // Would need to fetch active medications
      emergencyData.medications = []; // Placeholder
    }
    if (emergencyFields.includes('healthMetrics')) {
      // Would need to fetch recent critical metrics
      emergencyData.healthMetrics = []; // Placeholder
    }

    res.status(200).json({
      success: true,
      data: emergencyData
    });
  } catch (error) {
    console.error('Error fetching emergency profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  triggerSOS,
  getEmergencyEvents,
  resolveEmergencyEvent,
  getEmergencyProfile
};

