const express = require('express');

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const productRoutes = require('./product.route');
const brandRoutes = require('./brand.routes');
const categoryRoutes = require('./category.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/product', productRoutes);
router.use('./brand', brandRoutes);
router.use('./category', categoryRoutes);

module.exports = router;