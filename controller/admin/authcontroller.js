const jwt = require('jsonwebtoken');

const sendOTP = require('../../utils/sendOTP');
const adminAuth = require('../../models/admin/adminAuth');



const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Temporary store for registration data
const tempUsers = new Map(); // key: email, value: { userData + otp }

/**
 * Register - Step 1: Store data and send OTP
 */
exports.register = async (req, res) => {
  const { Name, contactNo, email } = req.body;

  if (!Name || !contactNo || !email ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    tempUsers.set(normalizedEmail, {
      Name: Name.trim(),
      contactNo: contactNo.trim(),
      email: normalizedEmail,
      otp,
      otpExpiry,
    });

    await sendOTP(contactNo.trim(), otp); // send OTP via SMS
    res.status(200).json({ message: 'OTP sent to mobile number' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

/**
 * Login - Step 1: Generate and send OTP
 */
exports.login = async (req, res) => {
  const { contactNo } = req.body;

  try {
    const user = await adminAuth.findOne({ contactNo });
    if (!user) return res.status(404).json({ error: 'Mobile number not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTP(contactNo, otp); // ✅ Send OTP to mobile
    res.status(200).json({ message: 'OTP sent to mobile number' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login OTP failed' });
  }
};

/**
 * OTP Verification (for both register and login)
 */
exports.verifyOtp = async (req, res) => {
  const { contactNo, otp: inputOtp, isLogin } = req.body;
  const otp = inputOtp.toString().trim();

  try {
    if (isLogin) {
      const user = await adminAuth.findOne({ contactNo });
      if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, { expiresIn: '1d' });
      return res.status(200).json({ message: 'Login successful', token, user });
    } else {
      // For registration flow
      const tempEntry = [...tempUsers.values()].find(u => u.contactNo === contactNo);
      if (!tempEntry || tempEntry.otp !== otp || Date.now() > tempEntry.otpExpiry) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      const alreadyExists = await adminAuth.findOne({ contactNo });
      if (alreadyExists) return res.status(400).json({ error: 'User already registered' });

      const newUser = await adminAuth.create({
        Name: tempEntry.Name,
        contactNo: tempEntry.contactNo,
        email: tempEntry.email,
        address: tempEntry.address,
      });

      tempUsers.delete(tempEntry.email); // delete using email key

      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_KEY, { expiresIn: '1d' });
      return res.status(200).json({ message: 'Registration successful', token, user: newUser });
    }
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

/**
 * Resend OTP
 */
exports.resendOtp = async (req, res) => {
  const { contactNo, isLogin } = req.body;

  try {
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    let mobileToSend;

    if (isLogin) {
      const user = await adminAuth.findOne({ contactNo });
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
      mobileToSend = contactNo;
    } else {
      const tempEntry = [...tempUsers.values()].find(u => u.contactNo === contactNo);
      if (!tempEntry) return res.status(404).json({ error: 'Please register first' });

      tempEntry.otp = otp;
      tempEntry.otpExpiry = otpExpiry;
      tempUsers.set(tempEntry.email, tempEntry); 
      mobileToSend = contactNo;
    }

    await sendOTP(mobileToSend, otp);
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

/**
 * Logout - (Token removal on frontend, but for server validation, you can store blacklisted tokens or use short expiry)
 */
exports.logout = async (req, res) => {
  // In JWT, logout is handled client-side. If you want to invalidate, use a token blacklist (Redis etc.)
  try {
    // Optional: track token blacklist if needed
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
