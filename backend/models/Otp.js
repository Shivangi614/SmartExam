const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  purpose: { type: String, enum: ['registration'], default: 'registration' },
  createdAt: { type: Date, default: Date.now }
});
otpSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 }); // TTL index ensures deletion after expiry
module.exports = mongoose.model('Otp', otpSchema);
