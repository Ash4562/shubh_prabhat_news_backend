const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Name: String,
  contactNo: String,
  email: { type: String, unique: true },
  address: String,
  fcmToken: { type: String, default: null },
  otp: String,     
  otpExpiry: Date,  
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);