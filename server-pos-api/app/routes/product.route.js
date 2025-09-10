const express = require('express');
const ProductController = require('../controllers/product.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

const Product = new ProductController();

//admin
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, Product.addProduct);

//default
router.get('/', AuthMiddleware.verifyToken, Product.getAllProducts);

module.exports = router;