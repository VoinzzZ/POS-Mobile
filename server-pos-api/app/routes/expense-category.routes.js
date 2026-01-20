const express = require('express');
const router = express.Router();
const ExpenseCategoryController = require('../controllers/expense-category.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post(
    '/seed',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    ExpenseCategoryController.seedDefaultCategories
);

router.post(
    '/',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    ExpenseCategoryController.createCategory
);

router.get(
    '/',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    ExpenseCategoryController.getCategories
);

router.get(
    '/:categoryId',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    ExpenseCategoryController.getCategoryById
);

router.put(
    '/:categoryId',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    ExpenseCategoryController.updateCategory
);

router.delete(
    '/:categoryId',
    verifyToken,
    requireRole(['OWNER']),
    ExpenseCategoryController.deleteCategory
);

module.exports = router;
