const Reporter = require('../../models/shop/shopAuthModel');
const jwt = require('jsonwebtoken');
const sendOTP = require('../../utils/sendOTP');

const cloudinary = require('../../utils/cloudinary'); 

exports.registerReporter = async (req, res) => {
  try {
    const { ReporterName, email, contactNo, address } = req.body;

    if (!ReporterName || !email || !contactNo || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!req.files || !req.files.AadharCardImage || !req.files.ReporterProfile) {
      return res.status(400).json({ error: 'Aadhar card and profile image are required' });
    }
    
    const aadharUpload = await cloudinary.uploader.upload(req.files.AadharCardImage[0].path);
    const profileUpload = await cloudinary.uploader.upload(req.files.ReporterProfile[0].path);
    

    // Create reporter
    const newReporter = new Reporter({
      ReporterName,
      email: email.toLowerCase().trim(),
      contactNo,
      address,
      AadharCardImage: aadharUpload.secure_url,
      ReporterProfile: profileUpload.secure_url,
    });

    await newReporter.save();

    res.status(201).json({
      message: 'Reporter registered successfully, pending approval.',
      reporter: newReporter
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to register reporter' });
  }
};


exports.updateReporterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedFor } = req.body;

    // Validate status
    if (status && !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Validate approvedFor
    if (approvedFor && !['Both', 'Blogs', 'News'].includes(approvedFor)) {
      return res.status(400).json({ error: 'Invalid ApprovedFor value' });
    }

    // Prepare update object dynamically
    const updateData = {};
    if (status) updateData.isApproved = status;
    if (approvedFor) updateData.ApprovedFor = approvedFor;

    const reporter = await Reporter.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!reporter) {
      return res.status(404).json({ error: 'Reporter not found' });
    }

    res.status(200).json({
      message: `Reporter updated successfully`,
      updatedFields: Object.keys(updateData),
      reporter,
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update reporter' });
  }
};


exports.login = async (req, res) => {
  const { contactNo } = req.body;
  try {

    const reporter = await Reporter.findOne({ contactNo });
    if (!reporter) return res.status(404).json({ error: 'Mobile number not found' });

    if (!reporter) return res.status(404).json({ message: 'Reporter not found' });

    if (reporter.isApproved !== 'approved') {
      return res.status(403).json({ message: 'Reporter is not approved' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    reporter.otp = otp.toString();
    reporter.otpExpiry = new Date(otpExpiry);
    await reporter.save();

    await sendOTP(contactNo, otp);

    res.status(200).json({ message: 'OTP sent', reporterId: reporter._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { reporterId, otp } = req.body;

    if (!reporterId || !otp) {
      return res.status(400).json({ message: 'Reporter ID and OTP are required' });
    }

    const reporter = await Reporter.findById(reporterId).select('-password -__v');

    if (!reporter || reporter.otp !== otp || new Date() > reporter.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and set login flag
    reporter.otp = null;
    reporter.otpExpiry = null;
    reporter.isLogin = true;
    await reporter.save();

    // Generate token
    const token = jwt.sign({ id: reporterId }, process.env.JWT_KEY, { expiresIn: '7d' });

    // Set cookie if needed
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send user data along with token
    return res.status(200).json({
      message: 'Login successful',
      token,
      reporter: {
        _id: reporter._id,
        name: reporter.ReporterName,
        phone: reporter.contactNo,
        email: reporter.email,
        address: reporter.address,
        isLogin: reporter.isLogin,
        isApproved: reporter.isApproved,
        ApprovedFor: reporter.ApprovedFor,
        ReporterProfile: reporter.ReporterProfile,
        AadharCardImage: reporter.AadharCardImage,
        createdAt: reporter.createdAt,
        updatedAt: reporter.updatedAt
        // add more fields as needed
      }
    });
  } catch (error) {
    console.error('OTP verification failed:', error);
    res.status(500).json({ message: 'OTP verification error' });
  }
};



exports.getAllReporters = async (req, res) => {
  try {
    const reporters = await Reporter.find();
    res.status(200).json({ success: true, reporters });
  } catch (error) {
    console.error('Fetch reporters error:', error);
    res.status(500).json({ error: 'Failed to fetch reporters' });
  }
};

exports.getAllPendingReporters = async (req, res) => {
  try {
    const reporters = await Reporter.find({ isApprovedg: 'pending' });
    res.status(200).json({ success: true, reporters });
  } catch (error) {
    console.error('Fetch reporters error:', error);
    res.status(500).json({ error: 'Failed to fetch reporters' });
  }
};



// 🔍 Get Reporter by ID
exports.getReporterById = async (req, res) => {
  try {
    const { id } = req.params;
    const reporter = await Reporter.findById(id);

    if (!reporter) {
      return res.status(404).json({ error: 'Reporter not found' });
    }

    res.status(200).json({ success: true, reporter });
  } catch (error) {
    console.error('Fetch reporter by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch reporter' });
  }
};

// 🚪 Logout Reporter
exports.logoutReporter = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const reporter = await Reporter.findById(decoded.id);

    if (!reporter) {
      return res.status(404).json({ message: 'Reporter not found' });
    }

    reporter.isLogin = false;
    await reporter.save();

    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};






exports.deleteReporter = async (req, res) => {
  const { id } = req.params;

  try {
    const ReprterShop = await Reporter.findByIdAndDelete(id);

    if (!ReprterShop) {
      return res.status(404).json({ error: 'Reprter not found' });
    }

    res.status(200).json({ message: 'Reprter deleted successfully' });
  } catch (err) {
    console.error('Delete shop error:', err);
    res.status(500).json({ error: 'Failed to delete shop' });
  }
};

exports.updateReporterProfile = async (req, res) => {
  try {
    const reporterId = req.params.id; // ID in URL
    const { ReporterName, email, contactNo, address } = req.body;

    const reporter = await Reporter.findById(reporterId);
    if (!reporter) {
      return res.status(404).json({ error: 'Reporter not found' });
    }

    // Upload new AadharCardImage if provided
    if (req.files?.AadharCardImage?.[0]) {
      const aadharUpload = await cloudinary.uploader.upload(req.files.AadharCardImage[0].path);
      reporter.AadharCardImage = aadharUpload.secure_url;
    }

    // Upload new ReporterProfile if provided
    if (req.files?.ReporterProfile?.[0]) {
      const profileUpload = await cloudinary.uploader.upload(req.files.ReporterProfile[0].path);
      reporter.ReporterProfile = profileUpload.secure_url;
    }

    // Update other fields if provided
    if (ReporterName) reporter.ReporterName = ReporterName;
    if (email) reporter.email = email.toLowerCase().trim();
    if (contactNo) reporter.contactNo = contactNo;
    if (address) reporter.address = address;

    await reporter.save();

    res.status(200).json({
      message: 'Reporter profile updated successfully',
      reporter,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update reporter profile' });
  }
};


































































































































// const jwt = require('jsonwebtoken');
// const sendOTP = require('../../utils/sendOTP');
// const shopAuthModel = require('../../models/shop/shopAuthModel');
// const Service = require('../../models/admin/Service');
// const Gallery = require('../../models/shop/Gallery');

// const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();



// // global temp store (or use Redis/DB if production)
// const tempRegistrations = new Map(); // key: email, value: { data + otp }


// exports.register = async (req, res) => {
//   const { ReporterName, contactNo, email,  address } = req.body;

//   // Multer stores the image in req.file
//   if (!ReporterName || !contactNo || !email || !address ) {
//     return res.status(400).json({ error: 'All fields are required ' });
//   }

//   try {
//     const normalizedEmail = email.toLowerCase().trim();

//     // Get image URL from Cloudinary


//     const otp = generateOTP();
//     const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

//     // Save data temporarily (for OTP verification)
//     tempRegistrations.set(normalizedEmail, {
//       ReporterName: ReporterName.trim(),
//       contactNo: contactNo.trim(),
//       email: normalizedEmail,
//       address: address.trim(),
//       otp,
//       otpExpiry,
//     });

//     await sendOTP(normalizedEmail, otp);

//     res.status(200).json({ message: 'OTP sent to email' });
//   } catch (err) {
//     console.error('OTP Send Error:', err);
//     res.status(500).json({ error: 'Failed to register and send OTP' });
//   }
// };


// exports.login = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const shop = await shopAuthModel.findOne({ email });
//     if (!shop) return res.status(404).json({ error: 'Email not found' });

//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
//     shop.otp = otp;
//     shop.otpExpiry = otpExpiry;
//     await shop.save();
// console.log("otp",otp);
//     await sendOTP(email, otp);
//     res.status(200).json({ message: 'OTP sent to email' });
//   } catch (err) {
//     res.status(500).json({ error: 'Login OTP send failed' });
//   }
// };


// exports.verifyOtp = async (req, res) => {
//   const { email, otp: inputOtp, isLogin } = req.body;

//   if (!email || !inputOtp) {
//     return res.status(400).json({ error: 'Email and OTP are required' });
//   }

//   const normalizedEmail = email.toLowerCase().trim();
//   const otp = inputOtp.toString().trim();

//   try {
//     if (isLogin) {
//       // 🔐 LOGIN FLOW
//       const shop = await shopAuthModel.findOne({ email: normalizedEmail });
//       if (!shop || shop.otp !== otp || new Date() > shop.otpExpiry) {
//         return res.status(400).json({ error: 'Invalid or expired OTP' });
//       }

//       const token = jwt.sign({ shopId: shop._id }, process.env.JWT_KEY, { expiresIn: '1d' });

//       // Clear OTP from DB
//       shop.otp = null;
//       shop.otpExpiry = null;
      
//       await shop.save();

//       return res.status(200).json({ message: 'Login successful', token, shop });
//     } else {
//       // 📝 REGISTRATION FLOW
//       const tempData = tempRegistrations.get(normalizedEmail);

//       if (!tempData || tempData.otp !== otp || Date.now() > tempData.otpExpiry) {
//         return res.status(400).json({ error: 'Invalid or expired OTP' });
//       }

//       const alreadyExists = await shopAuthModel.findOne({ email: normalizedEmail });
//       if (alreadyExists) {
//         return res.status(400).json({ error: 'Email already registered' });
//       }

//       const newShop = await shopAuthModel.create({
//         ReporterName: tempData.ReporterName,
//         contactNo: tempData.contactNo,
//         email: normalizedEmail,
//         address: tempData.address,
    
//       });

//       // Clean up temp storage
//       tempRegistrations.delete(normalizedEmail);

//       const token = jwt.sign({ shopId: newShop._id }, process.env.JWT_KEY, { expiresIn: '1d' });

//       return res.status(200).json({ message: 'Registration successful', token, shop: newShop });
//     }
//   } catch (err) {
//     console.error('OTP verification error:', err);
//     res.status(500).json({ error: 'OTP verification failed' });
//   }
// };


// exports.resendOtp = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const shop = await shopAuthModel.findOne({ email }); // Corrected model name
//     if (!shop) return res.status(404).json({ error: 'Email not found' });

//     const otp = generateOTP();
//     shop.otp = otp;
//     shop.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
//     await shop.save();

//     await sendOTP(email, otp);
//     res.status(200).json({ message: 'OTP resent successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Resend OTP failed' });
//   }
// };

// exports.getShopDetails = async (req, res) => {
//   const { shopId } = req.params;

//   try {
//     const shop = await shopAuthModel.findById(shopId);
//     if (!shop) {
//       return res.status(404).json({ error: 'Shop not found' });
//     }

//     res.status(200).json({ shop });
//   } catch (err) {
//     console.error('Get shop error:', err);
//     res.status(500).json({ error: 'Failed to fetch shop details' });
//   }
// };

// exports.getShopWithServicesGallery = async (req, res) => {
//   const { shopId } = req.params;

//   try {
//     const shop = await shopAuthModel.findById(shopId);
//     if (!shop) {
//       return res.status(404).json({ error: 'Shop not found' });
//     }

//     // Fetch services for this shop
//     const services = await Service.find({ shopId });

//     // Fetch gallery for this shop
//     const gallery = await Gallery.find({ shopId });

//     res.status(200).json({
//       shop,
//       services,
//       gallery
//     });
//   } catch (err) {
//     console.error('Get shop error:', err);
//     res.status(500).json({ error: 'Failed to fetch shop details' });
//   }
// };


// exports.updateShopDetails = async (req, res) => {
//   const { shopId } = req.params;
//   const {
//     ownerName,
//     contactNo,
//     shopName,
//     address,
//     description,
//   } = req.body;

//   try {
//     const shop = await shopAuthModel.findById(shopId);
//     if (!shop) {
//       return res.status(404).json({ error: 'Shop not found' });
//     }

//     // Update fields if provided
//     if (ownerName) shop.ownerName = ownerName.trim();
//     if (contactNo) shop.contactNo = contactNo.trim();
//     if (shopName) shop.shopName = shopName.trim();
//     if (address) shop.address = address.trim();
//     if (description) shop.description = description.trim();

//     // If a new image is uploaded
//     if (req.file && req.file.path) {
//       shop.image = req.file.path; // Cloudinary or local path via multer
//     }

//     await shop.save();

//     res.status(200).json({ message: 'Shop updated successfully', shop });
//   } catch (err) {
//     console.error('Update shop error:', err);
//     res.status(500).json({ error: 'Failed to update shop' });
//   }
// };

// exports.getAllShops = async (req, res) => {
//   try {
//     const shops = await shopAuthModel.find().sort({ createdAt: -1 }); // newest first
//     res.status(200).json({ shops });
//   } catch (err) {
//     console.error('Get all shops error:', err);
//     res.status(500).json({ error: 'Failed to fetch shops' });
//   }
// };



// exports.deleteShop = async (req, res) => {
//   const { shopId } = req.params;

//   try {
//     const deletedShop = await shopAuthModel.findByIdAndDelete(shopId);

//     if (!deletedShop) {
//       return res.status(404).json({ error: 'Shop not found' });
//     }

//     res.status(200).json({ message: 'Shop deleted successfully' });
//   } catch (err) {
//     console.error('Delete shop error:', err);
//     res.status(500).json({ error: 'Failed to delete shop' });
//   }
// };
