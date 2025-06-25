const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'categories', // folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg','pdf'],
  },
});

const upload = multer({ storage });

module.exports = upload;
