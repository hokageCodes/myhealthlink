const Reminder = require('../models/Reminder');

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const { type, isActive, limit = 50, page = 1 } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { user: userId };
    
    if (type) {
      query.type = type;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get reminders with pagination
    const reminders = await Reminder.find(query)
      .sort({ nextTrigger: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Reminder.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reminders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
const getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reminderData = req.body;

    // Validate required fields
    if (!reminderData.title || !reminderData.type || !reminderData.frequency) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, and frequency are required'
      });
    }

    // Create reminder
    const reminder = new Reminder({
      user: userId,
      ...reminderData,
      scheduledFor: reminderData.scheduledFor ? new Date(reminderData.scheduledFor) : undefined
    });

    // Calculate next trigger
    reminder.calculateNextTrigger();

    await reminder.save();

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        if (key === 'scheduledFor') {
          reminder[key] = new Date(req.body[key]);
        } else {
          reminder[key] = req.body[key];
        }
      }
    });

    // Recalculate next trigger if scheduling changed
    if (req.body.frequency || req.body.timeOfDay || req.body.scheduledFor) {
      reminder.calculateNextTrigger();
    }

    await reminder.save();

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark reminder as completed
// @route   POST /api/reminders/:id/complete
// @access  Private
const markCompleted = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.markCompleted();
    await reminder.save();

    res.status(200).json({
      success: true,
      message: 'Reminder marked as completed',
      data: reminder
    });
  } catch (error) {
    console.error('Error marking reminder completed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get upcoming reminders
// @route   GET /api/reminders/upcoming
// @access  Private
const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10 } = req.query;

    const now = new Date();
    const reminders = await Reminder.find({
      user: userId,
      isActive: true,
      nextTrigger: { $gte: now }
    })
      .sort({ nextTrigger: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  markCompleted,
  getUpcomingReminders
};

