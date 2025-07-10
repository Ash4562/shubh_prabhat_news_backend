const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();
// require('./middleware/cron/autoDeleteGallery')
const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://shubhprabhat-admin-panel.onrender.com",
        "https://shubprabhat-userside.onrender.com/",
        "https://shubprabhat-userside.onrender.com",
       "https://shubh-prabhat-zuep.vercel.app",
        "https://shubhprabhat-admin-panel-adhd.onrender.com",
        "https://user-new.onrender.com/"
 
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
    credentials: true,
}));
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
