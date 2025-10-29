const Appointment = require('../models/Appointment');
const { 
  createAppointmentReminders, 
  updateAppointmentReminders, 
  deleteAppointmentReminders 
} = require('../services/appointmentReminderService');

// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, type, startDate, endDate, limit = 50, page = 1 } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { user: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      provider,
      date,
      time,
      type,
      location,
      phone,
      notes,
      status = 'pending'
    } = req.body;

    // Validate required fields
    if (!title || !provider || !date || !time || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, provider, date, time, and type are required'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      user: userId,
      title,
      provider,
      date: new Date(date),
      time,
      type,
      location: location || '',
      phone: phone || '',
      notes: notes || '',
      status
    });

    await appointment.save();

    // Auto-generate appointment reminders (24h and 1h before)
    try {
      await createAppointmentReminders(appointment, userId);
    } catch (reminderError) {
      console.warn('Error creating appointment reminders:', reminderError);
      // Don't fail the appointment creation if reminders fail
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update fields
    const {
      title,
      provider,
      date,
      time,
      type,
      location,
      phone,
      notes,
      status
    } = req.body;

    if (title) appointment.title = title;
    if (provider) appointment.provider = provider;
    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (type) appointment.type = type;
    if (location !== undefined) appointment.location = location;
    if (phone !== undefined) appointment.phone = phone;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;

    await appointment.save();

    // Update reminders if date or time changed
    if (req.body.date || req.body.time) {
      try {
        await updateAppointmentReminders(appointment, req.user.userId);
      } catch (reminderError) {
        console.warn('Error updating appointment reminders:', reminderError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Delete associated reminders
    try {
      await deleteAppointmentReminders(req.params.id);
    } catch (reminderError) {
      console.warn('Error deleting appointment reminders:', reminderError);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
const getUpcomingAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 5 } = req.query;

    const now = new Date();
    const appointments = await Appointment.find({
      user: userId,
      date: { $gte: now },
      status: { $in: ['pending', 'confirmed'] }
    })
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments
};

