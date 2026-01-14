const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const systemRoutes = require('./system.routes');
const registrationRoutes = require('./registration.route');
const approvalRoutes = require('./approval.routes');
const categoryRoutes = require('./category.routes');
const brandRoutes = require('./brand.routes');
const productRoutes = require('./product.routes');
const storeRoutes = require('./store.routes');
const stockRoutes = require('./stock.routes');
const purchaseRoutes = require('./purchase.routes');
const opnameRoutes = require('./opname.routes');
const transactionRoutes = require('./transaction.routes');
const financialReportRoutes = require('./financial-report.routes');
const cashDrawerRoutes = require('./cash-drawer.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/registration', registrationRoutes);
router.use('/users', userRoutes);
router.use('/system', systemRoutes);
router.use('/approvals', approvalRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/store', storeRoutes);
router.use('/stock', stockRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/opname', opnameRoutes);
router.use('/transactions', transactionRoutes);
router.use('/financial', financialReportRoutes);
router.use('/cash-drawer', cashDrawerRoutes);

module.exports = router;