const express = require('express');
const router = express.Router();
const TopProductsController = require('../controllers/top-products.controller');
const { verifyToken } = require('../middlewares/verifyToken');

// Get top selling products
router.get('/top-products', verifyToken, TopProductsController.getTopProducts);

module.exports = router;
