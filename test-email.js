// Test script to verify email configuration
// Run with: node test-email.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const testEmailConfiguration = async () => {
  console.log('🔍 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST ? '✅ Set' : '❌ Missing'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT ? '✅ Set' : '❌ Missing'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Missing required SMTP configuration. Please check your .env.local file.');
    return;
  }
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
    
    console.log('🔌 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    // Test email sending
    console.log('📧 Testing email sending...');
    
    const testEmail = process.env.SMTP_USER; // Send to self for testing
    
    const mailOptions = {
      from: `"MyHealthLink Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: 'MyHealthLink Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">MyHealthLink</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Email Configuration Test</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">✅ Email Test Successful!</h2>
            
            <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
              Your email configuration is working correctly. You can now register users and send verification emails.
            </p>
            
            <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">Configuration Details:</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>SMTP Host: ${process.env.SMTP_HOST}</li>
                <li>SMTP Port: ${process.env.SMTP_PORT || 587}</li>
                <li>SMTP User: ${process.env.SMTP_USER}</li>
                <li>App URL: ${process.env.NEXT_PUBLIC_APP_URL}</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This is a test email from MyHealthLink.</p>
          </div>
        </div>
      `,
      text: `
        MyHealthLink - Email Configuration Test
        
        ✅ Email Test Successful!
        
        Your email configuration is working correctly. You can now register users and send verification emails.
        
        Configuration Details:
        - SMTP Host: ${process.env.SMTP_HOST}
        - SMTP Port: ${process.env.SMTP_PORT || 587}
        - SMTP User: ${process.env.SMTP_USER}
        - App URL: ${process.env.NEXT_PUBLIC_APP_URL}
        
        ---
        MyHealthLink - One Link for Your Health
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent successfully! Message ID: ${result.messageId}`);
    console.log(`📬 Check your inbox at: ${testEmail}\n`);
    
    console.log('🎉 Email configuration is working perfectly!');
    console.log('You can now register users and they will receive verification emails.');
    
  } catch (error) {
    console.error('❌ Email configuration test failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - SMTP_USER is correct');
      console.log('   - SMTP_PASS is correct');
      console.log('   - If using Gmail, use an App Password instead of your regular password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   - SMTP_HOST is correct');
      console.log('   - SMTP_PORT is correct');
      console.log('   - Internet connection is working');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection timeout. Please check:');
      console.log('   - SMTP server is accessible');
      console.log('   - Firewall settings');
    }
  }
};

// Run the test
testEmailConfiguration().catch(console.error);
