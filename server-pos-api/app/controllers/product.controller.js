const productService = require('../services/product.service');

async function createProduct(req, res) {
  try {
    // Parse FormData fields (they come as strings)
    const productData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock, 10),
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId, 10) : null,
      brandId: req.body.brandId ? parseInt(req.body.brandId, 10) : null,
      imageUrl: req.file ? req.file.path : null, // Cloudinary URL
    };
    
    const product = await productService.createProduct(productData);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
      error: 'CREATE_PRODUCT_ERROR'
    });
  }
}

async function getAllProducts(req, res) {
  try {
    const { search, categoryId, brandId } = req.query;
    const products = await productService.getAllProducts({ search, categoryId, brandId });
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
      error: 'GET_PRODUCTS_ERROR'
    });
  }
}

async function getProductById(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'NOT_FOUND'
      });
    }
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
      error: 'GET_PRODUCT_ERROR'
    });
  }
}

async function updateProduct(req, res) {
  try {
    // Parse FormData fields (they come as strings)
    const productData = {};
    
    if (req.body.name) productData.name = req.body.name;
    if (req.body.price) productData.price = parseFloat(req.body.price);
    if (req.body.stock) productData.stock = parseInt(req.body.stock, 10);
    if (req.body.categoryId) productData.categoryId = parseInt(req.body.categoryId, 10);
    if (req.body.brandId) productData.brandId = parseInt(req.body.brandId, 10);
    if (req.file) productData.imageUrl = req.file.path; // Cloudinary URL
    
    const product = await productService.updateProduct(req.params.id, productData);
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product',
      error: 'UPDATE_PRODUCT_ERROR'
    });
  }
}

async function deleteProduct(req, res) {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete product',
      error: 'DELETE_PRODUCT_ERROR'
    });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
