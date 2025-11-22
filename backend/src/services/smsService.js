/**
 * SMS Service
 * Currently a placeholder for SMS integration with Twilio, Africa's Talking, or similar
 */

/**
 * Send SMS via Twilio
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
const sendSMSTwilio = async (to, message) => {
  try {
    // Only attempt if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('[SMS] Twilio credentials not configured');
      return false;
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log(`[SMS] Sent via Twilio to ${to}: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Twilio error:', error);
    return false;
  }
};

/**
 * Send SOS SMS
 */
const sendSOS = async (phoneNumbers, message, patientName, location) => {
  try {
    console.log(`[SMS] Sending SOS to ${phoneNumbers.length} contacts`);

    let successCount = 0;
    let failureCount = 0;

    for (const phoneNumber of phoneNumbers) {
      // Try Twilio first (if configured)
      const sent = await sendSMSTwilio(phoneNumber, message);
      
      if (sent) {
        successCount++;
      } else {
        failureCount++;
        // In development, log the SMS content for testing
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[SMS DEV] Would send to ${phoneNumber}:`);
          console.log(message);
        }
      }
    }

    console.log(`[SMS] SOS complete: ${successCount} sent, ${failureCount} failed`);
    return { success: successCount > 0, successCount, failureCount };
  } catch (error) {
    console.error('[SMS] SOS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate emergency SMS message
 */
const generateEmergencyMessage = (patientName, location, accessLink, hospitalContact) => {
  const locationStr = location 
    ? `Location: ${location.address || `https://maps.google.com/?q=${location.latitude},${location.longitude}`}`
    : 'Location: Unknown';
  
  const hospitalStr = hospitalContact 
    ? `Hospital Contact: ${hospitalContact}`
    : '';
  
  return `🚨 EMERGENCY SOS - ${patientName} 🚨

${locationStr}

The person needs medical attention. Access health information:
${accessLink}

${hospitalStr}

Please respond urgently. This is an automated alert from MyHealthLink.`;
};

module.exports = {
  sendSOS,
  sendSMSTwilio,
  generateEmergencyMessage,
};

