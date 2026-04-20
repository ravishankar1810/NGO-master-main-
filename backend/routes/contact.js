const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contacts
// Sends a notification email to the admin when someone submits the contact form
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL on port 465
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS, // Must be a 16-char Gmail App Password, NOT your regular password
      },
    });

    await transporter.sendMail({
      from: `"ServeX Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `📬 New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #004B8D; padding: 24px; color: white;">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
            <p style="margin: 4px 0 0; opacity: 0.8;">via ServeX NGO Platform</p>
          </div>
          <div style="padding: 24px; background: #f8fafc;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 100px;">Name</td>
                <td style="padding: 8px 0; color: #1e293b;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #004B8D;">${email}</a></td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-weight: bold; color: #475569; margin-bottom: 8px;">Message</p>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #1e293b; white-space: pre-wrap;">${message}</div>
          </div>
          <div style="padding: 16px 24px; background: #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
            ServeX NGO Platform · Reply to this email to respond to ${name}
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (err) {
    console.error('❌ Contact email error - Code:', err.code, '| ResponseCode:', err.responseCode, '| Message:', err.message);
    return res.status(500).json({
      error: err.responseCode === 535
        ? 'Gmail authentication failed. Make sure GMAIL_APP_PASS in .env is a 16-character App Password, not your regular Gmail password.'
        : 'Failed to send email. Please try again later.',
    });
  }
});

module.exports = router;
