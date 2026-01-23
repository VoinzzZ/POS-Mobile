const express = require('express');
const router = express.Router();
const StockController = require('../controllers/stock.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post('/movements',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    StockController.createStockMovement
);

router.get('/movements',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    StockController.getStockMovements
);

router.get('/movements/product/:productId',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    StockController.getStockMovementsByProduct
);

router.get('/valuation',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    StockController.getInventoryValuation
);

router.get('/low-stock',
    verifyToken,
    requireRole(['ADMIN', 'OWNER', 'CASHIER']),
    StockController.getLowStockProducts
);

router.get('/dead-stock',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    StockController.getDeadStockProducts
);

router.get('/movement-statistics',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    StockController.getStockMovementStatistics
);

module.exports = router;
