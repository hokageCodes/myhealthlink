const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration is missing. Please check your environment variables.');
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

// ✅ Define and export this function
const sendOTPEmail = async (to, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"My Health Link" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family:sans-serif; color:#333;">
        <h2>Your OTP Code</h2>
        <p>Use the following OTP to complete your registration:</p>
        <h1 style="letter-spacing: 5px; color: #1d4ed8;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send emergency SOS email
const sendSOSEmail = async (to, patientName, location, accessLink, hospitalContact) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Email transporter not available');
      return false;
    }

    const locationStr = location 
      ? `<p><strong>Location:</strong> ${location.address || `https://maps.google.com/?q=${location.latitude},${location.longitude}`}</p>`
      : '<p><strong>Location:</strong> Unknown</p>';
    
    const hospitalStr = hospitalContact 
      ? `<p><strong>Hospital Contact:</strong> ${hospitalContact}</p>`
      : '';

    const mailOptions = {
      from: `"My Health Link" <${process.env.SMTP_USER}>`,
      to,
      subject: `🚨 EMERGENCY SOS - ${patientName}`,
      html: `
        <div style="font-family:sans-serif; color:#333; max-width:600px; margin:0 auto;">
          <div style="background-color:#dc2626; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0; font-size:24px;">🚨 EMERGENCY SOS ALERT 🚨</h1>
          </div>
          <div style="padding:20px; background-color:#fee2e2; border-left:4px solid #dc2626;">
            <h2 style="color:#991b1b; margin-top:0;">${patientName} needs immediate medical attention!</h2>
            ${locationStr}
            ${hospitalStr}
          </div>
          <div style="padding:20px; background-color:#f9fafb;">
            <p><strong>Access their health information:</strong></p>
            <a href="${accessLink}" style="display:inline-block; background-color:#dc2626; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
              VIEW HEALTH PROFILE
            </a>
          </div>
          <div style="padding:20px; background-color:#f3f4f6; font-size:12px; color:#6b7280;">
            <p style="margin:0;">This is an automated alert from MyHealthLink. Please respond urgently.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Emergency email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending emergency email:', error);
    return false;
  }
};

// ✅ Export functions
module.exports = {
  sendOTPEmail,
  sendSOSEmail,
  createTransporter,
};
