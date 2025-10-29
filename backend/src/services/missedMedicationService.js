const Medication = require('../models/Medication');
const { createNotification } = require('./notificationService');

/**
 * Check for missed medications
 * Runs periodically to detect medications that should have been taken but weren't
 */
const checkMissedMedications = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Minutes since midnight

    // Find active medications with reminders enabled
    const activeMedications = await Medication.find({
      status: 'active',
      reminderEnabled: true
    }).populate('user', 'email name');

    const missedMedications = [];

    for (const medication of activeMedications) {
      if (!medication.reminderTimes || medication.reminderTimes.length === 0) {
        continue; // No reminder times set
      }

      // Check each reminder time
      for (const reminderTime of medication.reminderTimes) {
        const reminderMinutes = reminderTime.hour * 60 + reminderTime.minute;
        
        // Check if reminder time has passed today (with 15-minute grace period)
        if (currentTime >= reminderMinutes + 15) {
          // Check if medication was logged today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayLog = medication.adherenceLog.find(log => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
          });

          // If no log for today, or log exists but marked as not taken
          if (!todayLog || todayLog.taken === false) {
            // Check if already in missed list for today
            const alreadyMissed = medication.missedDoses.find(missed => {
              const missedDate = new Date(missed.date);
              missedDate.setHours(0, 0, 0, 0);
              return missedDate.getTime() === today.getTime();
            });

            if (!alreadyMissed) {
              // Log as missed
              const scheduledTime = `${String(reminderTime.hour).padStart(2, '0')}:${String(reminderTime.minute).padStart(2, '0')}`;
              await medication.logMissed(today, scheduledTime, 'Not taken within reminder time window');
              
              missedMedications.push({
                medication,
                scheduledTime,
                userId: medication.user?._id || medication.user
              });

              // Send notification
              const userId = medication.user?._id || medication.user;
              if (userId) {
                try {
                  await createNotification(userId, {
                    type: 'alert',
                    title: 'Missed Medication',
                    message: `You missed your scheduled dose of ${medication.name} at ${scheduledTime}. Please take it as soon as possible.`,
                    actionUrl: '/dashboard/medications',
                    actionLabel: 'View Medications',
                    priority: 'high',
                    color: 'red',
                    sendEmail: true,
                    sendPush: true
                  });
                } catch (notifError) {
                  console.error(`Error sending missed medication notification:`, notifError);
                }
              }
            }
          }
        }
      }
    }

    if (missedMedications.length > 0) {
      console.log(`⚠️  Detected ${missedMedications.length} missed medication(s)`);
    }

    return missedMedications;
  } catch (error) {
    console.error('Error checking missed medications:', error);
    throw error;
  }
};

/**
 * Get missed medications for a user
 */
const getMissedMedicationsForUser = async (userId, days = 7) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const medications = await Medication.find({
      user: userId,
      status: 'active',
      missedDoses: {
        $elemMatch: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      }
    }).select('name dosage missedDoses');

    const missedList = [];

    medications.forEach(medication => {
      medication.missedDoses.forEach(missed => {
        const missedDate = new Date(missed.date);
        if (missedDate >= startDate && missedDate <= endDate) {
          missedList.push({
            medicationId: medication._id,
            medicationName: medication.name,
            dosage: medication.dosage,
            date: missed.date,
            scheduledTime: missed.scheduledTime,
            reason: missed.reason
          });
        }
      });
    });

    return missedList.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error fetching missed medications:', error);
    throw error;
  }
};

module.exports = {
  checkMissedMedications,
  getMissedMedicationsForUser
};

