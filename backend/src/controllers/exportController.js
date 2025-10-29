const HealthMetric = require('../models/HealthMetric');
const Document = require('../models/Document');
const Appointment = require('../models/Appointment');
const Medication = require('../models/Medication');
const User = require('../models/User');

// @desc    Export health data as JSON
// @route   GET /api/export/json
// @access  Private
const exportJSON = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Fetch all user data
    const [user, metrics, documents, appointments, medications] = await Promise.all([
      User.findById(userId).select('-password -refreshTokens -emailOTP'),
      HealthMetric.find({ userId, ...dateFilter }).sort({ date: -1 }),
      Document.find({ user: userId }).sort({ createdAt: -1 }),
      Appointment.find({ user: userId }).sort({ date: -1 }),
      Medication.find({ user: userId }).sort({ startDate: -1 })
    ]);

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        bloodType: user.bloodType,
        genotype: user.genotype,
        allergies: user.allergies,
        chronicConditions: user.chronicConditions,
        emergencyContact: user.emergencyContact
      },
      healthMetrics: metrics,
      documents: documents.map(doc => ({
        title: doc.title,
        category: doc.category,
        date: doc.date,
        description: doc.description,
        fileUrl: doc.fileUrl
      })),
      appointments: appointments.map(apt => ({
        title: apt.title,
        provider: apt.provider,
        date: apt.date,
        time: apt.time,
        type: apt.type,
        location: apt.location,
        status: apt.status,
        notes: apt.notes
      })),
      medications: medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: med.startDate,
        endDate: med.endDate,
        status: med.status,
        prescribedBy: med.prescribedBy
      })),
      exportDate: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=health-data-${Date.now()}.json`);
    res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Export health data as CSV
// @route   GET /api/export/csv
// @access  Private
const exportCSV = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type = 'metrics' } = req.query;

    let csvData = '';
    
    if (type === 'metrics') {
      const metrics = await HealthMetric.find({ userId }).sort({ date: -1 });
      csvData = 'Date,Type,Value,Unit,Notes\n';
      metrics.forEach(metric => {
        const date = new Date(metric.date).toLocaleDateString();
        const value = typeof metric.value === 'object' 
          ? JSON.stringify(metric.value) 
          : metric.value;
        csvData += `"${date}","${metric.type}","${value}","${metric.unit || ''}","${metric.notes || ''}"\n`;
      });
    } else if (type === 'appointments') {
      const appointments = await Appointment.find({ user: userId }).sort({ date: -1 });
      csvData = 'Date,Time,Title,Provider,Type,Location,Status\n';
      appointments.forEach(apt => {
        const date = new Date(apt.date).toLocaleDateString();
        csvData += `"${date}","${apt.time}","${apt.title}","${apt.provider}","${apt.type}","${apt.location || ''}","${apt.status}"\n`;
      });
    } else if (type === 'medications') {
      const medications = await Medication.find({ user: userId }).sort({ startDate: -1 });
      csvData = 'Name,Dosage,Frequency,Start Date,End Date,Status,Prescribed By\n';
      medications.forEach(med => {
        const startDate = new Date(med.startDate).toLocaleDateString();
        const endDate = med.endDate ? new Date(med.endDate).toLocaleDateString() : '';
        csvData += `"${med.name}","${med.dosage}","${med.frequency}","${startDate}","${endDate}","${med.status}","${med.prescribedBy || ''}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${Date.now()}.csv`);
    res.status(200).send(csvData);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  exportJSON,
  exportCSV
};

