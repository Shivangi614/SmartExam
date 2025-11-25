const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOtpEmail(to, otp) {
  const html = `
    <p>Hello,</p>
    <p>Your SmartExam verification code is: <strong>${otp}</strong></p>
    <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
    <p>If you didn't request this, ignore this email.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'SmartExam — Email Verification OTP',
    html
  });
}

module.exports = { sendOtpEmail };
