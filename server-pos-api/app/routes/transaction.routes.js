const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post('/',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    TransactionController.createTransaction
);

router.get('/dashboard/stats',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    TransactionController.getDashboardStats
);

router.get('/',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    TransactionController.getTransactions
);

router.get('/:transactionId',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    TransactionController.getTransactionById
);

router.get('/:transactionId/receipt',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    TransactionController.getReceiptData
);

router.post('/:transactionId/complete',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    TransactionController.completeTransaction
);


router.delete('/:transactionId',
    verifyToken,
    requireRole(['CASHIER', 'ADMIN', 'OWNER']),
    TransactionController.deleteTransaction
);

module.exports = router;
