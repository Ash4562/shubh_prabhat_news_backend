const { default: mongoose } = require("mongoose");
const Product = require("../../models/admin/Product");
const Reporter = require('../../models/shop/shopAuthModel');
const sendNewsNotification = require("../../utils/sendNewsNotification");

const { getMessaging } = require('firebase-admin/messaging'); 
const admin = require('../../utils/firebaseAdmin'); // adjust path if needed
const User = require( '../../models/user/userAuthController'); // for FCM tokens


exports.createProductByReporter = async (req, res) => {
  try {
    const { serviceId, subcategoryId, MainHeadline, Subheadline, Description, reporterId } = req.body;

    if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !reporterId || !req.file) {
      return res.status(400).json({ error: 'All fields are required including reporterId and image' });
    }

    const productData = {
      MainHeadline: MainHeadline.trim(),
      Subheadline: Subheadline.trim(),
      Description: Description.trim(),
      image: req.file.path,
      reporterId,
      status: 'pending',// default status
      date: new Date()
    };

    // Check if main product entry exists for this service
    let mainProduct = await Product.findOne({ service: serviceId });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Main product not found for this service' });
    }

    // Find subcategory inside that document
    const subcategory = mainProduct.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Add new product to subcategory
    subcategory.products.push(productData);
    await mainProduct.save();

    res.status(201).json({ message: 'Product added successfully and pending approval', product: mainProduct });
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};



// exports.createProduct = async (req, res) => {

//   try {
//     const { serviceId, subcategoryId, MainHeadline, Subheadline, Description } = req.body;

//     if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !req.file) {
//       return res.status(400).json({ error: 'All fields are required including reporterId and image' });
//     }

//     const productData = {
//       MainHeadline: MainHeadline.trim(),
//       Subheadline: Subheadline.trim(),
//       Description: Description.trim(),
//       image: req.file.path,

//       status: 'approved',
//       date: new Date()
//       // default status
//     };

//     // Check if main product entry exists for this service
//     let mainProduct = await Product.findOne({ service: serviceId });

//     if (!mainProduct) {
//       return res.status(404).json({ error: 'Main product not found for this service' });
//     }

//     // Find subcategory inside that document
//     const subcategory = mainProduct.subcategories.id(subcategoryId);
//     if (!subcategory) {
//       return res.status(404).json({ error: 'Subcategory not found' });
//     }

//     // Add new product to subcategory
//     subcategory.products.push(productData);
//     await mainProduct.save();

//     res.status(201).json({ message: 'Product added successfully and pending approval', product: mainProduct });
//   } catch (err) {
//     console.error('Create Product Error:', err);
//     res.status(500).json({ error: 'Failed to create product' });
//   }
// };



// exports.createProduct = async (req, res) => {
//   try {
//     const { serviceId, subcategoryId, MainHeadline, Subheadline, Description } = req.body;

//     if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !req.file) {
//       return res.status(400).json({ error: 'All fields are required including reporterId and image' });
//     }

//     const productData = {
//       MainHeadline: MainHeadline.trim(),
//       Subheadline: Subheadline.trim(),
//       Description: Description.trim(),
//       image: req.file.path,
//       status: 'approved',
//       date: new Date()
//     };

//     let mainProduct = await Product.findOne({ service: serviceId });
//     if (!mainProduct) return res.status(404).json({ error: 'Main product not found for this service' });

//     const subcategory = mainProduct.subcategories.id(subcategoryId);
//     if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });

//     subcategory.products.push(productData);
//     await mainProduct.save();

//     // ✅ Send Notification
//     await sendNewsNotification(MainHeadline, Subheadline);

//     res.status(201).json({ message: 'Product added and notification sent', product: mainProduct });
//   } catch (err) {
//     console.error('Create Product Error:', err);
//     res.status(500).json({ error: 'Failed to create product' });
//   }
// };



exports.createProduct = async (req, res) => {
  try {
    const { serviceId, subcategoryId, MainHeadline, Subheadline, Description } = req.body;

    if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !req.file) {
      return res.status(400).json({ error: 'All fields are required including image' });
    }

    const productData = {
      MainHeadline: MainHeadline.trim(),
      Subheadline: Subheadline.trim(),
      Description: Description.trim(),
      image: req.file.path,
      status: 'approved',
      date: new Date()
    };

    const mainProduct = await Product.findOne({ service: serviceId });
    if (!mainProduct) return res.status(404).json({ error: 'Main product not found for this service' });

    const subcategory = mainProduct.subcategories.id(subcategoryId);
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });

    subcategory.products.push(productData);
    await mainProduct.save();

    // ✅ Get all users with fcmToken
    const usersWithTokens = await User.find({ fcmToken: { $ne: null } }).select('fcmToken -_id');
    const tokens = usersWithTokens.map(u => u.fcmToken).filter(Boolean);

    if (tokens.length > 0) {
      const messaging = getMessaging();

      const messages = tokens.map(token => ({
        token,
        notification: {
          title: MainHeadline,
          body: Subheadline
        }
      }));

      const response = await messaging.sendEach(messages);

      console.log(`✅ Notifications sent: Success=${response.successCount}, Failure=${response.failureCount}`);
    }

    res.status(201).json({ message: 'Product added and notification sent', product: mainProduct });
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.createProductToMainHeadlines = async (req, res) => {
  try {
    const { serviceId, subcategoryId, MainHeadline, Subheadline, Description } = req.body;

    if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !req.file) {
      return res.status(400).json({ error: 'All fields are required including reporterId and image' });
    }

    const productData = {
      MainHeadline: MainHeadline.trim(),
      Subheadline: Subheadline.trim(),
      Description: Description.trim(),
      image: req.file.path,

      status: 'MainHeadlines',// default status,
      date: new Date()
    };

    // Check if main product entry exists for this service
    let mainProduct = await Product.findOne({ service: serviceId });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Main product not found for this service' });
    }

    // Find subcategory inside that document
    const subcategory = mainProduct.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Add new product to subcategory
    subcategory.products.push(productData);
    await mainProduct.save();

    res.status(201).json({ message: 'Product added successfully and pending approval', product: mainProduct });
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};


exports.createProductToLatestNews = async (req, res) => {
  try {
    const { serviceId, subcategoryId, MainHeadline, Subheadline, Description } = req.body;

    if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !req.file) {
      return res.status(400).json({ error: 'All fields are required including and image' });
    }

    const productData = {
      MainHeadline: MainHeadline.trim(),
      Subheadline: Subheadline.trim(),
      Description: Description.trim(),
      image: req.file.path,
      status: 'LatestNews',
      date: new Date()
    };

    // Safely cast to ObjectId
    const serviceObjectId = new mongoose.Types.ObjectId(serviceId);

    // Find main product for this service
    let mainProduct = await Product.findOne({ service: serviceObjectId });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Main product not found for this service' });
    }

    // Find subcategory inside that document
    const subcategory = mainProduct.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Add new product to subcategory
    subcategory.products.push(productData);
    await mainProduct.save();

    res.status(201).json({ message: 'Product added successfully and pending approval', product: mainProduct });
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.getAllMainHeadlinesProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const allMainHeadlines = [];

    products.forEach((product) => {
      product.subcategories.forEach((subcategory) => {
        const mainHeadlineProducts = (subcategory.products || []).filter(
          (p) => p.status === 'MainHeadlines'
        );

        if (mainHeadlineProducts.length > 0) {
          allMainHeadlines.push({
            subcategoryId: subcategory._id,
            subcategoryName: subcategory.name,
            serviceId: product.service,
            products: mainHeadlineProducts,
          });
        }
      });
    });

    if (allMainHeadlines.length === 0) {
      return res.status(404).json({ message: 'No MainHeadlines products found' });
    }

    res.status(200).json({ mainHeadlines: allMainHeadlines });
  } catch (err) {
    console.error('🔥 Error in getAllMainHeadlinesProducts:', err);
    res.status(500).json({ error: 'Failed to fetch MainHeadlines products' });
  }
};

exports.getAllLatestNewsProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const allLatestNews = [];

    for (const product of products) {
      for (const subcategory of product.subcategories || []) {
        const latestNewsProducts = [];

        for (const p of subcategory.products || []) {
          if (p.status === 'LatestNews') {
            // Populate reporterId manually
            const reporter = await Reporter.findById(p.reporterId).select('ReporterName email contactNo');

            const prodObj = p.toObject();
            prodObj.reporter = reporter; // attach populated reporter

            latestNewsProducts.push(prodObj);
          }
        }

        if (latestNewsProducts.length > 0) {
          allLatestNews.push({
            subcategoryId: subcategory._id,
            subcategoryName: subcategory.name,
            serviceId: product.service,
            products: latestNewsProducts,
          });
        }
      }
    }

    if (allLatestNews.length === 0) {
      return res.status(404).json({ message: 'No LatestNews products found' });
    }

    res.status(200).json({ latestNews: allLatestNews });
  } catch (err) {
    console.error('🔥 Error in getAllLatestNewsProducts:', err);
    res.status(500).json({ error: 'Failed to fetch LatestNews products' });
  }
};


exports.getProductsByReporterId = async (req, res) => {
  try {
    const { reporterId } = req.params;

    if (!reporterId) {
      return res.status(400).json({ error: 'Reporter ID is required' });
    }

    const products = await Product.aggregate([
      { $unwind: '$subcategories' },
      { $unwind: '$subcategories.products' },
      { $match: { 'subcategories.products.reporterId': new mongoose.Types.ObjectId(reporterId) } },
      {
        $project: {
          _id: 0,
          serviceId: '$service',
          subcategoryId: '$subcategories._id',
          subcategoryName: '$subcategories.name',
          product: '$subcategories.products'
        }
      }
    ]);

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    console.error('Get Products by Reporter ID Error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
};


exports.updateProductStatusByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected','MainHeadlines','LatestNews'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find the main product doc that contains this productId anywhere
    const mainProduct = await Product.findOne({
      'subcategories.products._id': productId
    });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Product not found in any subcategory' });
    }

    let found = false;
    for (const sub of mainProduct.subcategories) {
      const prod = sub.products.id(productId);
      if (prod) {
        prod.status = status;
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found' });
    }

    await mainProduct.save();

    res.status(200).json({ message: `Product status updated to ${status}` });
  } catch (error) {
    console.error('Update product status by productId error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
};



exports.updateProductStatusToSave = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    const objectProductId = new mongoose.Types.ObjectId(productId);

    // Find the main product that contains the given productId
    const mainProduct = await Product.findOne({
      'subcategories.products._id': objectProductId
    });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Product not found in any subcategory' });
    }

    let found = false;
    for (const sub of mainProduct.subcategories) {
      const prod = sub.products.id(productId);
      if (prod) {
        // Save logic
        if (!prod.savedBy.includes(userId)) {
          prod.savedBy.push(userId);
        }
        prod.isSave = true;

        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found inside subcategories' });
    }

    await mainProduct.save();

    res.status(200).json({ message: 'Product saved by user successfully' });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({ error: 'Failed to save product' });
  }
};

exports.updateProductStatusToUnsave = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    const objectProductId = new mongoose.Types.ObjectId(productId);

    // Find the main product that contains the given productId
    const mainProduct = await Product.findOne({
      'subcategories.products._id': objectProductId
    });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Product not found in any subcategory' });
    }




    let found = false;
    for (const sub of mainProduct.subcategories) {
      const prod = sub.products.id(productId);
      if (prod) {
        // ✅ Remove userId from LikeBy array safely
        prod.savedBy = prod.savedBy.filter(id => id.toString() !== userId);

        // ✅ If no likes left, set like to false
        if (prod.savedBy.length === 0) {
          prod.isSave = false;
        }

        found = true;
        break;
      }
    }

    // let found = false;
    // for (const sub of mainProduct.subcategories) {
    //   const prod = sub.products.id(productId);
    //   if (prod) {
    //     // Unsave logic
    //     prod.savedBy = prod.savedBy.filter(id => id !== userId);

    //     // If no more users saved it, set isSave to false
    //     if (prod.savedBy.length === 0) {
    //       prod.isSave = false;
    //     }

    //     found = true;
    //     break;
    //   }
    // }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found inside subcategories' });
    }

    await mainProduct.save();

    res.status(200).json({ message: 'Product unsaved by user successfully' });
  } catch (error) {
    console.error('Unsave product error:', error);
    res.status(500).json({ error: 'Failed to unsave product' });
  }
};

exports.likeNews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    const objectProductId = new mongoose.Types.ObjectId(productId);

    // Find the main product that contains the given productId
    const mainProduct = await Product.findOne({
      'subcategories.products._id': objectProductId
    });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Product not found in any subcategory' });
    }

    let found = false;
    for (const sub of mainProduct.subcategories) {
      const prod = sub.products.id(productId);
      if (prod) {
        // Save logic
        if (!prod.LikeBy.includes(userId)) {
          prod.LikeBy.push(userId);
        }
        prod.like = true;

        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found inside subcategories' });
    }

    await mainProduct.save();

    res.status(200).json({ message: 'Product Like  by user successfully' });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({ error: 'Failed to save product' });
  }
};

exports.unlikeNews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    const objectProductId = new mongoose.Types.ObjectId(productId);

    // Find the main product that contains the given productId
    const mainProduct = await Product.findOne({
      'subcategories.products._id': objectProductId
    });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Product not found in any subcategory' });
    }

    let found = false;
    for (const sub of mainProduct.subcategories) {
      const prod = sub.products.id(productId);
      if (prod) {
        // ✅ Remove userId from LikeBy array safely
        prod.LikeBy = prod.LikeBy.filter(id => id.toString() !== userId);

        // ✅ If no likes left, set like to false
        if (prod.LikeBy.length === 0) {
          prod.like = false;
        }

        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found inside subcategories' });
    }

    await mainProduct.save();

    res.status(200).json({ message: 'Product unliked by user successfully' });
  } catch (error) {
    console.error('Unsave product error:', error);
    res.status(500).json({ error: 'Failed to unlike product' });
  }
};
exports.ViewNews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    const objectProductId = new mongoose.Types.ObjectId(productId);

    // Find the main product that contains the given productId
    const mainProduct = await Product.findOne({
      'subcategories.products._id': objectProductId
    });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Product not found in any subcategory' });
    }

    let found = false;
    for (const sub of mainProduct.subcategories) {
      const prod = sub.products.id(productId);
      if (prod) {
        // Save logic
        if (!prod.ViewBy.includes(userId)) {
          prod.ViewBy.push(userId);
        }
        prod.view = true;

        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found inside subcategories' });
    }

    await mainProduct.save();

    res.status(200).json({ message: 'Product saved by user successfully' });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({ error: 'Failed to save product' });
  }
};


exports.getSavedProductsByUserId = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const allProducts = await Product.find();

    const savedProducts = [];

    allProducts.forEach(prod => {
      prod.subcategories.forEach(sub => {
        const matchingProducts = sub.products.filter(p =>
          p.savedBy && p.savedBy.includes(userId)
        );
        if (matchingProducts.length > 0) {
          savedProducts.push(...matchingProducts);
        }
      });
    });

    res.status(200).json({ savedProducts });
  } catch (error) {
    console.error('Get saved products error:', error);
    res.status(500).json({ error: 'Failed to fetch saved products' });
  }
};


exports.getProductsBySubcategoryId = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    console.log("📥 Requested subcategoryId:", subcategoryId);

    // Step 1: Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
      console.log("❌ Invalid subcategoryId format");
      return res.status(400).json({ error: 'Invalid subcategoryId format' });
    }

    // Step 2: Fetch all products with subcategories
    const products = await Product.find();
    console.log("📦 Total Products Found:", products.length);

    let foundSubcategory = null;

    // Step 3: Loop through each product's subcategories
    for (const product of products) {
      console.log("🔍 Checking product ID:", product._id.toString());

      for (const sub of product.subcategories) {
        console.log("   ➤ Subcategory ID:", sub._id.toString(), "Name:", sub.name);

        if (sub._id.toString() === subcategoryId) {
          console.log("✅ Match found for subcategoryId:", subcategoryId);

          // Filter approved products only
          const approvedProducts = (sub.products || []).filter(
            (p) => p.status === 'approved'
          );

          console.log("   🎯 Approved Products Count:", approvedProducts.length);

          foundSubcategory = {
            _id: sub._id,
            name: sub.name,
            date: sub.date,
            products: approvedProducts
          };
          break;
        }
      }

      if (foundSubcategory) break;
    }

    // Step 4: Check if subcategory was found
    if (!foundSubcategory) {
      console.log("❌ Subcategory not found in any product");
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Step 5: Return matched subcategory with approved products
    console.log("📤 Returning subcategory with approved products");
    res.status(200).json({ subcategory: foundSubcategory });

  } catch (err) {
    console.error('🔥 Server Error in getProductsBySubcategoryId:', err);
    res.status(500).json({ error: 'Server error while fetching subcategory' });
  }
};

exports.addSubcategory = async (req, res) => {
  try {
    const { serviceId, subcategoryName, date } = req.body;

    if (!serviceId || !subcategoryName || !date) {
      return res.status(400).json({ error: 'serviceId, subcategoryName, and date are required' });
    }

    let mainProduct = await Product.findOne({ service: serviceId });

    if (!mainProduct) {
      // Create with subcategory
      mainProduct = await Product.create({
        service: serviceId,
        subcategories: [{ name: subcategoryName, date, products: [] }]
      });
    } else {
      const subcategoryExists = mainProduct.subcategories.some(
        (sub) => sub.name.toLowerCase() === subcategoryName.toLowerCase()
      );

      if (subcategoryExists) {
        return res.status(400).json({ error: 'Subcategory already exists' });
      }

      // ✅ Fix: include date here too
      mainProduct.subcategories.push({
        name: subcategoryName,
        date: date,
        products: []
      });

      await mainProduct.save();
    }

    res.status(201).json({ message: 'Subcategory added successfully', data: mainProduct });
  } catch (err) {
    console.error('Add Subcategory Error:', err);
    res.status(500).json({ error: 'Failed to add subcategory' });
  }
};



exports.createOnlySubcategory = async (req, res) => {
  try {
    const { subcategoryId, name, price } = req.body;

    if (!subcategoryId || !name || !price || !req.file) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const productData = {
      _id: new mongoose.Types.ObjectId(), // Optional but makes retrieval easier
      name: name.trim(),
      price: parseFloat(price),
      image: req.file.path
    };

    // Find the document that contains the subcategory
    const productDoc = await Product.findOne({ 'subcategories._id': subcategoryId });

    if (!productDoc) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Find the subcategory by ID
    const subcategory = productDoc.subcategories.id(subcategoryId);

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found inside the product doc' });
    }

    // Optional: prevent duplicates
    const exists = subcategory.products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return res.status(409).json({ error: 'Product already exists in this subcategory' });
    }

    // Push the product and save
    subcategory.products.push(productData);
    await productDoc.save();

    res.status(201).json({
      message: 'Product added successfully',
      product: productData
    });

  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// 📥 Get All Subcategories (Across All Products)
exports.getAllSubcategories = async (req, res) => {
  try {
    const products = await Product.find({}, 'subcategories'); // fetch only subcategories

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No subcategories found' });
    }

    // Flatten subcategories from all products
    const allSubcategories = products.flatMap(product => product.subcategories || []);

    res.status(200).json({ subcategories: allSubcategories });
  } catch (err) {
    console.error('Error fetching all subcategories:', err);
    res.status(500).json({ error: 'Failed to fetch all subcategories' });
  }
};
// for users

exports.getAllNew = async (req, res) => {
  try {
    const products = await Product.find({}, 'subcategories');

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No subcategories found' });
    }

    const allSubcategories = [];

    for (const product of products) {
      for (const subcat of product.subcategories || []) {
        const approvedProducts = [];

        for (const prod of subcat.products || []) {
          if (prod.status === 'approved') {
            const reporter = await Reporter.findById(prod.reporterId).select('ReporterName email contactNo');

            const prodObj = prod.toObject();
            prodObj.reporter = reporter;

            approvedProducts.push(prodObj);
          }
        }

        if (approvedProducts.length > 0) {
          allSubcategories.push({
            _id: subcat._id,
            name: subcat.name,
            date: subcat.date,
            products: approvedProducts
          });
        }
      }
    }

    res.status(200).json({ subcategories: allSubcategories });
  } catch (err) {
    console.error('Error fetching all subcategories:', err);
    res.status(500).json({ error: 'Failed to fetch all subcategories' });
  }
};


exports.getAllPending = async (req, res) => {
  try {
    const products = await Product.find({}, 'subcategories');

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No subcategories found' });
    }

    const allSubcategories = [];

    for (const product of products) {
      for (const subcat of product.subcategories || []) {
        const pendingProducts = [];

        for (const prod of subcat.products || []) {
          if (prod.status === 'pending') {
            // Manually populate reporterId
            const reporter = await Reporter.findById(prod.reporterId).select('ReporterName email contactNo ReporterProfile');

            // Convert to plain object and attach populated reporter
            const prodObj = prod.toObject();
            prodObj.reporter = reporter; // attach as 'reporter' key

            pendingProducts.push(prodObj);
          }
        }

        if (pendingProducts.length > 0) {
          allSubcategories.push({
            _id: subcat._id,
            name: subcat.name,
            date: subcat.date,
            products: pendingProducts
          });
        }
      }
    }

    res.status(200).json({ subcategories: allSubcategories });
  } catch (err) {
    console.error('Error fetching all subcategories:', err);
    res.status(500).json({ error: 'Failed to fetch all subcategories' });
  }
};



// 📥 Get All Products by Service ID
// exports.getProductsByService = async (req, res) => {
//   try {
//     const { serviceId } = req.params;
//     const product = await Product.findOne({ service: serviceId });

//     if (!product) {
//       return res.status(404).json({ message: 'No products found for this service' });
//     }

//     res.status(200).json({ product });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// };

exports.getProductsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Find one product and populate service details
    const product = await Product.findOne({ service: serviceId }).populate({
      path: 'service',
      select: 'name', // Only fetch the name field from Service
    });

    if (!product) {
      return res.status(404).json({ message: 'No products found for this service' });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error("Error fetching products by service:", err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// 🖊️ Update a Specific Product inside Subcategory
exports.updateProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const { MainHeadline, Subheadline, Description, subcategoryName } = req.body;

    const productDoc = await Product.findOne({
      "subcategories.products._id": productId
    });

    if (!productDoc) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let updatedProduct = null;

    for (let subcategory of productDoc.subcategories) {
      const product = subcategory.products.id(productId);

      if (product) {
        if (MainHeadline) product.MainHeadline = MainHeadline.trim();
        if (Subheadline) product.Subheadline = Subheadline.trim();
        if (Description) product.Description = Description.trim();
        if (req.file && req.file.path) product.image = req.file.path;

        updatedProduct = product;

        if (subcategoryName && subcategory.name !== subcategoryName.trim()) {
          subcategory.name = subcategoryName.trim();
        }

        break;
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found in subcategories' });
    }

    await productDoc.save();

    res.status(200).json({
      message: 'Product and subcategory updated successfully',
      product: updatedProduct
    });

  } catch (err) {
    console.error('Update Product Error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};


exports.deleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Find the product doc that contains the product ID
    const productDoc = await Product.findOne({
      "subcategories.products._id": productId
    });

    if (!productDoc) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Step 2: Loop through subcategories and filter out the product
    let productFound = false;
    for (let subcategory of productDoc.subcategories) {
      const initialLength = subcategory.products.length;
      subcategory.products = subcategory.products.filter(
        (p) => p._id.toString() !== productId
      );
      if (subcategory.products.length < initialLength) {
        productFound = true;
      }
    }

    if (!productFound) {
      return res.status(404).json({ error: 'Product not found in subcategories' });
    }

    // Step 3: Save and return success
    await productDoc.save();
    return res.status(200).json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('Delete Product Error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};


exports.deleteSubcategories = async (req, res) => {
  try {
    const { subcategoriesId } = req.params;

    // Step 1: Find the document that contains the subcategory
    const productDoc = await Product.findOne({
      "subcategories._id": subcategoriesId
    });

    if (!productDoc) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Step 2: Filter out the subcategory
    const initialLength = productDoc.subcategories.length;
    productDoc.subcategories = productDoc.subcategories.filter(
      (subcategory) => subcategory._id.toString() !== subcategoriesId
    );

    if (productDoc.subcategories.length === initialLength) {
      return res.status(404).json({ error: 'Subcategory not found for deletion' });
    }

    // Step 3: Save updated document
    await productDoc.save();

    return res.status(200).json({ message: 'Subcategory deleted successfully' });

  } catch (err) {
    console.error('Delete Subcategory Error:', err);
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
};
