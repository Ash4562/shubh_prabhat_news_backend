

const express = require('express');
const { registerReporter, updateReporterStatus, login, verifyOTP, getAllReporters, getReporterById, logoutReporter, getAllPendingReporters, deleteReporter, updateReporterProfile } = require('../../controller/shop/shopAuthcontroller');
const upload = require('../../middleware/multer');
const router = express.Router();

// const reporterController = require('../controllers/reporterController');

// Reporter Registration (no OTP yet)

router.post(
    '/register',
    upload.fields([
        { name: 'AadharCardImage', maxCount: 1 },
        { name: 'ReporterProfile', maxCount: 1 }
      ]),registerReporter
  );
router.put(
    '/updateProfile/:id',
    upload.fields([
        { name: 'AadharCardImage', maxCount: 1 },
        { name: 'ReporterProfile', maxCount: 1 }
      ]),updateReporterProfile
  );

// Admin approval (change isApproved to 'approved' or 'rejected')
router.patch('/approve/:id',updateReporterStatus);
router.delete('/delete/:id',deleteReporter);
// Login - send OTP (only for approved reporters)
router.post('/login',login);

// Verify OTP and generate token
router.post('/verify-otp',verifyOTP);

router.get('/all', getAllReporters);
router.get('/getAllPendingReporters', getAllPendingReporters);
router.get('/:id', getReporterById);
router.post('/logout', logoutReporter);
// /reporter/auth/:id

module.exports = router;
