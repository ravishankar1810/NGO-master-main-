const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

/**
 * Sends an appreciation email to the donor
 * @param {string} to - Donor's email
 * @param {string} name - Donor's name
 * @param {number} amount - Donation amount
 * @param {string} campaignTitle - Title of the campaign
 */
const sendAppreciationEmail = async (to, name, amount, campaignTitle) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    console.log('[STUB] Email appreciation skipped: Gmail credentials missing');
    return;
  }

  const mailOptions = {
    from: `"Serve-x Team" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Thank You for Your Kind Donation ❤️ - Serve-x',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #004B8D;">Serve-x</h1>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We are deeply touched by your generous contribution of <strong>₹${amount}</strong> towards the campaign <strong>"${campaignTitle || 'Our Mission'}"</strong>.</p>
        <p>Your support helps us reach more people in need and create a lasting impact. At Serve-x, we believe that every small act of kindness ripples out to make a big difference.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 0.9em; color: #666;">"The best way to find yourself is to lose yourself in the service of others." — Mahatma Gandhi</p>
        </div>
        <p>Thank you once again for being a hero for our cause.</p>
        <p>Warm regards,<br/><strong>Team Serve-x</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8em; color: #999; text-align: center;">This is an automated appreciation email from Serve-x NGO Platform.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Appreciation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send appreciation email:', error);
  }
};

module.exports = { sendAppreciationEmail };
