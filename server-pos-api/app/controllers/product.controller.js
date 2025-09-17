const productService = require('../services/product.service');

async function createProduct(req, res) {
  try {
    const product = await productService.createProduct(req.body);
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
    const product = await productService.updateProduct(req.params.id, req.body);
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
