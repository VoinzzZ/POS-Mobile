const express = require('express');
const router = express.Router();
const ManualPurchaseController = require('../controllers/manual-purchase.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post(
    '/',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    ManualPurchaseController.recordPurchase
);

router.get(
    '/',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    ManualPurchaseController.getPurchaseHistory
);

router.get(
    '/summary',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    ManualPurchaseController.getPurchaseSummary
);

module.exports = router;
