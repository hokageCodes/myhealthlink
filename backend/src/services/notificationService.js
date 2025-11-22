const nodemailer = require('nodemailer');
const User = require('../models/User');

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration is missing. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email notification
 */
const sendEmail = async (to, subject, body, isHTML = true) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Email transporter not available');
      return false;
    }

    const mailOptions = {
      from: `"My Health Link" <${process.env.SMTP_USER}>`,
      to,
      subject,
      [isHTML ? 'html' : 'text']: body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Generate email template for medication reminder
 */
const generateMedicationReminderEmail = (userName, medicationName, dosage, notes) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #16a34a; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">⏰ Medication Reminder</h1>
      </div>
      <div style="padding: 30px; background-color: #f9fafb;">
        <p style="font-size: 16px;">Hello ${userName},</p>
        <p style="font-size: 16px;">It's time to take your medication!</p>
        <div style="background-color: white; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
          <h2 style="color: #16a34a; margin-top: 0;">${medicationName}</h2>
          ${dosage ? `<p style="font-size: 16px; margin: 10px 0;"><strong>Dosage:</strong> ${dosage}</p>` : ''}
          ${notes ? `<p style="font-size: 14px; color: #666;">${notes}</p>` : ''}
        </div>
        <p style="font-size: 14px; color: #666;">Please remember to take your medication as prescribed.</p>
        <p style="font-size: 14px; color: #666;">Take care! 💚</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          This is an automated reminder from MyHealthLink
        </p>
      </div>
    </div>
  `;
};

/**
 * Generate email template for appointment reminder
 */
const generateAppointmentReminderEmail = (userName, appointmentTitle, dateTime, location, notes) => {
  const formattedDate = new Date(dateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">📅 Appointment Reminder</h1>
      </div>
      <div style="padding: 30px; background-color: #f9fafb;">
        <p style="font-size: 16px;">Hello ${userName},</p>
        <p style="font-size: 16px;">You have an upcoming appointment!</p>
        <div style="background-color: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
          <h2 style="color: #3b82f6; margin-top: 0;">${appointmentTitle}</h2>
          <p style="font-size: 16px; margin: 10px 0;"><strong>📅 Date & Time:</strong> ${formattedDate}</p>
          ${location ? `<p style="font-size: 16px; margin: 10px 0;"><strong>📍 Location:</strong> ${location}</p>` : ''}
          ${notes ? `<p style="font-size: 14px; color: #666;">${notes}</p>` : ''}
        </div>
        <p style="font-size: 14px; color: #666;">Please plan to arrive 15 minutes early.</p>
        <p style="font-size: 14px; color: #666;">Take care! 💙</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          This is an automated reminder from MyHealthLink
        </p>
      </div>
    </div>
  `;
};

/**
 * Generate email template for health check reminder
 */
const generateHealthCheckReminderEmail = (userName, title, description) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Health Check Reminder</h1>
      </div>
      <div style="padding: 30px; background-color: #f9fafb;">
        <p style="font-size: 16px;">Hello ${userName},</p>
        <p style="font-size: 16px;">Time for your health check!</p>
        <div style="background-color: white; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
          <h2 style="color: #f59e0b; margin-top: 0;">${title}</h2>
          ${description ? `<p style="font-size: 14px; color: #666;">${description}</p>` : ''}
        </div>
        <p style="font-size: 14px; color: #666;">Don't forget to track your health metrics!</p>
        <p style="font-size: 14px; color: #666;">Take care! 💛</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          This is an automated reminder from MyHealthLink
        </p>
      </div>
    </div>
  `;
};

/**
 * Send SMS notification (placeholder for future implementation)
 */
const sendSMS = async (to, message) => {
  // TODO: Implement SMS integration with Twilio or Africa's Talking
  console.log(`[SMS] Would send to ${to}: ${message}`);
  return false;
};

/**
 * Send notification based on type
 */
const sendNotification = async (user, reminder) => {
  try {
    // Get user details
    const userDetails = await User.findById(user).select('name email phone');
    if (!userDetails) {
      console.error(`User not found: ${user}`);
      return false;
    }

    let success = false;
    const userName = userDetails.name || 'Valued User';

    // Send email if enabled
    if (reminder.notifications.email) {
      let emailBody = '';
      let subject = '';

      switch (reminder.type) {
        case 'medication':
          subject = `Medication Reminder: ${reminder.title}`;
          emailBody = generateMedicationReminderEmail(
            userName,
            reminder.title || reminder.medicationName,
            reminder.dosage,
            reminder.description
          );
          break;

        case 'appointment':
          subject = `Appointment Reminder: ${reminder.title}`;
          emailBody = generateAppointmentReminderEmail(
            userName,
            reminder.title,
            reminder.scheduledFor,
            null,
            reminder.description
          );
          break;

        case 'health-check':
        case 'vaccination':
        case 'lab-test':
          subject = `Health Check Reminder: ${reminder.title}`;
          emailBody = generateHealthCheckReminderEmail(
            userName,
            reminder.title,
            reminder.description
          );
          break;

        default:
          subject = `Reminder: ${reminder.title}`;
          emailBody = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Reminder</h2>
              <p>${reminder.description || reminder.title}</p>
            </div>
          `;
      }

      success = await sendEmail(userDetails.email, subject, emailBody);
    }

    // Send SMS if enabled (future implementation)
    if (reminder.notifications.sms && userDetails.phone) {
      const smsMessage = `MyHealthLink Reminder: ${reminder.title}`;
      await sendSMS(userDetails.phone, smsMessage);
    }

    return success;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendNotification,
  generateMedicationReminderEmail,
  generateAppointmentReminderEmail,
  generateHealthCheckReminderEmail,
};
