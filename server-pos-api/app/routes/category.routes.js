const express = require('express');
const AuthMiddleware = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.requireCashierOrAdmin, categoryController.getAllCategories);
router.get('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireCashierOrAdmin, categoryController.getCategoryById);
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, categoryController.createCategory);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, categoryController.updateCategory);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, categoryController.deleteCategory);

module.exports = router;
