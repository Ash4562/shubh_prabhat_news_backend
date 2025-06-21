const express = require('express');
const router = express.Router();
// const upload = require('../middlewares/upload');

// const serviceController = require('../../controller/admin/serviceController');
// const upload = require('../../middleware/multer');
const { createService, getAllServices, getAllServicesofAllshop, updateService, deleteService, getShopsByServiceName } = require('../../controller/admin/serviceController');
const upload = require('../../middleware/multer');

router.post('/add', upload.single('image'), createService);
router.get('/getall/:shopId', getAllServices);
router.get('/getall',getAllServicesofAllshop);
router.put('/update/:id', upload.single('image'), updateService);
router.delete('/delete/:id', deleteService);
router.get('/shops-by-service/:serviceName', getShopsByServiceName);
module.exports = router;
 