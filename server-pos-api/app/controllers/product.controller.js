const ProductService = require('../services/product.service');
const { AppError } = require('../utils/errors');

class ProductController {
  addProduct = async (req, res, next) => {
    try {
      const { name, price, stock } = req.body;
      if (!name || !price || !stock) {
        throw new AppError('Missing required fields: name, price, stock', 400, 'MISSING_FIELDS');
      }

      const product = await ProductService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (err) {
      next(err);
    }
  };

  getAllProducts = async (req, res, next) => {
    try {
      const products = await ProductService.getAllProducts();

      res.json({
        success: true,
        message: 'Products retrieved successfully',
        data: products
      });
    } catch (err) {
      next(err);
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      res.json({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (err) {
      next(err);
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await ProductService.updateProduct(id, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = ProductController;
