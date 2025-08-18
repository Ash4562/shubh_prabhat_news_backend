const { default: mongoose } = require("mongoose");
const Product = require("../../models/admin/Product");
const Reporter = require('../../models/shop/shopAuthModel');


// 📤 Create Product under a Subcategory
// exports.createProduct = async (req, res) => {
//   try {

//     const { serviceId, subcategoryName, MainHeadline, Subheadline, Description } = req.body;

//     if (!serviceId || !subcategoryName || !MainHeadline || !Subheadline || !Description || !req.file) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     const productData = {
//       MainHeadline: MainHeadline.trim(),
//       Subheadline: Subheadline.trim(),
//       Description: Description.trim(),
//       image: req.file.path
//     };

//     // Check if main Product exists for this service
//     let mainProduct = await Product.findOne({ service: serviceId });

//     if (!mainProduct) {
//       // Create a new main product structure
//       mainProduct = await Product.create({
//         service: serviceId,
//         subcategories: [{ name: subcategoryName, products: [productData] }]
//       });
//     } else {
//       // Check if subcategory exists
//       const subcategory = mainProduct.subcategories.find(
//         (sub) => sub.name.toLowerCase() === subcategoryName.toLowerCase()
//       );

//       if (subcategory) {
//         subcategory.products.push(productData);
//       } else {
//         mainProduct.subcategories.push({
//           name: subcategoryName,
//           products: [productData]
//         });
//       }

//       await mainProduct.save();
//     }

//     res.status(201).json({ message: 'Product added successfully', product: mainProduct });
//   } catch (err) {
//     console.error('Create Product Error:', err);
//     res.status(500).json({ error: 'Failed to create product' });
//   }
// };

// exports.createProductByReporter = async (req, res) => {
//   try {
//     const { serviceId, subcategoryId, MainHeadline, Subheadline, Description, reporterId } = req.body;

//     if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !reporterId || !req.file) {
//       return res.status(400).json({ error: 'All fields are required including reporterId and image' });
//     }

//     const productData = {
//       MainHeadline: MainHeadline.trim(),
//       Subheadline: Subheadline.trim(),
//       Description: Description.trim(),
//       image: req.file.path,
//       reporterId,
//       status: 'pending',// default status
//       date: new Date()
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

// const mongoose = require('mongoose');


exports.createProductByReporter = async (req, res) => {
  try {
    const { MainHeadline, Subheadline, Description, reporterId } = req.body;
    const serviceIds = JSON.parse(req.body.serviceIds || '[]');
    const subcategoryMap = JSON.parse(req.body.subcategoryMap || '{}');

    if (
      !serviceIds.length ||
      !Object.keys(subcategoryMap).length ||
      !MainHeadline ||
      !Subheadline ||
      !Description ||
      !reporterId ||
      !req.file
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertedProducts = [];

    for (const serviceId of serviceIds) {
      const subcategoryIds = subcategoryMap[serviceId];
      if (!Array.isArray(subcategoryIds)) {
        console.log(`⚠️ Invalid subcategory list for serviceId: ${serviceId}`);
        continue;
      }

      const mainProduct = await Product.findOne({ service: serviceId });
      if (!mainProduct) {
        console.log(`❌ No Product document found for serviceId: ${serviceId}`);
        continue;
      }

      for (const subcategoryId of subcategoryIds) {
        const subcategory = mainProduct.subcategories.id(subcategoryId);

        if (!subcategory) {
          console.log(`❌ Subcategory not found: ${subcategoryId}. Skipping.`);
          continue;
        }

        const productData = {
          _id: new mongoose.Types.ObjectId(), // ✅ Unique _id per product
          MainHeadline: MainHeadline.trim(),
          Subheadline: Subheadline.trim(),
          Description: Description.trim(),
          image: req.file.path,
          reporterId,
          status: 'pending',
          date: new Date()
        };

        subcategory.products.push(productData);
        insertedProducts.push({
          serviceId,
          subcategoryId,
          ...productData
        });

        console.log(`✅ Inserted product into subcategory ${subcategoryId} of service ${serviceId} with ID ${productData._id}`);
      }

      await mainProduct.save();
      console.log(`💾 Saved updates for service: ${serviceId}`);
    }

    res.status(201).json({
      message: 'Product added successfully to all valid subcategories',
      inserted: insertedProducts
    });

  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};



// exports.createProduct = async (req, res) => {
//   try {
//     console.log("=== RAW BODY ===", req.body);

//     const { MainHeadline, Subheadline, Description } = req.body;
//     const serviceIds = JSON.parse(req.body.serviceIds || '[]');
//     const subcategoryMap = JSON.parse(req.body.subcategoryMap || '{}');

//     if (
//       !serviceIds.length ||
//       !Object.keys(subcategoryMap).length ||
//       !MainHeadline ||
//       !Subheadline ||
//       !Description ||
//       !req.file
//     ) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const productData = {
//       _id: new mongoose.Types.ObjectId(),
//       MainHeadline: MainHeadline.trim(),
//       Subheadline: Subheadline.trim(),
//       Description: Description.trim(),
//       image: req.file.path,
//       status: 'approved',
//       date: new Date()
//     };

//     const insertedProducts = [];

//     for (const serviceId of serviceIds) {
//       const subcategoryIds = subcategoryMap[serviceId]; // expecting array of subcategory _ids
//       console.log(`🔎 ServiceID: ${serviceId}, Subcategory IDs:`, subcategoryIds);

//       if (!Array.isArray(subcategoryIds)) {
//         console.log(`⚠️ Invalid subcategory list for serviceId ${serviceId}`);
//         continue;
//       }

//       const mainProduct = await Product.findOne({ service: serviceId });
//       if (!mainProduct) {
//         console.log(`❌ No Product found for serviceId: ${serviceId}`);
//         continue;
//       }

//       for (const subcategoryId of subcategoryIds) {
//         const subcategory = mainProduct.subcategories.id(subcategoryId);

//         if (!subcategory) {
//           console.log(`❌ Subcategory not found: ${subcategoryId}. Skipping.`);
//           continue;
//         }

//         subcategory.products.push(productData);
//         insertedProducts.push({
//           serviceId,
//           subcategoryId,
//           ...productData
//         });
//         console.log(`✅ Product inserted into subcategory ${subcategoryId} of service ${serviceId}`);
//       }

//       await mainProduct.save();
//       console.log(`💾 Saved product for service: ${serviceId}`);
//     }

//     return res.status(201).json({
//       message: 'Product added to multiple services/subcategories successfully',
//       inserted: insertedProducts
//     });

//   } catch (err) {
//     console.error('Create Product Error:', err);
//     return res.status(500).json({ error: 'Failed to create product' });
//   }
// };



exports.createProduct = async (req, res) => {
  try {
    console.log("=== RAW BODY ===", req.body);

    const { MainHeadline, Subheadline, Description } = req.body;
    const serviceIds = JSON.parse(req.body.serviceIds || '[]');
    const subcategoryMap = JSON.parse(req.body.subcategoryMap || '{}');

    if (
      !serviceIds.length ||
      !Object.keys(subcategoryMap).length ||
      !MainHeadline ||
      !Subheadline ||
      !Description ||
      !req.file
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertedProducts = [];

    for (const serviceId of serviceIds) {
      const subcategoryIds = subcategoryMap[serviceId]; // expecting array of subcategory _ids
      console.log(`🔎 ServiceID: ${serviceId}, Subcategory IDs:`, subcategoryIds);

      if (!Array.isArray(subcategoryIds)) {
        console.log(`⚠️ Invalid subcategory list for serviceId ${serviceId}`);
        continue;
      }

      const mainProduct = await Product.findOne({ service: serviceId });
      if (!mainProduct) {
        console.log(`❌ No Product found for serviceId: ${serviceId}`);
        continue;
      }

      for (const subcategoryId of subcategoryIds) {
        const subcategory = mainProduct.subcategories.id(subcategoryId);

        if (!subcategory) {
          console.log(`❌ Subcategory not found: ${subcategoryId}. Skipping.`);
          continue;
        }

        const productData = {
          _id: new mongoose.Types.ObjectId(), // ✅ Unique ID generated each time
          MainHeadline: MainHeadline.trim(),
          Subheadline: Subheadline.trim(),
          Description: Description.trim(),
          image: req.file.path,
          status: 'approved',
          date: new Date()
        };

        subcategory.products.push(productData);
        insertedProducts.push({
          serviceId,
          subcategoryId,
          ...productData
        });

        console.log(`✅ Inserted product with ID ${productData._id} into subcategory ${subcategoryId}`);
      }

      await mainProduct.save();
      console.log(`💾 Saved product for service: ${serviceId}`);
    }

    return res.status(201).json({
      message: 'Product added to multiple services/subcategories successfully',
      inserted: insertedProducts
    });

  } catch (err) {
    console.error('Create Product Error:', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
};



exports.createProductToMainHeadlines = async (req, res) => {
  try {
    const { MainHeadline, Subheadline, Description } = req.body;
    const serviceIds = JSON.parse(req.body.serviceIds || '[]');
    const subcategoryMap = JSON.parse(req.body.subcategoryMap || '{}');

    if (
      !serviceIds.length ||
      !Object.keys(subcategoryMap).length ||
      !MainHeadline ||
      !Subheadline ||
      !Description ||
      !req.file
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertedProducts = [];

    for (const serviceId of serviceIds) {
      const subcategoryIds = subcategoryMap[serviceId];
      if (!Array.isArray(subcategoryIds)) {
        console.log(`⚠️ Invalid subcategory list for serviceId: ${serviceId}`);
        continue;
      }

      const mainProduct = await Product.findOne({ service: serviceId });
      if (!mainProduct) {
        console.log(`❌ No product doc for serviceId: ${serviceId}`);
        continue;
      }

      for (const subcategoryId of subcategoryIds) {
        const subcategory = mainProduct.subcategories.id(subcategoryId);

        if (!subcategory) {
          console.log(`❌ Subcategory not found: ${subcategoryId}. Skipping.`);
          continue;
        }

        const productData = {
          _id: new mongoose.Types.ObjectId(), // ✅ generate unique _id here
          MainHeadline: MainHeadline.trim(),
          Subheadline: Subheadline.trim(),
          Description: Description.trim(),
          image: req.file.path,
          status: 'MainHeadlines',
          date: new Date()
        };

        subcategory.products.push(productData);
        insertedProducts.push({
          serviceId,
          subcategoryId,
          ...productData
        });

        console.log(`✅ Inserted into subcategory ${subcategoryId} of service ${serviceId} with ID ${productData._id}`);
      }

      await mainProduct.save();
      console.log(`💾 Saved product for service: ${serviceId}`);
    }

    return res.status(201).json({
      message: 'MainHeadline product added successfully to valid subcategories',
      MainHeadline: insertedProducts
    });

  } catch (err) {
    console.error('Create Product Error:', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
};



exports.createProductToLatestNews = async (req, res) => {
  try {
    const { MainHeadline, Subheadline, Description } = req.body;
    const serviceIds = JSON.parse(req.body.serviceIds || '[]');
    const subcategoryMap = JSON.parse(req.body.subcategoryMap || '{}');

    if (
      !serviceIds.length ||
      !Object.keys(subcategoryMap).length ||
      !MainHeadline ||
      !Subheadline ||
      !Description ||
      !req.file
    ) {
      return res.status(400).json({ error: 'Missing required fields including image' });
    }

    const insertedProducts = [];

    for (const serviceId of serviceIds) {
      const subcategoryIds = subcategoryMap[serviceId];
      if (!Array.isArray(subcategoryIds)) {
        console.log(`⚠️ Invalid subcategory list for serviceId: ${serviceId}`);
        continue;
      }

      const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
      let mainProduct = await Product.findOne({ service: serviceObjectId });

      if (!mainProduct) {
        console.log(`❌ Product doc not found for serviceId: ${serviceId}`);
        continue;
      }

      for (const subcategoryId of subcategoryIds) {
        const subcategory = mainProduct.subcategories.id(subcategoryId);

        if (!subcategory) {
          console.log(`❌ Subcategory not found: ${subcategoryId}. Skipping.`);
          continue;
        }

        const productData = {
          _id: new mongoose.Types.ObjectId(), // ✅ Unique ID for each insert
          MainHeadline: MainHeadline.trim(),
          Subheadline: Subheadline.trim(),
          Description: Description.trim(),
          image: req.file.path,
          status: 'LatestNews',
          date: new Date()
        };

        subcategory.products.push(productData);
        insertedProducts.push({
          serviceId,
          subcategoryId,
          ...productData
        });

        console.log(`✅ Inserted product into subcategory ${subcategoryId} of service ${serviceId} with ID ${productData._id}`);
      }

      await mainProduct.save();
      console.log(`💾 Saved product for serviceId: ${serviceId}`);
    }

    return res.status(201).json({
      message: 'Product added to LatestNews in valid subcategories successfully',
      inserted: insertedProducts
    });

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

    if (!['pending', 'approved', 'rejected', 'MainHeadlines', 'LatestNews'].includes(status)) {
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


// exports.likeNews = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ error: 'userId is required' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ error: 'Invalid productId' });
//     }

//     const objectProductId = new mongoose.Types.ObjectId(productId);

//     // Find the main product that contains the given productId
//     const mainProduct = await Product.findOne({
//       'subcategories.products._id': objectProductId
//     });

//     if (!mainProduct) {
//       return res.status(404).json({ error: 'Product not found in any subcategory' });
//     }

//     let found = false;
//     for (const sub of mainProduct.subcategories) {
//       const prod = sub.products.id(productId);
//       if (prod) {
//         // Save logic
//         if (!prod.LikeBy.includes(userId)) {
//           prod.LikeBy.push(userId);
//         }
//         prod.like = true;

//         found = true;
//         break;
//       }
//     }

//     if (!found) {
//       return res.status(404).json({ error: 'Product ID not found inside subcategories' });
//     }

//     await mainProduct.save();

//     res.status(200).json({ message: 'Product Like  by user successfully' });
//   } catch (error) {
//     console.error('Save product error:', error);
//     res.status(500).json({ error: 'Failed to save product' });
//   }
// };

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
// exports.ViewNews = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ error: 'userId is required' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ error: 'Invalid productId' });
//     }

//     const objectProductId = new mongoose.Types.ObjectId(productId);

//     // Find the main product that contains the given productId
//     const mainProduct = await Product.findOne({
//       'subcategories.products._id': objectProductId
//     });

//     if (!mainProduct) {
//       return res.status(404).json({ error: 'Product not found in any subcategory' });
//     }

//     let found = false;
//     for (const sub of mainProduct.subcategories) {
//       const prod = sub.products.id(productId);
//       if (prod) {
//         // Save logic
//         if (!prod.ViewBy.includes(userId)) {
//           prod.ViewBy.push(userId);
//         }
//         prod.view = true;

//         found = true;
//         break;
//       }
//     }

//     if (!found) {
//       return res.status(404).json({ error: 'Product ID not found inside subcategories' });
//     }

//     await mainProduct.save();

//     res.status(200).json({ message: 'Product saved by user successfully' });
//   } catch (error) {
//     console.error('Save product error:', error);
//     res.status(500).json({ error: 'Failed to save product' });
//   }
// };

exports.ViewNews = async (req, res) => {
  try {
    const { productId } = req.body; // ✅ ab sirf body se productId lenge

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
        // ✅ har request pe productId add karenge (duplicates allowed)
        prod.ViewBy.push(productId);
        prod.view = true;

        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found inside subcategories' });
    }

    await mainProduct.save();

    res.status(200).json({ message: 'Product viewed successfully' });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({ error: 'Failed to save product view' });
  }
};
exports.likeNews = async (req, res) => {
  try {
    const { productId } = req.body; // ya params se bhi le sakte ho

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
        // ✅ har request pe productId array me add karenge (duplicates allowed)
        prod.LikeBy.push(productId);
        prod.like = true;

        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Product ID not found inside subcategories' });
    }

    await mainProduct.save();

    res.status(200).json({ message: 'Product ID added to LikeBy array successfully' });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({ error: 'Failed to add productId in LikeBy' });
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
    const { serviceId, subcategoryName } = req.body;

    if (!serviceId || !subcategoryName) {
      return res.status(400).json({ error: 'serviceId, subcategoryName, and date are required' });
    }

    let mainProduct = await Product.findOne({ service: serviceId });

    if (!mainProduct) {
      // Create with subcategory
      mainProduct = await Product.create({
        service: serviceId,
        subcategories: [{ name: subcategoryName, products: [] }]
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
        // date: date,
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

// exports.getAllNew = async (req, res) => {
//   try {
//     const products = await Product.find({}, 'subcategories');

//     if (!products || products.length === 0) {
//       return res.status(404).json({ message: 'No subcategories found' });
//     }

//     const allSubcategories = [];

//     for (const product of products) {
//       for (const subcat of product.subcategories || []) {
//         const approvedProducts = [];

//         for (const prod of subcat.products || []) {
//           if (
//             prod.status === 'approved' || prod.status === 'MainHeadlines' || prod.status === 'LatestNews'

//           ) {
//             const reporter = await Reporter.findById(prod.reporterId).select('ReporterName email contactNo ReporterProfile');

//             const prodObj = prod.toObject();
//             prodObj.reporter = reporter;

//             approvedProducts.push(prodObj);
//           }
//         }

//         if (approvedProducts.length > 0) {
//           allSubcategories.push({
//             _id: subcat._id,
//             name: subcat.name,
//             date: subcat.date,
//             products: approvedProducts
//           });
//         }
//       }
//     }

//     res.status(200).json({ subcategories: allSubcategories });
//   } catch (err) {
//     console.error('Error fetching all subcategories:', err);
//     res.status(500).json({ error: 'Failed to fetch all subcategories' });
//   }
// };
exports.getAllNew = async (req, res) => {
  try {
    // Get all reporters in one query first
    const reporters = await Reporter.find({}, 'ReporterName email contactNo ReporterProfile').lean();
    const reporterMap = new Map(reporters.map(r => [r._id.toString(), r]));

    // Get products with lean() and only subcategories field
    // Filter out products without subcategories at database level
    const products = await Product.find(
      { 'subcategories.0': { $exists: true } }, 
      'subcategories'
    ).lean();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No subcategories found' });
    }

    const allSubcategories = [];
    const approvedStatuses = new Set(['approved', 'MainHeadlines', 'LatestNews']);

    for (const product of products) {
      for (const subcat of product.subcategories || []) {
        const approvedProducts = [];

        for (const prod of subcat.products || []) {
          if (approvedStatuses.has(prod.status)) {
            const reporter = reporterMap.get(prod.reporterId?.toString()) || null;
            
            approvedProducts.push({
              ...prod,
              reporter: reporter
            });
          }
        }

        // Sort products inside the subcategory
        approvedProducts.sort((a, b) => new Date(a.date) - new Date(b.date));

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

    // ✅ Use fallback sort based on date or ObjectId timestamp
    const getSubcategoryDate = (subcat) => {
      return subcat.date
        ? new Date(subcat.date)
        : new Date(parseInt(subcat._id.toString().substring(0, 8), 16) * 1000);
    };

    allSubcategories.sort((a, b) => getSubcategoryDate(a) - getSubcategoryDate(b));

    res.status(200).json({ subcategories: allSubcategories });
  } catch (err) {
    console.error('Error fetching all subcategories:', err);
    res.status(500).json({ error: 'Failed to fetch all subcategories' });
  }
};

exports.skipCategories = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('service', 'name')
      .select('service subcategories');

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No subcategories found' });
    }

    // ✅ Filter only those with allowed service names
    const allowedServiceNames = ['महाराष्ट्र', 'शहरे', 'राजकारण', 'विडीओ न्यूज','क्रीडा'];
    const filteredProducts = products.filter(
      (p) => p.service && allowedServiceNames.includes(p.service.name)
    );

    const allSubcategories = [];

    for (const product of filteredProducts) {
      const serviceInfo = {
        _id: product.service._id,
        name: product.service.name,
      };

      for (const subcat of product.subcategories || []) {
        const approvedProducts = [];

        for (const prod of subcat.products || []) {
          if (
            prod.status === 'approved' ||
            prod.status === 'MainHeadlines' ||
            prod.status === 'LatestNews'
          ) {
            const reporter = await Reporter.findById(prod.reporterId).select(
              'ReporterName email contactNo ReporterProfile'
            );

            const prodObj = prod.toObject();
            prodObj.reporter = reporter;

            approvedProducts.push(prodObj);
          }
        }

        approvedProducts.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (approvedProducts.length > 0) {
          allSubcategories.push({
            _id: subcat._id,
            name: subcat.name,
            date: subcat.date,
            service: serviceInfo,
            products: approvedProducts,
          });
        }
      }
    }

    const getSubcategoryDate = (subcat) => {
      return subcat.date
        ? new Date(subcat.date)
        : new Date(parseInt(subcat._id.toString().substring(0, 8), 16) * 1000);
    };

    allSubcategories.sort((a, b) => getSubcategoryDate(a) - getSubcategoryDate(b));

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
      "subcategories.products._id": productId,
    });

    if (!productDoc) {
      return res.status(404).json({ error: "Product not found" });
    }

    let updatedProduct = null;
    let updatedFields = [];

    for (let subcategory of productDoc.subcategories) {
      const product = subcategory.products.id(productId);

      if (product) {
        if (MainHeadline) {
          product.MainHeadline = MainHeadline.trim();
          updatedFields.push("MainHeadline");
        }

        if (Subheadline) {
          product.Subheadline = Subheadline.trim();
          updatedFields.push("Subheadline");
        }

        if (Description) {
          product.Description = Description.trim();
          updatedFields.push("Description");
        }

        if (req.file?.path) {
          product.image = req.file.path;
          updatedFields.push("image");
        }

        if (subcategoryName) {
          const trimmedName = subcategoryName.trim();
          if (subcategory.name !== trimmedName) {
            subcategory.name = trimmedName;
            updatedFields.push("subcategoryName");
          }
        }

        updatedProduct = product;
        break;
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found in subcategories" });
    }

    await productDoc.save();

    res.status(200).json({
      message: "Product and subcategory updated successfully",
      updatedFields,
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ error: "Failed to update product" });
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
exports.updateSubcategory = async (req, res) => {
  try {
    const { subcategoriesId } = req.params;
    const updateData = req.body; // e.g. { name: "New name", description: "Updated description" }

    // Step 1: Find the product document that contains the subcategory
    const productDoc = await Product.findOne({
      "subcategories._id": subcategoriesId
    });

    if (!productDoc) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Step 2: Find and update the specific subcategory
    const subcategory = productDoc.subcategories.id(subcategoriesId);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found for update' });
    }

    // Step 3: Apply the updates (only fields present in req.body)
    Object.keys(updateData).forEach(key => {
      subcategory[key] = updateData[key];
    });

    // Step 4: Save the updated product document
    await productDoc.save();

    return res.status(200).json({ message: 'Subcategory updated successfully', subcategory });

  } catch (err) {
    console.error('Update Subcategory Error:', err);
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
};

// exports.renderMetaPreview = async (req, res) => {
//   try {
//     const { productId } = req.params;

//     const product = await Product.findOne(
//       { 'subcategories.products._id': productId },
//       { 'subcategories.products.$': 1 }
//     );

//     if (!product || !product.subcategories?.length) {
//       return res.status(404).send('Product not found');
//     }

//     const prod = product.subcategories[0].products[0];
//     console.log(prod)

//     const headline = escapeHtml(prod.MainHeadline || 'Read Latest News');
//     const desc = escapeHtml(prod.Subheadline || 'Check out this update.');
//     const imageUrl = prod.image; // Direct Cloudinary URL assumed
//     const redirectUrl = `${process.env.CLIENT_URL}/home/reader/${productId}`;

//     const html = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <meta property="og:title" content="${headline}" />
//   <meta property="og:description" content="${desc}" />
//   <meta property="og:image" content="${imageUrl}" />
//   <meta property="og:url" content="${redirectUrl}" />
//   <meta property="og:type" content="website" />
//   <title>Redirecting...</title>
//   <script>
//     window.location.href = "${redirectUrl}";
//   </script>
// </head>
// <body>
//   <p>Redirecting...</p>
// </body>
// </html>
//     `;

//     res.send(html);
//   } catch (error) {
//     console.error('OG Meta Preview Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };

// // 🔐 Optional: Escape unsafe characters from HTML
// function escapeHtml(text) {
//   return text
//     ?.replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// }



// exports.renderMetaPreview = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const view = req.query.view || 'reader';

//     // Find the product where productId exists in any subcategory
//     const productDoc = await Product.findOne({ 'subcategories.products._id': productId });

//     if (!productDoc) {
//       return res.status(404).send('Product not found');
//     }

//     // Search for the actual product inside the subcategories
//     let foundProduct = null;
//     for (const sub of productDoc.subcategories) {
//       const prod = sub.products.find((p) => p._id.toString() === productId);
//       if (prod) {
//         foundProduct = prod;
//         break;
//       }
//     }

//     if (!foundProduct) {
//       return res.status(404).send('Product not found in subcategories');
//     }

//     const headline = escapeHtml(foundProduct.MainHeadline || 'Read Latest News');
//     const desc = escapeHtml(foundProduct.Subheadline || 'Check out this update.');
//     const imageUrl = foundProduct.image || 'https://example.com/default-image.jpg';
//     const redirectUrl = `${process.env.CLIENT_URL}/home/${view}/${productId}`;

//     const html = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <meta property="og:title" content="${headline}" />
//   <meta property="og:description" content="${desc}" />
//   <meta property="og:image" content="${imageUrl}" />
//   <meta property="og:url" content="${redirectUrl}" />
//   <meta property="og:type" content="website" />
//   <title>Redirecting...</title>
//   <script>
//     window.location.href = "${redirectUrl}";
//   </script>
//   <noscript>
//     <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
//     <p><a href="${redirectUrl}">Click here to view the news</a></p>
//   </noscript>
// </head>
// <body>
//   <p>Redirecting to news...</p>
// </body>
// </html>
//     `;

//     res.send(html);
//   } catch (error) {
//     console.error('OG Meta Preview Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };

function escapeHtml(text) {
  return text
    ?.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
exports.renderMetaPreview = async (req, res) => {
  try {
    const { productId } = req.params;
    const view = req.query.view || 'reader';

    // Find the product where productId exists in any subcategory
    const productDoc = await Product.findOne({ 'subcategories.products._id': productId });

    if (!productDoc) {
      return res.status(404).send('Product not found');
    }

    // Search for the actual product inside the subcategories
    let foundProduct = null;
    for (const sub of productDoc.subcategories) {
      const prod = sub.products.find((p) => p._id.toString() === productId);
      if (prod) {
        foundProduct = prod;
        break;
      }
    }

    if (!foundProduct) {
      return res.status(404).send('Product not found in subcategories');
    }

    const headline = escapeHtml(foundProduct.MainHeadline || 'Read Latest News');
    const desc = escapeHtml(foundProduct.Subheadline || 'Check out this update.');
    const mediaUrl = foundProduct.image || 'https://example.com/default-image.jpg';
    const redirectUrl = `${process.env.CLIENT_URL}/home/${view}/${productId}`;
    const isVideo = foundProduct.image?.endsWith('.mp4');
    const videoThumbnail = foundProduct.videoThumbnail || 'https://example.com/default-video-thumbnail.jpg';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta property="og:title" content="${headline}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${redirectUrl}" />
  <meta property="og:type" content="${isVideo ? 'video.other' : 'article'}" />
  
  ${isVideo ? `
    <!-- Video Specific Tags -->
    <meta property="og:video" content="${mediaUrl}" />
    <meta property="og:video:type" content="video/mp4" />
    <meta property="og:video:width" content="1280" />
    <meta property="og:video:height" content="720" />
    <meta property="og:image" content="${videoThumbnail}" />
    <meta name="twitter:card" content="player" />
    <meta name="twitter:player:stream" content="${mediaUrl}" />
    <meta name="twitter:player:stream:content_type" content="video/mp4" />
  ` : `
    <!-- Image Specific Tags -->
    <meta property="og:image" content="${mediaUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
  `}
  
  <meta name="twitter:title" content="${headline}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${isVideo ? videoThumbnail : mediaUrl}" />
  
  <title>${headline}</title>
  <script>
    window.location.href = "${redirectUrl}";
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
    <p><a href="${redirectUrl}">Click here to view the news</a></p>
  </noscript>
</head>
<body>
  <p>Redirecting to news...</p>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    console.error('OG Meta Preview Error:', error);
    res.status(500).send('Internal Server Error');
  }
};