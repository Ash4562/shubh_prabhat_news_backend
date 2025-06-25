
const Gallery = require('../../models/shop/Gallery');
const cloudinary = require('../../utils/cloudinary');

exports.addPdf = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const banner = new Gallery({
      image: result.secure_url,
    });

    await banner.save();
    res.status(201).json({ success: true, message: 'Pdf added', data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

// 📋 Get All Banners (no shopId)
exports.getPdf = async (req, res) => {
  try {
    const banners = await Gallery.find();
    res.status(200).json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 🖊️ Update Banner
exports.updatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cloudinary.uploader.upload(req.file.path);

    const updated = await Gallery.findByIdAndUpdate(
      id,
      { image: result.secure_url },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Pdf not found' });
    }

    res.status(200).json({ success: true, message: 'Pdf updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 🗑️ Delete Banner
exports.deletePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Gallery.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'pdf not found' });
    }

    res.status(200).json({ success: true, message: 'Pdf deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 📋 All Banners (same as getoffer)
exports.getAllOffersAllshop = async (req, res) => {
  try {
    const banners = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// 📅 Get only today's PDFs
exports.getTodayPdf = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Today at 00:00:00

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); // Today at 23:59:59

    const todaysPdfs = await Gallery.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: todaysPdfs });
  } catch (err) {
    console.error('Error fetching today\'s PDFs:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};























































// const Gallery = require('../../models/shop/Gallery');
// const cloudinary = require('../../utils/cloudinary');


// // 📤 Add Banner
// exports.addoffer = async (req, res) => {
//   try {
//     const { shopId } = req.body;
//     if (!shopId) {
//       return res.status(400).json({ success: false, message: 'Shop ID is required' });
//     }

//     const result = await cloudinary.uploader.upload(req.file.path);

//     const banner = new Gallery({
//       image: result.secure_url,
//       shopId: shopId,
//     });

//     await banner.save();
//     res.status(201).json({ success: true, message: 'Banner added', data: banner });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
//   }
// };


// // 📋 Get All Banners
// exports.getoffer = async (req, res) => {
//   try {
//     const { shopId } = req.params;
//     console.log();
//     if (!shopId) {
//       return res.status(400).json({ success: false, message: 'Shop ID is required' });
//     }

//     const banners = await Gallery.find({ shopId });
//     res.status(200).json({ success: true, data: banners });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // 🖊️ Update Banner
// exports.updateoffer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await cloudinary.uploader.upload(req.file.path);

//     const updated = await Gallery.findByIdAndUpdate(
//       id,
//       { image: result.secure_url },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ success: false, message: 'Banner not found' });
//     }

//     res.status(200).json({ success: true, message: 'Banner updated', data: updated });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// // 🗑️ Delete Banner
// exports.deleteoffer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Gallery.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ success: false, message: 'Banner not found' });
//     }

//     res.status(200).json({ success: true, message: 'Banner deleted' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// exports.getAllOffersAllshop = async (req, res) => {
//   try {
//     const banners = await Gallery.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: banners });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };