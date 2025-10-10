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

// ✅ Export both functions
module.exports = {
  sendOTPEmail,
};
