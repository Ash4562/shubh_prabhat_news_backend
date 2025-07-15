
const AddOffer = require('../../models/admin/AddOfferr');
const cloudinary = require('../../utils/cloudinary');


exports.getAlloffer = async (req, res) => {
  try {
    // Sab offers lao, bina populate kiye
    const offers = await AddOffer.find();

    res.status(200).json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 📤 Add Banner
exports.addofferbyAdmin = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const { MainHeadline, Subheadline, Description } = req.body;

    if (!MainHeadline || !Subheadline || !Description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const banner = new AddOffer({
      image: result.secure_url,
      MainHeadline: MainHeadline.trim(),
      Subheadline: Subheadline.trim(),
      Description: Description.trim(),
      status: "approved"
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: 'Blogs added and approved',
      data: banner
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: err.message
    });
  }
};



exports.addoffer = async (req, res) => {
  try {
    const { reporterId,MainHeadline, Subheadline, Description } = req.body;

    if (!reporterId ||!MainHeadline || !Subheadline || !Description) {
      return res.status(400).json({ success: false, message: 'reporterId is required' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const offer = new AddOffer({
      reporterId,
      image: result.secure_url,
      MainHeadline: MainHeadline.trim(),
      Subheadline: Subheadline.trim(),
      Description: Description.trim(),
      status: 'pending'
    });

    await offer.save();

    res.status(201).json({
      success: true,
      message: 'Offer added with pending status',
      data: offer
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: err.message
    });
  }
};


exports.approveOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await AddOffer.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.status(200).json({ success: true, message: 'Offer approved', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
exports.rejectedOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await AddOffer.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.status(200).json({ success: true, message: 'Offer rejected', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
exports.getPendingOffers = async (req, res) => {
  try {
    const pendingOffers = await AddOffer.find({ status: 'pending' }).populate('reporterId');
    
    res.status(200).json({ success: true, data: pendingOffers });
  } catch (err) {
    console.error('Error in getPendingOffers:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getApprovedOffers = async (req, res) => {
  try {
    const approvedOffers = await AddOffer.find({ status: 'approved' });
    res.status(200).json({ success: true, data: approvedOffers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// 📋 Get All Banners
exports.getoffer = async (req, res) => {
  try {
    const banners = await AddOffer.find().populate('reporterId'); // Populate shop data

    res.status(200).json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// 🖊️ Update Banner

// /
exports.updateoffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { MainHeadline, Subheadline, Description } = req.body;

    // Build update object
    const updateData = {};

    if (MainHeadline) updateData.MainHeadline = MainHeadline.trim();
    if (Subheadline) updateData.Subheadline = Subheadline.trim();
    if (Description) updateData.Description = Description.trim();

    // Handle image upload if file is present
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.image = result.secure_url;
    }

    // Perform update
    const updatedOffer = await AddOffer.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedOffer) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({ success: true, message: 'Banner updated', data: updatedOffer });
  } catch (err) {
    console.error('Update Offer Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// 🗑️ Delete Banner
exports.deleteoffer = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AddOffer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getRejectedOffersByShop = async (req, res) => {
  try {
    const { reporterId } = req.params;
    const pendingOffers = await AddOffer.find({ reporterId, status: 'rejected' });

    res.status(200).json({ success: true, data: pendingOffers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
exports.getPendingOffersByShop = async (req, res) => {
  try {
    const { reporterId } = req.params;

    const offers = await AddOffer.find({ reporterId, status: 'pending' });
    if (!offers || offers.length === 0) {
      return res.status(404).json({ success: false, message: "No pending offers found for this shop." });
    }

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    console.error("getPendingOffersByShop error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getApprovedOffersByShop = async (req, res) => {
  try {
    const { reporterId } = req.params;
    const approvedOffers = await AddOffer.find({ reporterId, status: 'approved' });

    res.status(200).json({ success: true, data: approvedOffers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
// 

function escapeHtml(text) {
  return text
    ?.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
exports.renderMetaPreviewBlogs = async (req, res) => {
  try {
    const { id } = req.params; // ✅ fixed

    const view = req.query.view || "reader";
    const blog = await AddOffer.findById(id); // ✅ fixed

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const headline = escapeHtml(blog.MainHeadline || "Read Latest News");
    const desc = escapeHtml(blog.Subheadline || "Check out this update.");
    const imageUrl = blog.image || "https://example.com/default-image.jpg";
    const redirectUrl = `${process.env.CLIENT_URL}/home/${view}/${id}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta property="og:title" content="${headline}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${redirectUrl}" />
  <meta property="og:type" content="website" />
  <title>Redirecting...</title>
  <script>
    window.location.href = "${redirectUrl}";
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
    <p><a href="${redirectUrl}">Click here to view the news</a></p>
  </noscript>
</head>
<body>
  <p>Redirecting to news...</p>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    console.error("OG Meta Preview Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
