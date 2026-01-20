const express = require('express');
const router = express.Router();
const CashTransactionController = require('../controllers/cash-transaction.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post(
    '/',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    CashTransactionController.createCashTransaction
);

router.get(
    '/',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    CashTransactionController.getCashTransactions
);

router.get(
    '/balance',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    CashTransactionController.getCashBalance
);

router.get(
    '/summary',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    CashTransactionController.getCashFlowSummary
);

router.get(
    '/expenses/by-category',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    CashTransactionController.getExpenseByCategory
);

router.get(
    '/:transactionId',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    CashTransactionController.getCashTransactionById
);

router.put(
    '/:transactionId',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    CashTransactionController.updateCashTransaction
);

router.delete(
    '/:transactionId',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    CashTransactionController.deleteCashTransaction
);

router.post(
    '/:transactionId/verify',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    CashTransactionController.verifyCashTransaction
);

router.post(
    '/sync/:transactionId',
    verifyToken,
    requireRole(['OWNER', 'ADMIN', 'CASHIER']),
    CashTransactionController.syncFromSaleTransaction
);

module.exports = router;
