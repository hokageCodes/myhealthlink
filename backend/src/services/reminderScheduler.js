const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { sendReminderNotification } = require('./notificationService');
const { checkMissedMedications } = require('./missedMedicationService');

let schedulerRunning = false;

/**
 * Start the reminder scheduler
 * Runs every minute to check for due reminders
 */
const startScheduler = () => {
  if (schedulerRunning) {
    console.log('Reminder scheduler is already running');
    return;
  }

  console.log('🕐 Starting reminder scheduler...');

  // Run every minute to check reminders
  cron.schedule('* * * * *', async () => {
    await checkAndTriggerReminders();
  });

  // Check for missed medications every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await checkMissedMedications();
    } catch (error) {
      console.error('Error in missed medication check:', error);
    }
  });

  schedulerRunning = true;
  console.log('✅ Reminder scheduler started (checking every minute)');
};

/**
 * Check for reminders that need to be triggered
 */
const checkAndTriggerReminders = async () => {
  try {
    const now = new Date();
    
    // Find reminders that are:
    // 1. Active
    // 2. Have a nextTrigger time that has passed or is within the next minute
    // 3. Are scheduled for today (or once-time reminders)
    const dueReminders = await Reminder.find({
      isActive: true,
      nextTrigger: { $lte: new Date(now.getTime() + 60000) }, // Within next minute
      $or: [
        { frequency: 'once' }, // One-time reminders
        { frequency: 'daily' },
        { frequency: 'weekly', daysOfWeek: now.getDay() },
        { frequency: 'monthly' },
        { frequency: 'custom' }
      ]
    }).populate('user', 'email name');

    if (dueReminders.length === 0) {
      return; // No reminders due
    }

    console.log(`📬 Found ${dueReminders.length} reminder(s) to trigger`);

    for (const reminder of dueReminders) {
      try {
        await triggerReminder(reminder);
      } catch (error) {
        console.error(`Error triggering reminder ${reminder._id}:`, error);
        // Continue with other reminders even if one fails
      }
    }
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
};

/**
 * Trigger a single reminder
 */
const triggerReminder = async (reminder) => {
  console.log(`🔔 Triggering reminder: ${reminder.title} (User: ${reminder.user?._id || reminder.user})`);

  try {
    // Send notification
    const userId = reminder.user?._id || reminder.user;
    
    if (!userId) {
      console.warn(`Reminder ${reminder._id} has no user associated`);
      return;
    }

    await sendReminderNotification(reminder, userId);

    // Update reminder
    reminder.lastTriggered = new Date();
    
    // Calculate next trigger time
    reminder.calculateNextTrigger();
    
    // If it's a one-time reminder and has passed, deactivate
    if (reminder.frequency === 'once' && reminder.scheduledFor <= new Date()) {
      reminder.isActive = false;
      console.log(`Reminder ${reminder._id} deactivated (one-time completed)`);
    }

    await reminder.save();

    console.log(`✅ Reminder triggered successfully: ${reminder.title}`);
  } catch (error) {
    console.error(`Error triggering reminder ${reminder._id}:`, error);
    throw error;
  }
};

/**
 * Manual trigger (for testing or immediate execution)
 */
const triggerReminderById = async (reminderId) => {
  try {
    const reminder = await Reminder.findById(reminderId).populate('user', 'email name');
    
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    if (!reminder.isActive) {
      throw new Error('Reminder is not active');
    }

    await triggerReminder(reminder);
    return reminder;
  } catch (error) {
    console.error(`Error manually triggering reminder ${reminderId}:`, error);
    throw error;
  }
};

/**
 * Stop the scheduler (useful for graceful shutdown)
 */
const stopScheduler = () => {
  if (schedulerRunning) {
    schedulerRunning = false;
    console.log('⏹️  Reminder scheduler stopped');
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  checkAndTriggerReminders,
  triggerReminder,
  triggerReminderById
};

