// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../utils/cloudinary');

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'categories', // folder name in Cloudinary
//     allowed_formats: ['jpg', 'png', 'jpeg','pdf'],
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;



const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// Configure storage with allowed formats
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    return {
      folder: 'categories',
      resource_type: isVideo ? 'video' : 'image', // dynamically choose between image/video
      format: isImage ? 'jpg' : undefined, // Optional: convert to jpg (for images)
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi'], // extend to video formats
    };
  },
});

// Limit file size to 5MB for images, 50MB for videos
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (you can reduce it if needed)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'video/mp4',
      'video/quicktime', // for .mov
      'video/x-msvideo', // for .avi
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
});

module.exports = upload;
