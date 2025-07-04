const admin = require('./firebaseAdmin');
const User = require('../models/user/userAuthController'); // Adjust path if needed

const sendNewsNotification = async (title, body) => {
  try {
    const users = await User.find({ fcmToken: { $ne: null } }).select('fcmToken');

    const tokens = users.map(user => user.fcmToken).filter(Boolean);

    if (tokens.length === 0) return;

    const message = {
        notification: {
          title,
          body
        }
      };
      
      // Loop through tokens
      for (const token of tokens) {
        await admin.messaging().sendToDevice(token, message);
      }
      console.log(`✅ Notifications sent to ${tokens.length} users`);
  } catch (err) {
    console.error('❌ Notification error:', err);
  }
};

module.exports = sendNewsNotification;





// const express = require("express");
// const admin = require("./firebaseAdmin");
// const app = express();
// app.use(express.json());

// // Mock: Replace with DB if needed
// const userTokens = [];

// app.post("/save-token", (req, res) => {
//   const { token } = req.body;
//   userTokens.push(token);
//   res.send("Token saved");
// });

// app.post("/admin/add-news", async (req, res) => {
//   const { title } = req.body;

//   for (const token of userTokens) {
//     await admin.messaging().send({
//       notification: {
//         title: "📰 New News Posted!",
//         body: title,
//       },
//       token,
//     });
//   }

//   res.send("News added and users notified");
// });

// app.listen(5000, () => console.log("Server running on port 5000"));