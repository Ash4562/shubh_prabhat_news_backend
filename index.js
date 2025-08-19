const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const helmet = require('helmet');
require('dotenv').config();
// require('./middleware/cron/autoDeleteGallery')
const app = express();
app.use(helmet({
  contentSecurityPolicy: false // ✅ place it right here
}));
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  next();
});

app.use(express.json());
app.use(cors({
    origin: [
      "https://shubhprabhat.co.in",
      "https://shubhprabhat.co.in",
      "https://reporter.shubhprabhat.co.in",
      "https://www.shubhprabhat.co.in",
      "https://www.shubhprabhat.co.in",
      "https://www.reporter.shubhprabhat.co.in",
      "https://www.admin.shubhprabhat.co.in",
      "https://admin.shubhprabhat.co.in",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://shubhprabhat-admin-panel.onrender.com",
    
       "https://shubh-prabhat-zuep.vercel.app",
        "https://shubhprabhat-admin-panel-adhd.onrender.com",
        "https://user-new.onrender.com/",
        "https://user-new.onrender.com",
      "  https://shubprabhat-userside2.onrender.com",
      "https://shubh-prabhat-sgsj.vercel.app",
      "https://shubprabhat-userside2.onrender.com",
      "https://shubprabhat-userside3.onrender.com",
      "https://shubh-prabhat.vercel.app"

 
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
    credentials: true,
}));

const db = mongoose.connection.db;
app.use("/news/contactus", require("./routes/conatct/ContantusRoutes"));
app.use("/shop/pickup", require("./routes/conatct/PickupRoutes"));
// reporter
app.use("/reporter/auth", require("./routes/shop/shopAuthroutes"));
app.use('/shop/notes', require('./routes/shop/ShotNoteRoutes'));
// photo
// user
app.use('/user/auth', require('./routes/user/userAuthRoutes'));
app.use('/user/address', require('./routes/user/userAddressRoutes'));
app.use('/user/order', require('./routes/user/orderRoutes'));
// deliveryBoy
app.use('/delivery/auth', require('./routes/deliveryboyroutes/DeliveryBoyRoutes'));
// admin
app.use('/admin/categories', require('./routes/admin/serviceRoutes'));
app.use('/admin/subcategories', require('./routes/admin/ProductRoutes'));
app.use('/admin/auth', require('./routes/admin/authRoutes'));
app.use('/admin/offer', require('./routes/admin/OfferRoutes'));
app.use('/admin/pdf', require('./routes/shop/GalleryRoutes'));

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
// 