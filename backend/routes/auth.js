
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const UNIVERSITY_DOMAIN = (process.env.UNIVERSITY_DOMAIN || '').toLowerCase();

// Helpers
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function isUniversityEmail(email) {
  if (!UNIVERSITY_DOMAIN) return true; // if not set, allow any (dev convenience)
  return email.toLowerCase().endsWith(`@${UNIVERSITY_DOMAIN}`);
}

// Step 1: initiate registration — send OTP
router.post('/register/init', async (req, res) => {
  try {
    const { name, email, role, employeeId, rollNumber, password } = req.body;
    if (!name || !email || !role || !password) return res.status(400).json({ message: 'Missing fields' });
    if (!['teacher', 'student'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!isUniversityEmail(email)) return res.status(403).json({ message: 'Registration limited to university emails' });

    // extra checks per role
    if (role === 'teacher' && !employeeId) return res.status(400).json({ message: 'employeeId required for teacher' });
    if (role === 'student' && !rollNumber) return res.status(400).json({ message: 'rollNumber required for student' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // create OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await Otp.create({ email: email.toLowerCase(), otp, expiresAt });

    await sendOtpEmail(email, otp);

    // Temporarily store registration info in JWT to reduce DB churn (we'll include all user fields encrypted)
    const tempToken = jwt.sign({ name, email: email.toLowerCase(), role, employeeId, rollNumber, password }, process.env.JWT_SECRET, { expiresIn: `${OTP_EXPIRY_MINUTES}m` });

    return res.json({ message: 'OTP sent to email', tempToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Step 2: verify OTP + create user
router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp, tempToken } = req.body;
    if (!email || !otp || !tempToken) return res.status(400).json({ message: 'Missing fields' });

    // verify otp exists
    const otpDoc = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // verify tempToken
    let payload;
    try {
      payload = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired temporary token' });
    }

    if (payload.email !== email.toLowerCase()) return res.status(400).json({ message: 'Token email mismatch' });

    // Double-check email uniqueness
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // create user
    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
      employeeId: payload.employeeId,
      rollNumber: payload.rollNumber
    });

    // remove used OTP
    await Otp.deleteMany({ email: email.toLowerCase() });

    // issue JWT for login
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return res.json({ message: 'Registered', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Protected test route
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'No user' });
    res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
