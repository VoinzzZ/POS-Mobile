const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brand.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

// Create new brand
router.post(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  BrandController.createBrand
);

// Get all brands with filtering
router.get(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'CASHIER']),
  BrandController.getBrands
);

// Get brand by ID
router.get(
  '/:brandId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'CASHIER']),
  BrandController.getBrandById
);

// Update brand
router.put(
  '/:brandId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  BrandController.updateBrand
);

// Delete brand (soft delete)
router.delete(
  '/:brandId',
  verifyToken,
  requireRole(['OWNER']),
  BrandController.deleteBrand
);

// Toggle brand status (activate/deactivate)
router.patch(
  '/:brandId/toggle-status',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  BrandController.toggleBrandStatus
);

module.exports = router;