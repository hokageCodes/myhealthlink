const mongoose = require('mongoose');
const HealthMetric = require('../models/HealthMetric');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');

// @desc    Get health metrics for a user
// @route   GET /api/health/metrics
// @access  Private
const getHealthMetrics = async (req, res) => {
  try {
    const { type, limit = 50, startDate, endDate } = req.query;
    const userId = req.user.userId;

    let query = { userId };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const metrics = await HealthMetric.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Decrypt notes for all metrics
    const decryptedMetrics = metrics.map(metric => {
      if (metric.notes) {
        try {
          metric.notes = decrypt(metric.notes);
        } catch (e) {
          // If decryption fails, notes might not be encrypted (old data)
          console.warn('Could not decrypt notes for metric:', metric._id);
        }
      }
      return metric;
    });

    res.status(200).json({
      success: true,
      data: decryptedMetrics
    });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add a new health metric
// @route   POST /api/health/metrics
// @access  Private
const addHealthMetric = async (req, res) => {
  try {
    const { type, value, unit, notes, date, metadata } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!type || value === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Type, value, and unit are required'
      });
    }

    // Validate blood pressure format
    if (type === 'bloodPressure') {
      if (typeof value !== 'object' || !value.systolic || !value.diastolic) {
        return res.status(400).json({
          success: false,
          message: 'Blood pressure must have systolic and diastolic values'
        });
      }
    }

    // Encrypt sensitive notes if provided
    const encryptedNotes = notes ? encrypt(notes) : null;

    const healthMetric = new HealthMetric({
      userId,
      type,
      value,
      unit,
      notes: encryptedNotes,
      date: date ? new Date(date) : new Date(),
      metadata: metadata || {}
    });

    await healthMetric.save();

    // Decrypt notes for response
    if (healthMetric.notes) {
      try {
        healthMetric.notes = decrypt(healthMetric.notes);
      } catch (e) {
        // If decryption fails, notes might not be encrypted (old data)
        console.warn('Could not decrypt notes:', e);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Health metric added successfully',
      data: healthMetric
    });
  } catch (error) {
    console.error('Error adding health metric:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a health metric
// @route   PUT /api/health/metrics/:id
// @access  Private
const updateHealthMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { type, value, unit, notes, date, metadata } = req.body;

    const healthMetric = await HealthMetric.findOne({ _id: id, userId });

    if (!healthMetric) {
      return res.status(404).json({
        success: false,
        message: 'Health metric not found'
      });
    }

    // Update fields
    if (type !== undefined) healthMetric.type = type;
    if (value !== undefined) healthMetric.value = value;
    if (unit !== undefined) healthMetric.unit = unit;
    if (notes !== undefined) {
      // Encrypt notes before saving
      healthMetric.notes = notes ? encrypt(notes) : null;
    }
    if (date !== undefined) healthMetric.date = new Date(date);
    if (metadata !== undefined) healthMetric.metadata = metadata;

    await healthMetric.save();

    // Decrypt notes for response
    if (healthMetric.notes) {
      try {
        healthMetric.notes = decrypt(healthMetric.notes);
      } catch (e) {
        console.warn('Could not decrypt notes:', e);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Health metric updated successfully',
      data: healthMetric
    });
  } catch (error) {
    console.error('Error updating health metric:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a health metric
// @route   DELETE /api/health/metrics/:id
// @access  Private
const deleteHealthMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const healthMetric = await HealthMetric.findOne({ _id: id, userId });

    if (!healthMetric) {
      return res.status(404).json({
        success: false,
        message: 'Health metric not found'
      });
    }

    await HealthMetric.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Health metric deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health metric:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get health summary/stats
// @route   GET /api/health/summary
// @access  Private
const getHealthSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get latest metrics for each type
    const latestMetrics = await HealthMetric.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$type',
          latestValue: { $first: '$value' },
          latestUnit: { $first: '$unit' },
          latestDate: { $first: '$date' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get trends for the specified period
    const trends = await HealthMetric.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          average: { $avg: '$value' },
          min: { $min: '$value' },
          max: { $max: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        latest: latestMetrics,
        trends: trends,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching health summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getHealthMetrics,
  addHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthSummary,
};
