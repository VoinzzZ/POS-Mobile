const express = require('express');
const ProductController = require('../controllers/product.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

const Product = new ProductController();

//admin
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, Product.addProduct);
router.put('/update-product/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, Product.updateProduct);
router.delete('/delete-product/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, Product.deleteProduct);

//default
router.get('/', AuthMiddleware.verifyToken, Product.getAllProducts);

module.exports = router;