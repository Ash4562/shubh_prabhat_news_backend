import { getMessaging, getToken } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
// const firebaseConfig = {
//     apiKey: "AIzaSyCiHcu9IKG4EAFESWOmqlmqq5h8U_PHUFo",
//     authDomain: "pushnotification-3ad7d.firebaseapp.com",
//     projectId: "pushnotification-3ad7d",
//     storageBucket: "pushnotification-3ad7d.firebasestorage.app",
//     messagingSenderId: "569903307329",
//     appId: "1:569903307329:web:60b5f7f498dbb4b93f44c0",
//     measurementId: "G-Q2CXJ5MSJ8"
//   };
const firebaseConfig = {
  apiKey: "AIzaSyA7lot9riqfblKbPiTFasti4wXKeKxnOG4",
  authDomain: "todos-17e70.firebaseapp.com",
  projectId: "todos-17e70",
  storageBucket: "todos-17e70.appspot.com",
  messagingSenderId: "536815419991",
  appId: "1:536815419991:web:993691bcbc017083601912"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

getToken(messaging, { vapidKey: 'BK2UG7utWq0k9QfbKzwnCCzPhoTj_MCnXdAJ4wzX6a2wtTKoXb2p742U6DTF4stFjZwhUzyTNjRqNPiyxwVuv8Y	' })
  .then((currentToken) => {
    if (currentToken) {
      // 👉 Send this token to backend in verifyOtp API
      console.log('FCM Token:', currentToken);
    }
  })
  .catch((err) => {
    console.error('FCM token error', err);
  });
