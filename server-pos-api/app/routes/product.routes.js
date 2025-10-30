const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

// Create new product
router.post(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  ProductController.createProduct
);

// Get all products with filtering and pagination
router.get(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.getProducts
);

// Get products with infinite scroll (optimized for frontend)
router.get(
  '/infinite',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.getProductsInfinite
);

// Search products with infinite scroll
router.get(
  '/search',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.searchProductsInfinite
);

// Get products optimized for mobile (20 items per request)
router.get(
  '/mobile',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.getProductsMobile
);

// Search products optimized for mobile (20 items per request)
router.get(
  '/mobile/search',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.searchProductsMobile
);

// Quick load products for mobile - minimal data only
router.get(
  '/mobile/quick',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.getProductsQuickLoad
);

// Get product by ID
router.get(
  '/:productId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.getProductById
);

// Update product
router.put(
  '/:productId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  ProductController.updateProduct
);

// Delete product (soft delete)
router.delete(
  '/:productId',
  verifyToken,
  requireRole(['OWNER']),
  ProductController.deleteProduct
);

// Get products by category
router.get(
  '/category/:categoryId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.getProductsByCategory
);

// Get products by brand
router.get(
  '/brand/:brandId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.getProductsByBrand
);

// Toggle product status (activate/deactivate)
router.patch(
  '/:productId/toggle-status',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  ProductController.toggleProductStatus
);

// Toggle product sellable status
router.patch(
  '/:productId/toggle-sellable',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  ProductController.toggleProductSellableStatus
);

// Update product stock
router.patch(
  '/:productId/stock',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'KASIR']),
  ProductController.updateProductStock
);

module.exports = router;