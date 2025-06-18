// const mongoose = require('mongoose');

// const ReporterSchema = new mongoose.Schema({
//   ReporterName: String,
//   email: { type: String, unique: true },
//   contactNo: String,
//   address: String,
//   otp: String,       // Should be String
//   otpExpiry: Date,  
// }, {
//   timestamps: true 
// });

// module.exports = mongoose.model(' Reporter',  ReporterSchema);
const mongoose = require('mongoose');

const ReporterSchema = new mongoose.Schema({
  ReporterName: String,
  email: { type: String, unique: true },
  contactNo: String,
  address: String,
  otp: String,
  otpExpiry: Date,
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isLogin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Reporter', ReporterSchema);