// const mongoose = require('mongoose');

// const offerSchema = new mongoose.Schema({
//   image: {
//     type: String,
//     required: true,
//   },
// }, { timestamps: true });

// module.exports = mongoose.model('Offer', offerSchema);
// models/shop/AddOfferr.js
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reporter',
    // required: true
  },
  image: {
    type: String,
    required: true,
  },
  MainHeadline: { type: String, required: true },
  Subheadline: { type: String, required: true },
  Description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved',"rejected"],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
