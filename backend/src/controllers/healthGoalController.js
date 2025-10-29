const HealthGoal = require('../models/HealthGoal');

// @desc    Get all health goals for user
// @route   GET /api/health-goals
// @access  Private
const getHealthGoals = async (req, res) => {
  try {
    const { status, category, limit = 50 } = req.query;
    const userId = req.user.userId;

    const query = { user: userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const goals = await HealthGoal.find(query)
      .sort({ targetDate: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Error fetching health goals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single health goal
// @route   GET /api/health-goals/:id
// @access  Private
const getHealthGoal = async (req, res) => {
  try {
    const goal = await HealthGoal.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Health goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error fetching health goal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create health goal
// @route   POST /api/health-goals
// @access  Private
const createHealthGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      targetDate,
      reminders
    } = req.body;

    // Validation
    if (!title || !category || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and target date are required'
      });
    }

    const goal = new HealthGoal({
      user: req.user.userId,
      title,
      description,
      category,
      targetValue,
      currentValue: currentValue || 0,
      unit,
      targetDate: new Date(targetDate),
      reminders: reminders || { enabled: false }
    });

    // Calculate initial progress
    goal.calculateProgress();

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Health goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error creating health goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update health goal
// @route   PUT /api/health-goals/:id
// @access  Private
const updateHealthGoal = async (req, res) => {
  try {
    const goal = await HealthGoal.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Health goal not found'
      });
    }

    const {
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      targetDate,
      status,
      reminders
    } = req.body;

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (currentValue !== undefined) goal.currentValue = currentValue;
    if (unit !== undefined) goal.unit = unit;
    if (targetDate !== undefined) goal.targetDate = new Date(targetDate);
    if (status !== undefined) goal.status = status;
    if (reminders !== undefined) goal.reminders = { ...goal.reminders, ...reminders };

    // Recalculate progress
    goal.calculateProgress();

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Health goal updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error updating health goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete health goal
// @route   DELETE /api/health-goals/:id
// @access  Private
const deleteHealthGoal = async (req, res) => {
  try {
    const goal = await HealthGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Health goal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Health goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health goal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add milestone to goal
// @route   POST /api/health-goals/:id/milestones
// @access  Private
const addMilestone = async (req, res) => {
  try {
    const { value, notes } = req.body;

    const goal = await HealthGoal.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Health goal not found'
      });
    }

    await goal.addMilestone(value, notes);

    res.status(200).json({
      success: true,
      message: 'Milestone added successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error adding milestone:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  getHealthGoals,
  getHealthGoal,
  createHealthGoal,
  updateHealthGoal,
  deleteHealthGoal,
  addMilestone
};

