const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const { sendNotification } = require('./notificationService');

/**
 * Process reminders that need to be triggered
 */
const processReminders = async () => {
  try {
    const now = new Date();
    
    // Find all active reminders where nextTrigger has passed
    const dueReminders = await Reminder.find({
      isActive: true,
      nextTrigger: { $lte: now },
    }).populate('user', 'name email phone');

    console.log(`[Reminder Scheduler] Found ${dueReminders.length} due reminders`);

    for (const reminder of dueReminders) {
      try {
        console.log(`[Reminder Scheduler] Processing reminder: ${reminder._id} - ${reminder.title}`);

        // Send notifications
        const notificationSent = await sendNotification(reminder.user._id, reminder);
        
        // Create notification record
        if (notificationSent) {
          await Notification.create({
            userId: reminder.user._id,
            type: 'reminder',
            title: reminder.title,
            message: reminder.description || `Reminder: ${reminder.title}`,
            relatedEntity: {
              id: reminder._id,
              type: 'Reminder',
            },
            channels: {
              email: reminder.notifications.email,
              sms: reminder.notifications.sms,
            },
            emailSent: true,
          });
        }

        // Update reminder
        reminder.lastTriggered = now;
        reminder.calculateNextTrigger();
        await reminder.save();

        console.log(`[Reminder Scheduler] Processed reminder: ${reminder._id}, next trigger: ${reminder.nextTrigger}`);
      } catch (error) {
        console.error(`[Reminder Scheduler] Error processing reminder ${reminder._id}:`, error);
        // Continue with other reminders even if one fails
      }
    }

    return {
      processed: dueReminders.length,
      success: true,
    };
  } catch (error) {
    console.error('[Reminder Scheduler] Error processing reminders:', error);
    return {
      processed: 0,
      success: false,
      error: error.message,
    };
  }
};

/**
 * Start the reminder scheduler
 */
const startScheduler = () => {
  console.log('[Reminder Scheduler] Starting scheduler...');

  // Run every 15 minutes
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Reminder Scheduler] Running scheduled check at', new Date().toISOString());
    await processReminders();
  });

  console.log('[Reminder Scheduler] Scheduler started successfully (running every 15 minutes)');

  // Run once immediately on startup (optional, for testing)
  // processReminders();
};

/**
 * Stop the scheduler
 */
const stopScheduler = () => {
  console.log('[Reminder Scheduler] Stopping scheduler...');
  // Note: node-cron doesn't have a built-in stop method
  // We would need to store the scheduled task and destroy it
};

module.exports = {
  startScheduler,
  stopScheduler,
  processReminders,
};
