const ProductService = require('../services/product.service');

async function addProduct(req, res) {
  try {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) {
      throw new Error('Missing required fields: name, price, stock');
    }

    const product = await ProductService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: error.message || 'Internal Server Error',
      error: 'BAD_REQUEST',
      details: error.stack
    });
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await ProductService.getAllProducts();

    return res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Internal Server Error',
      error: 'INTERNAL_SERVER_ERROR',
      details: error.stack
    });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);

    return res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      status: 'fail',
      message: error.message || 'Internal Server Error',
      error: 'NOT_FOUND',
      details: error.stack
    });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updated = await ProductService.updateProduct(id, req.body);

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: error.message || 'Internal Server Error',
      error: 'BAD_REQUEST',
      details: error.stack
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await ProductService.deleteProduct(id);

    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: error.message || 'Internal Server Error',
      error: 'BAD_REQUEST',
      details: error.stack
    });
  }
}

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
