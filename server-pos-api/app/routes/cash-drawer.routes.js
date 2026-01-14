const express = require('express');
const router = express.Router();
const CashDrawerController = require('../controllers/cash-drawer.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post('/open',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    CashDrawerController.openDrawer
);

router.get('/current',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    CashDrawerController.getCurrentDrawer
);

router.post('/close',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    CashDrawerController.closeDrawer
);

router.get('/history',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    CashDrawerController.getDrawerHistory
);

router.get('/:drawerId',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    CashDrawerController.getDrawerById
);

module.exports = router;
