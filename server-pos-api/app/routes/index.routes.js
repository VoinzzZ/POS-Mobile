const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const systemRoutes = require('./system.routes');
const registrationRoutes = require('./registration.route');
const approvalRoutes = require('./approval.routes');
const categoryRoutes = require('./category.routes');
const brandRoutes = require('./brand.routes');
const productRoutes = require('./product.routes');

const router = express.Router();

// Authentication & User Management
router.use('/auth', authRoutes);
router.use('/registration', registrationRoutes);
router.use('/users', userRoutes);
router.use('/system', systemRoutes);
router.use('/approvals', approvalRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);

module.exports = router;