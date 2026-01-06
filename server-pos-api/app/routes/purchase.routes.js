const express = require('express');
const router = express.Router();
const PurchaseController = require('../controllers/purchase.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post('/',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    PurchaseController.createPurchaseOrder
);

router.get('/',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    PurchaseController.getPurchaseOrders
);

router.get('/:poId',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    PurchaseController.getPurchaseOrderById
);

router.put('/:poId',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    PurchaseController.updatePurchaseOrder
);

router.post('/:poId/receive',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    PurchaseController.receivePurchaseOrder
);

router.delete('/:poId',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    PurchaseController.cancelPurchaseOrder
);

module.exports = router;
