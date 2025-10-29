const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getHealthGoals,
  getHealthGoal,
  createHealthGoal,
  updateHealthGoal,
  deleteHealthGoal,
  addMilestone
} = require('../controllers/healthGoalController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getHealthGoals);
router.get('/:id', getHealthGoal);
router.post('/', createHealthGoal);
router.put('/:id', updateHealthGoal);
router.delete('/:id', deleteHealthGoal);
router.post('/:id/milestones', addMilestone);

module.exports = router;

