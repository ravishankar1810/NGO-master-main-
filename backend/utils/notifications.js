const twilio = require('twilio');
const admin = require('firebase-admin');

// Ensure graceful fallback if env variables aren't strictly set right away in dev
const isTwilioConfigured = 
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_ACCOUNT_SID !== 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_AUTH_TOKEN !== 'your_auth_token_here';

const twilioClient = isTwilioConfigured ? twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
) : null;

// Firebase initialization
/*
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
*/

const sendSMS = async (toPhone, message) => {
  if (!twilioClient) {
    console.log(`[STUB] SMS to ${toPhone}: ${message}`);
    return;
  }
  
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone
    });
    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
};

const Notification = require('../models/Notification');

const sendPushNotification = async (fcmToken, title, body) => {
  if (!admin.apps.length || !fcmToken) {
    console.log(`[STUB] Push to ${fcmToken}: ${title} - ${body}`);
    return;
  }

  try {
    const message = {
      notification: { title, body },
      token: fcmToken
    };
    await admin.messaging().send(message);
    console.log('Push notification sent');
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
};

const createInAppNotification = async (userId, title, body, type = 'system', link = '') => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      body,
      type,
      link
    });
    return notification;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
};

module.exports = {
  sendSMS,
  sendPushNotification,
  createInAppNotification,
  twilioClient // exported for Voice API
};
