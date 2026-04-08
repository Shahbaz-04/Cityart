const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    default: '9999999999', // Default mobile for demo
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    default: 'admin',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP method
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  return otp;
};

// Verify OTP method
userSchema.methods.verifyOTP = function(candidateOTP) {
  if (!this.otp || !this.otpExpires) return false;
  if (Date.now() > this.otpExpires) return false;
  return this.otp === candidateOTP;
};

// Send SMS simulation (in production, use real SMS service)
userSchema.methods.sendOTP = function(otp) {
  console.log(`📱 SMS to ${this.mobile}: Your OTP is ${otp}. Valid for 5 minutes.`);
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
};

module.exports = mongoose.model('User', userSchema);