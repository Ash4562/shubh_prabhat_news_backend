// // utils/sendOTP.js
// const nodemailer = require('nodemailer');

const { default: axios } = require("axios");

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const sendOTP = async (email, otp) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Your OTP - shubh prabhat',
//     text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
//   });
// };

// module.exports = sendOTP;
// const axios = require('axios');

// const sendOTP = async (contactNo, otp) => {
//   const baseURL = "http://bullet1.sdctechnologies.co.in:8080/api/mt/SendSMS";
//   const params = {
//     user: "dainikshubhprabhat@gmail.com",
//     password: "Shubh@123",
//     senderid: "SHUBSP",
//     channel: "Trans",
//     DCS: 0,
//     flashsms: 0,
//     number: `91${contactNo}`,
//     // text: `Dear Reader, ${otp} This is your mobile OTP for the login system of the news portal of the daily Shubh Prabhat newspaper. SHBHSP`,
//     text: `Your OTP for Shubh Prabhat News login is ${otp} and is valid for 10 mins. Please DO NOT share this OTP with anyone to keep your account safe. ${`https://vm.ltd/SHUBSP/vPvL5l`} SHUBSP`,
//   };

//   try {
//     const response = await axios.get(baseURL, { params });
//     return response.data;
//   } catch (error) {
//     console.error("SMS sending error:", error.message);
//     throw new Error("Failed to send OTP via SMS");
//   }
// };

// module.exports = sendOTP;

const sendOTP = async (contactNo, otp) => {
  const baseURL = "http://bullet1.sdctechnologies.co.in:8080/api/mt/SendSMS";
  const params = {
    user: "dainikshubhprabhat@gmail.com",
    password: "Shubh@123",
    senderid: "SHUBSP",
    channel: "Trans",
    DCS: 0,
    flashsms: 0,
    number: `91${contactNo}`,
    text: `Dear Reader, ${otp} This is your mobile OTP for the login system of the news portal of the daily Shubh Prabhat newspaper. SHBHSP`,
  };

  try {
    const response = await axios.get(baseURL, { params });
    return response.data;
  } catch (error) {
    console.error("SMS sending error:", error.message);
    throw new Error("Failed to send OTP via SMS");
  }
};
module.exports = sendOTP;