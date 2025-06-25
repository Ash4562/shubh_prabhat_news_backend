// const express = require('express');
// // const upload = require('../../middlewares/multer');

// const upload = require('../../middleware/multer');
// const { addoffer, getoffer, updateoffer, deleteoffer, getAllOffersAllshop } = require('../../controller/shop/GalleryController');
// // const { addoffer, getoffer, updateoffer, deleteoffer } = require('../../controller/shop/OfferController');
// const router = express.Router();


// router.post('/add', upload.single('image'), addoffer);

// router.get('/getall', getAllOffersAllshop);
// router.get('/getall/:shopId', getoffer);
// router.put('/update/:id', upload.single('image'), updateoffer);
// router.delete('/delete/:id', deleteoffer);
// module.exports = router;










const express = require('express');
const router = express.Router();
const upload = require('../../middleware/multer');
const { addPdf, getPdf, getAllOffersAllshop, updatePdf, deletePdf, getTodayPdf } = require('../../controller/shop/GalleryController');

router.post('/add', upload.single('image'), addPdf);
router.get('/get', getPdf); // ❌ no shopId param now
router.get('/getTodayPdf', getTodayPdf); // ❌ no shopId param now
router.get('/all', getAllOffersAllshop);
router.put('/update/:id', upload.single('image'), updatePdf);
router.delete('/delete/:id', deletePdf);

module.exports = router;
