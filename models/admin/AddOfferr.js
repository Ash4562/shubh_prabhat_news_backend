
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
  isSave: { type: Boolean, default: false },  
  like: { type: Boolean, default: false },
  view: { type: Boolean, default: false },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  LikeBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ViewBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
