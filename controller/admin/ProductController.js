const { default: mongoose } = require("mongoose");
const Product = require("../../models/admin/Product");



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
      status: 'pending' // default status
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

    if (!['pending', 'approved', 'rejected'].includes(status)) {
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


exports.createProduct = async (req, res) => {
  try {
    const { serviceId, subcategoryId, MainHeadline, Subheadline, Description } = req.body;

    if (!serviceId || !subcategoryId || !MainHeadline || !Subheadline || !Description || !req.file) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const productData = {
      MainHeadline: MainHeadline.trim(),
      Subheadline: Subheadline.trim(),
      Description: Description.trim(),
      image: req.file.path,   
       status: 'approved' // default status
    };

    // Check if main Product exists for this service
    let mainProduct = await Product.findOne({ service: serviceId });

    if (!mainProduct) {
      return res.status(404).json({ error: 'Main product not found for this service' });
    }

    // Find subcategory by subcategoryId (_id inside subcategories array)
    const subcategory = mainProduct.subcategories.id(subcategoryId);

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Push product data into the found subcategory
    subcategory.products.push(productData);

    await mainProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: mainProduct });
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to create product' });
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


// 📥 Get All Products by Service ID
exports.getProductsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const product = await Product.findOne({ service: serviceId });

    if (!product) {
      return res.status(404).json({ message: 'No products found for this service' });
    }

    res.status(200).json({ product });
  } catch (err) {
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
