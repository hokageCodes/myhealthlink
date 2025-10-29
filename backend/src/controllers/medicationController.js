const Medication = require('../models/Medication');
const { getMissedMedicationsForUser } = require('../services/missedMedicationService');

// @desc    Get all medications for a user
// @route   GET /api/medications
// @access  Private
const getMedications = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { user: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get medications with pagination
    let medications = await Medication.find(query)
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Use lean() for better performance

    // Calculate adherence for each medication
    medications = medications.map(med => {
      const medication = new Medication(med);
      const adherence = medication.calculateAdherence(30);
      return {
        ...med,
        adherencePercentage: adherence
      };
    });

    // Get total count for pagination
    const total = await Medication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: medications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single medication
// @route   GET /api/medications/:id
// @access  Private
const getMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.status(200).json({
      success: true,
      data: medication
    });
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new medication
// @route   POST /api/medications
// @access  Private
const createMedication = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      dosage,
      form,
      frequency,
      startDate,
      endDate,
      prescribedBy,
      instructions,
      status = 'active',
      reminderEnabled,
      reminderTimes
    } = req.body;

    // Validate required fields
    if (!name || !dosage || !frequency || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, dosage, frequency, and start date are required'
      });
    }

    // Create medication
    const medication = new Medication({
      user: userId,
      name,
      dosage,
      form: form || 'tablet',
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      prescribedBy: prescribedBy || '',
      instructions: instructions || '',
      status,
      reminderEnabled: reminderEnabled || false,
      reminderTimes: reminderTimes || []
    });

    await medication.save();

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: medication
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Update fields
    const {
      name,
      dosage,
      form,
      frequency,
      startDate,
      endDate,
      prescribedBy,
      instructions,
      status,
      reminderEnabled,
      reminderTimes
    } = req.body;

    if (name) medication.name = name;
    if (dosage) medication.dosage = dosage;
    if (form) medication.form = form;
    if (frequency) medication.frequency = frequency;
    if (startDate) medication.startDate = new Date(startDate);
    if (endDate !== undefined) medication.endDate = endDate ? new Date(endDate) : null;
    if (prescribedBy !== undefined) medication.prescribedBy = prescribedBy;
    if (instructions !== undefined) medication.instructions = instructions;
    if (status) medication.status = status;
    if (reminderEnabled !== undefined) medication.reminderEnabled = reminderEnabled;
    if (reminderTimes) medication.reminderTimes = reminderTimes;

    await medication.save();

    res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      data: medication
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get active medications
// @route   GET /api/medications/active
// @access  Private
const getActiveMedications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const medications = await Medication.find({
      user: userId,
      status: 'active'
    }).sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      data: medications
    });
  } catch (error) {
    console.error('Error fetching active medications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Log medication intake
// @route   POST /api/medications/:id/log
// @access  Private
const logMedicationIntake = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    const { taken = true, notes = '' } = req.body;

    await medication.logIntake(taken, notes);

    // Calculate updated adherence
    const adherence = medication.calculateAdherence(30);

    res.status(200).json({
      success: true,
      message: taken ? 'Medication intake logged' : 'Missed dose logged',
      data: {
        medication: medication,
        adherence: adherence
      }
    });
  } catch (error) {
    console.error('Error logging medication intake:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get medication adherence stats
// @route   GET /api/medications/:id/adherence
// @access  Private
const getMedicationAdherence = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).select('adherenceLog missedDoses frequency reminderTimes');

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    const { days = 30 } = req.query;
    const adherence = medication.calculateAdherence(parseInt(days));

    // Get recent logs
    const recentLogs = medication.adherenceLog
      .slice(-parseInt(days))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: {
        adherence,
        recentLogs,
        missedDoses: medication.missedDoses.slice(-parseInt(days)),
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching medication adherence:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get missed medications for user
// @route   GET /api/medications/missed
// @access  Private
const getMissedMedications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 7 } = req.query;

    const missedMedications = await getMissedMedicationsForUser(userId, parseInt(days));

    res.status(200).json({
      success: true,
      data: missedMedications,
      count: missedMedications.length
    });
  } catch (error) {
    console.error('Error fetching missed medications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication,
  getActiveMedications,
  logMedicationIntake,
  getMedicationAdherence,
  getMissedMedications
};

