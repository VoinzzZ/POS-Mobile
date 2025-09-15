const express = require('express');
const ProductController = require('../controllers/product.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Admin routes
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, ProductController.addProduct);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, ProductController.updateProduct);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, ProductController.deleteProduct);

// Public / default routes
router.get('/', AuthMiddleware.verifyToken, ProductController.getAllProducts);
router.get('/:id', AuthMiddleware.verifyToken, ProductController.getProductById);

module.exports = router;
