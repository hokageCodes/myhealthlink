const Notification = require('../models/Notification');
const { sendOTPEmail } = require('../utils/email');

/**
 * Create and store an in-app notification
 */
const createNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      userId,
      type: notificationData.type || 'system',
      title: notificationData.title,
      message: notificationData.message,
      actionUrl: notificationData.actionUrl,
      actionLabel: notificationData.actionLabel,
      relatedEntity: notificationData.relatedEntity,
      priority: notificationData.priority || 'medium',
      icon: notificationData.icon,
      color: notificationData.color || 'blue',
      expiresAt: notificationData.expiresAt,
      channels: {
        inApp: true,
        email: notificationData.sendEmail || false,
        sms: notificationData.sendSMS || false,
        push: notificationData.sendPush || false
      }
    });

    await notification.save();

    // Send via other channels if requested
    if (notificationData.sendEmail) {
      await sendEmailNotification(userId, notification);
    }

    // SMS and Push notifications would go here (when implemented)
    if (notificationData.sendSMS) {
      // TODO: Implement SMS sending
      notification.smsSent = false;
    }

    if (notificationData.sendPush) {
      // TODO: Implement push notification
      notification.pushSent = false;
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (userId, notification) => {
  try {
    // Get user email from User model
    const User = require('../models/User');
    const user = await User.findById(userId).select('email name');

    if (!user || !user.email) {
      console.warn(`Cannot send email: User ${userId} has no email`);
      return;
    }

    const { createTransporter } = require('../utils/email');
    const transporter = createTransporter();

    const mailOptions = {
      from: `"My Health Link" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: notification.title,
      html: generateEmailTemplate(notification, user.name)
    };

    await transporter.sendMail(mailOptions);

    // Update notification
    notification.emailSent = true;
    notification.emailSentAt = new Date();
    await notification.save();

    console.log(`Email notification sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

/**
 * Generate HTML email template for notifications
 */
const generateEmailTemplate = (notification, userName) => {
  const greeting = userName ? `Hi ${userName},` : 'Hello,';
  
  let actionButton = '';
  if (notification.actionUrl) {
    actionButton = `
      <div style="margin: 20px 0; text-align: center;">
        <a href="${notification.actionUrl}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          ${notification.actionLabel || 'View Details'}
        </a>
      </div>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">My Health Link</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          ${greeting}
        </p>
        <h2 style="color: #111827; margin-top: 0;">${notification.title}</h2>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
          ${notification.message}
        </p>
        ${actionButton}
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated notification from My Health Link.
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Send reminder notification
 */
const sendReminderNotification = async (reminder, userId) => {
  const notificationData = {
    type: 'reminder',
    title: `Reminder: ${reminder.title}`,
    message: reminder.description || `Don't forget: ${reminder.title}`,
    actionUrl: reminder.relatedMedicationId 
      ? `/dashboard/medications` 
      : reminder.relatedAppointmentId 
        ? `/dashboard/appointments`
        : `/dashboard/reminders`,
    actionLabel: 'View Details',
    relatedEntity: {
      id: reminder._id,
      type: 'Reminder'
    },
    priority: reminder.priority || 'medium',
    color: reminder.priority === 'urgent' ? 'red' : reminder.priority === 'high' ? 'orange' : 'blue',
    sendEmail: reminder.notifications?.email || false,
    sendSMS: reminder.notifications?.sms || false,
    sendPush: reminder.notifications?.push || false
  };

  return await createNotification(userId, notificationData);
};

/**
 * Send appointment notification
 */
const sendAppointmentNotification = async (appointment, userId, type = 'reminder') => {
  const timeUntil = getTimeUntilAppointment(appointment.date, appointment.time);
  
  const notificationData = {
    type: 'appointment',
    title: `Appointment: ${appointment.title}`,
    message: `${appointment.title} with ${appointment.provider} is ${timeUntil}`,
    actionUrl: `/dashboard/appointments`,
    actionLabel: 'View Appointment',
    relatedEntity: {
      id: appointment._id,
      type: 'Appointment'
    },
    priority: 'high',
    color: 'purple',
    sendEmail: true,
    sendPush: true
  };

  return await createNotification(userId, notificationData);
};

/**
 * Get time until appointment (helper function)
 */
const getTimeUntilAppointment = (date, time) => {
  const appointmentDateTime = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }

  const now = new Date();
  const diffMs = appointmentDateTime - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return 'very soon';
  }
};

module.exports = {
  createNotification,
  sendEmailNotification,
  sendReminderNotification,
  sendAppointmentNotification
};

