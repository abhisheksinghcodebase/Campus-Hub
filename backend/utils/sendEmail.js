const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter using env credentials.
 * Supports any SMTP-compatible service (Gmail, Outlook, etc.)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * sendEmail - Sends email via Nodemailer, or simulates if dummy credentials are set.
 * @param {string} to      - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html    - HTML body content
 */
const sendEmail = async ({ to, subject, html }) => {
  // Check if credentials are placeholders
  const isPlaceholder =
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === 'your_email@gmail.com' ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === 'your_app_password_here';

  if (isPlaceholder) {
    console.log('\n======================================================');
    console.log('📬 [EMAIL SIMULATED in Dev Mode]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('======================================================\n');
    return { messageId: 'simulated-dev-id' };
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"AuthSystem" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
