const CallLog = require('../models/CallLog');
const User = require('../models/User');
const { twilioClient } = require('../utils/notifications');

const triggerAppreciationCall = async (donor, campaignId, ngoId) => {
  try {
    if (!donor || !donor.phone) {
      console.log('Appreciation call skipped: Donor phone missing');
      return null;
    }

    let callSid = `stub_sid_${Date.now()}`;

    // If fully configured, dial
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      const call = await twilioClient.calls.create({
        url: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/calls/twiml`,
        to: donor.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        statusCallback: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/calls/webhook`,
        statusCallbackEvent: ['answered', 'completed']
      });
      callSid = call.sid;
      console.log(`[LIVE] Appreciation call initiated: ${callSid} to ${donor.phone}`);
    } else {
      const reason = !twilioClient ? 'Twilio not configured (check SID/AuthToken)' : 'TWILIO_PHONE_NUMBER missing';
      console.log(`[STUB] Appreciation call skipped (${reason}). Would use TwiML: ${process.env.SERVER_URL || 'http://localhost:5000'}/api/calls/twiml`);
    }

    // Always create a log
    const log = await CallLog.create({
      ngoId: ngoId,
      donorId: donor._id,
      phone: donor.phone,
      campaignId,
      callSid,
      status: 'initiated'
    });

    console.log(`Appreciation call initiated: ${callSid}`);
    return log;
  } catch (error) {
    console.error('Trigger appreciation call error:', error);
    return null;
  }
};

// POST /api/calls/initiate
const initiateCall = async (req, res) => {
  try {
    const { donorId, campaignId } = req.body;
    
    // Validate request
    const donor = await User.findById(donorId);
    if (!donor || !donor.phone) {
      return res.status(400).json({ success: false, message: 'Valid donor phone missing' });
    }

    const log = await triggerAppreciationCall(donor, campaignId, req.user.id);
    
    if (!log) {
      return res.status(500).json({ success: false, message: 'Failed to initiate call' });
    }

    res.json({ success: true, callSid: log.callSid, data: log });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({ success: false, message: 'Server error dialing out' });
  }
};

// POST /api/calls/webhook
const webhook = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;

    const log = await CallLog.findOne({ callSid: CallSid });
    if (log) {
      log.status = CallStatus.toLowerCase(); // 'ringing', 'answered', 'completed', 'failed'
      if (CallDuration) log.duration = parseInt(CallDuration);
      await log.save();
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error');
  }
};

// GET /api/calls/logs
const getLogs = async (req, res) => {
  try {
    // Requires checkRole('ngo')
    const logs = await CallLog.find({ ngoId: req.user.id })
      .populate('donorId', 'name')
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// TwiML Generator Endpoint
const generateTwiML = (req, res) => {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  twiml.say({
    language: 'hi-IN',
    voice: 'Polly.Aditi'
  }, 'नमस्ते! Serve-x में आपका स्वागत है। आपके उदार दान के लिए हम आपका तहे दिल से शुक्रिया अदा करते हैं। आपका योगदान समाज में बदलाव लाने के लिए बहुत महत्वपूर्ण है। धन्यवाद!');
  res.type('text/xml');
  res.send(twiml.toString());
};


module.exports = {
  initiateCall,
  triggerAppreciationCall,
  webhook,
  getLogs,
  generateTwiML
};
