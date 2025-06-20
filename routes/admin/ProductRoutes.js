const express = require('express');
const router = express.Router();

// const upload = require('../../middleware/multer');
const { createProduct, getProductsByService, deleteProductById, updateProductById, createOnlySubcategory, deleteSubcategories, addSubcategory, getAllSubcategories, createProductByReporter, updateProductStatusByProductId, getProductsByReporterId, getAllNew, getAllPending, getProductsBySubcategoryId,  } = require('../../controller/admin/ProductController');

const upload = require('../../middleware/multer');
// repoerter
router.post('/createProductByReporter', upload.single('image'), createProductByReporter);
router.put('/status/:productId',updateProductStatusByProductId);

router.get('/getByreporter/:reporterId', getProductsByReporterId);
router.get('/getSubcategoryById/:subcategoryId', getProductsBySubcategoryId);

// 🟢 Create Product
router.post('/addproduct', upload.single('image'), createProduct);
router.post('/addSubcategory', addSubcategory);
router.post('/createOnlySubcategory', upload.single('image'), createOnlySubcategory);
router.get('/getall', getAllSubcategories);
router.get('/getallappovedNews', getAllNew);
router.get('/getallPendingNews', getAllPending);

// subcategories/getSubcategoryById/:subcategoryId
// 🔵 Get Products by Service ID
router.get('/service/:serviceId', getProductsByService);

// 🟡 Update Product



// 🔴 Delete Product
router.delete('/:productId', deleteProductById);

router.put('/:productId', upload.single('image'), updateProductById);
router.delete('/subcategories/:subcategoriesId', deleteSubcategories);

module.exports = router;
