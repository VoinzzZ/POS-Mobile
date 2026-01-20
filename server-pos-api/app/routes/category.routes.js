const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

// Create new category
router.post(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  CategoryController.createCategory
);

// Get all categories with filtering and pagination
router.get(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'CASHIER']),
  CategoryController.getCategories
);

// Get category by ID
router.get(
  '/:categoryId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'CASHIER']),
  CategoryController.getCategoryById
);

// Update category
router.put(
  '/:categoryId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  CategoryController.updateCategory
);

// Delete category (soft delete)
router.delete(
  '/:categoryId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  CategoryController.deleteCategory
);

// Get categories by brand
router.get(
  '/brand/:brandId',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'CASHIER']),
  CategoryController.getCategoriesByBrand
);

// Toggle category status (activate/deactivate)
router.patch(
  '/:categoryId/toggle-status',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  CategoryController.toggleCategoryStatus
);

module.exports = router;