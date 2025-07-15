const express = require('express');
// const upload = require('../../middlewares/multer');

const upload = require('../../middleware/multer');
const { addoffer, getoffer, updateoffer, deleteoffer, approveOffer, getPendingOffers, getApprovedOffers, getApprovedOffersByShop,  rejectedOffer, getRejectedOffersByShop, getPendingOffersByShop, addofferbyAdmin, getAlloffer, renderMetaPreviewBlogs } = require('../../controller/admin/OfferController');
const router = express.Router();

router.get('/all', getoffer);
router.get('/allOffer', getAlloffer);
router.post('/add', upload.single('image'), addoffer);
router.post('/addOfferByAdmin', upload.single('image'), addofferbyAdmin);
router.put('/approve/:id', approveOffer);
router.put('/rejected/:id', rejectedOffer);
router.get('/pending', getPendingOffers);
router.get('/approved', getApprovedOffers);
router.get('/approved/:reporterId', getApprovedOffersByShop);
router.get('/rejected/:reporterId', getRejectedOffersByShop);
router.get('/pending/:reporterId',getPendingOffersByShop) ;
router.put('/update/:id', upload.single('image'), updateoffer);
router.delete('/delete/:productId', deleteoffer);
router.get('/renderMetaPreviewBlogs/:id', renderMetaPreviewBlogs);

module.exports = router;
 
