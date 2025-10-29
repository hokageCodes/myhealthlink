const Reminder = require('../models/Reminder');

/**
 * Create automatic reminders for an appointment
 * Creates reminders at 24 hours before and 1 hour before appointment
 */
const createAppointmentReminders = async (appointment, userId) => {
  try {
    const appointmentDate = new Date(appointment.date);
    
    // Parse time (format: "HH:MM")
    if (appointment.time) {
      const [hours, minutes] = appointment.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // Default to 9 AM if no time specified
      appointmentDate.setHours(9, 0, 0, 0);
    }

    const now = new Date();
    const reminders = [];

    // Only create reminders if appointment is in the future
    if (appointmentDate <= now) {
      console.log(`Appointment ${appointment._id} is in the past, skipping reminder creation`);
      return [];
    }

    // Calculate reminder times
    const reminder24hBefore = new Date(appointmentDate);
    reminder24hBefore.setHours(reminder24hBefore.getHours() - 24);

    const reminder1hBefore = new Date(appointmentDate);
    reminder1hBefore.setHours(reminder1hBefore.getHours() - 1);

    // Create 24-hour reminder (only if it's at least an hour in the future)
    if (reminder24hBefore > now) {
      const reminder24h = new Reminder({
        user: userId,
        type: 'appointment',
        title: `Appointment Reminder: ${appointment.title}`,
        description: `Your appointment with ${appointment.provider} is in 24 hours.`,
        frequency: 'once',
        scheduledFor: reminder24hBefore,
        nextTrigger: reminder24hBefore,
        relatedAppointmentId: appointment._id,
        notifications: {
          inApp: true,
          email: true,
          push: true,
          sms: false
        },
        priority: 'medium',
        isActive: true
      });

      await reminder24h.save();
      reminders.push(reminder24h);
      console.log(`Created 24h reminder for appointment ${appointment._id}`);
    }

    // Create 1-hour reminder
    if (reminder1hBefore > now) {
      const reminder1h = new Reminder({
        user: userId,
        type: 'appointment',
        title: `Appointment Soon: ${appointment.title}`,
        description: `Your appointment with ${appointment.provider} is in 1 hour. ${appointment.location ? `Location: ${appointment.location}` : ''}`,
        frequency: 'once',
        scheduledFor: reminder1hBefore,
        nextTrigger: reminder1hBefore,
        relatedAppointmentId: appointment._id,
        notifications: {
          inApp: true,
          email: true,
          push: true,
          sms: true // SMS for urgent 1-hour reminder
        },
        priority: 'high',
        isActive: true
      });

      await reminder1h.save();
      reminders.push(reminder1h);
      console.log(`Created 1h reminder for appointment ${appointment._id}`);
    }

    return reminders;
  } catch (error) {
    console.error('Error creating appointment reminders:', error);
    throw error;
  }
};

/**
 * Update reminders when appointment is updated
 */
const updateAppointmentReminders = async (appointment, userId) => {
  try {
    // Delete existing reminders for this appointment
    await Reminder.deleteMany({
      user: userId,
      relatedAppointmentId: appointment._id
    });

    // Create new reminders with updated times
    return await createAppointmentReminders(appointment, userId);
  } catch (error) {
    console.error('Error updating appointment reminders:', error);
    throw error;
  }
};

/**
 * Delete reminders when appointment is deleted
 */
const deleteAppointmentReminders = async (appointmentId) => {
  try {
    const result = await Reminder.deleteMany({
      relatedAppointmentId: appointmentId
    });
    console.log(`Deleted ${result.deletedCount} reminder(s) for appointment ${appointmentId}`);
    return result;
  } catch (error) {
    console.error('Error deleting appointment reminders:', error);
    throw error;
  }
};

module.exports = {
  createAppointmentReminders,
  updateAppointmentReminders,
  deleteAppointmentReminders
};

