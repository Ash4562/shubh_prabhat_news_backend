// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   image: { type: String, required: true }, // Cloudinary/local image path
// }, { timestamps: true });

// module.exports = mongoose.model('Product', productSchema);
// const mongoose = require('mongoose');

// // Product Schema inside subcategory
// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   image: { type: String, required: true }
// }, { _id: false });

// // Subcategory Schema (e.g., T-Shirt)
// const subcategorySchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   products: [productSchema]
// }, { _id: false });

// // Main Product Schema
// const mainProductSchema = new mongoose.Schema({
//   service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
//   subcategories: [subcategorySchema]
// }, { timestamps: true });

// module.exports = mongoose.model('Product', mainProductSchema);


// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   service: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Service',
//     required: true,
//   },
//   subcategories: [
//     {
//       _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Not required, but fine if you want to be explicit
//       name: { type: String, required: true },
//       products: [
//         {
//           _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Again, not required — Mongoose does this automatically
//           MainHeadline: { type: String, required: true },
//           Subheadline: { type: String, required: true },
//           Description: { type: String, required: true },
//           image: { type: String, required: true },
//           reporterId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Reporter',
//             // required: true
//           },
//           status: {
//             type: String,
//             enum: ['pending', 'approved', 'rejected'],
//             default: 'pending'
//           }
//         },

//       ],
//     },
//   ],
// });

// module.exports = mongoose.model('Product', ProductSchema);



const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },

  subcategories: [
    {

      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      name: { type: String, required: true },
      date: { type: Date, default: Date.now },

      products: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          MainHeadline: { type: String, required: true },
          Subheadline: { type: String, required: true },
          Description: { type: String, required: true },
          image: { type: String },
          reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reporter',
            // required: true
          },
          status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'MainHeadlines', 'LatestNews', "save"],
            default: 'pending'
          },
           date: { type: Date, default: Date.now },
          isSave: { type: Boolean, default: false },  
          like: { type: Boolean, default: false },
          view: { type: Boolean, default: false },
          savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
          LikeBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
          ViewBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        },
      ],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
