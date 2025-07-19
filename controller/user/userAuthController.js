const jwt = require('jsonwebtoken');
const User = require('../../models/user/userAuthController');
const sendOTP = require('../../utils/sendOTP');
const userAuthController = require('../../models/user/userAuthController');
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const tempUsers = new Map(); // key: email, value: { userData + otp }



exports.register = async (req, res) => {
  const { Name, contactNo, email, address } = req.body;

  if (!Name || !contactNo || !email || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    tempUsers.set(normalizedEmail, {
      Name: Name.trim(),
      address: address.trim(),
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


exports.login = async (req, res) => {
  const { contactNo } = req.body;

  try {
    const user = await User.findOne({ contactNo });
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


exports.verifyOtp = async (req, res) => {
  const { contactNo, otp: inputOtp, isLogin } = req.body;
  const otp = inputOtp.toString().trim();

  try {
    if (isLogin) {
      const user = await User.findOne({ contactNo });
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

      const alreadyExists = await User.findOne({ contactNo });
      if (alreadyExists) return res.status(400).json({ error: 'User already registered' });

      const newUser = await User.create({
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


exports.resendOtp = async (req, res) => {
  const { contactNo, isLogin } = req.body;

  try {
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    let mobileToSend;

    if (isLogin) {
      const user = await User.findOne({ contactNo });
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
      tempUsers.set(tempEntry.email, tempEntry); // ✅ still update by email key
      mobileToSend = contactNo;
    }

    await sendOTP(mobileToSend, otp);
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};



exports.logout = async (req, res) => {
  // In JWT, logout is handled client-side. If you want to invalidate, use a token blacklist (Redis etc.)
  try {
    // Optional: track token blacklist if needed
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};


exports.updateUserDetails = async (req, res) => {
  const { userId } = req.params;
  const { Name, contactNo, email } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If updating email, ensure it's not taken by another user
    if (email && email.trim().toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
      user.email = email.trim().toLowerCase();
    }

    if (Name) user.Name = Name.trim();
    if (contactNo) user.contactNo = contactNo.trim();

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
exports.getUserDetails = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Shop not found' });
      }
  
      res.status(200).json({ user });
    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  };

  exports.getAllUser= async (req, res) => {
    try {
      const user = await User.find()
       
      res.status(200).json(user);
    } catch (error) {
      console.error('Get orders failed:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
  