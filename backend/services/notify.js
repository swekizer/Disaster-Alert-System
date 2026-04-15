const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("[Notify] EMAIL_USER or EMAIL_PASS not set in .env. Will run in mock mode.");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });

  return transporter;
}

async function sendEmail(to, subject, text) {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.log('[Notify: MOCK EMAIL] ──────────────────────');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('────────────────────────────────────────────');
    return;
  }

  try {
    await mailTransporter.sendMail({
      from: `Alert System <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log(`[Notify] Successfully sent email to ${to}`);
  } catch (err) {
    console.error(`[Notify] Failed to send email to ${to}:`, err.message);
  }
}

module.exports = { sendEmail };
