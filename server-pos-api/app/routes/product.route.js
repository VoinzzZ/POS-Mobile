const express = require('express');
const AuthMiddleware = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');
const { upload, handleMulterError } = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.requireCashierOrAdmin, productController.getAllProducts);
router.get('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireCashierOrAdmin, productController.getProductById);
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, upload.single('image'), handleMulterError, productController.createProduct);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, upload.single('image'), handleMulterError, productController.updateProduct);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, productController.deleteProduct);

module.exports = router;