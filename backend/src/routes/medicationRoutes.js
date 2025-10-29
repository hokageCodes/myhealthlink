const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication,
  getActiveMedications,
  logMedicationIntake,
  getMedicationAdherence,
  getMissedMedications
} = require('../controllers/medicationController');

const router = express.Router();

// All medication routes require authentication
router.use(authenticate);

// Medication routes
router.get('/', getMedications);
router.get('/active', getActiveMedications);
router.get('/missed', getMissedMedications);
router.get('/:id', getMedication);
router.get('/:id/adherence', getMedicationAdherence);
router.post('/', createMedication);
router.post('/:id/log', logMedicationIntake);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

module.exports = router;

