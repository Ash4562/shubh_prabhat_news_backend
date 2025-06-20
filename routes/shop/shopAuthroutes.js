// routes/authRoutes.js
// const express = require('express');
// const { registerReporter } = require('../../controller/shop/shopAuthcontroller');
// const router = express.Router();
// const authController = require('../../controller/shop/shopAuthcontroller');
// const upload = require('../../middleware/multer');

// router.post('/register', authController.register)

// router.post('/register',registerReporter)
// .post('/login', authController.login)
// .post('/verify-login-otp',authController.verifyOtp)
// .post('/resend-otp', authController.resendOtp)
// .get('/get/:shopId', authController.getShopDetails)
// .get('/getShopServicesGallerys/:shopId', authController.getShopWithServicesGallery)
// .get('/shops', authController.getAllShops)
// .put('/update/:shopId', upload.single('image'), authController.updateShopDetails)
// .delete('/delete/:shopId', authController.deleteShop);
// module.exports = router;



const express = require('express');
const { registerReporter, updateReporterStatus, login, verifyOTP, getAllReporters, getReporterById, logoutReporter } = require('../../controller/shop/shopAuthcontroller');
const router = express.Router();

// const reporterController = require('../controllers/reporterController');

// Reporter Registration (no OTP yet)
router.post('/register',registerReporter);

// Admin approval (change isApproved to 'approved' or 'rejected')
router.patch('/approve/:id',updateReporterStatus);

// Login - send OTP (only for approved reporters)
router.post('/login',login);

// Verify OTP and generate token
router.post('/verify-otp',verifyOTP);

router.get('/all', getAllReporters);
router.get('/:id', getReporterById);
router.post('/logout', logoutReporter);


module.exports = router;
