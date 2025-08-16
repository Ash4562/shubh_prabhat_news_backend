const express = require('express');
const { register, verifyOtp, login, resendOtp, logout, updateUserDetails, getUserDetails, getAllUser, deleteUser } = require('../../controller/user/userAuthController');




const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/resend-otp', resendOtp);
router.post('/logout', logout);
router.put('/update/:userId', updateUserDetails);
router.get('/get/:userId', getUserDetails);
router.get('/getall', getAllUser);
router.delete('/user/:userId', deleteUser);
// Get user details by ID
// router.get('/:userId',getUserDetails);

module.exports = router;
