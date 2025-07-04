const admin = require('firebase-admin'); // Firebase Admin SDK load

var serviceAccount = require("../serviceAccount.json"); // ✅ Correct path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount) // Service Account से Auth
});

module.exports = admin;


// var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
