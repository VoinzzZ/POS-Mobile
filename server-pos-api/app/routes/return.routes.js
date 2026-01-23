const express = require('express');
const router = express.Router();
const ReturnController = require('../controllers/return.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.get('/returnable-transactions', verifyToken, requireRole(['CASHIER', 'ADMIN', 'OWNER']), ReturnController.getReturnableTransactions);
router.post('/', verifyToken, requireRole(['CASHIER', 'ADMIN', 'OWNER']), ReturnController.createReturn);
router.get('/', verifyToken, requireRole(['CASHIER', 'ADMIN', 'OWNER']), ReturnController.getReturns);
router.get('/:id', verifyToken, requireRole(['CASHIER', 'ADMIN', 'OWNER']), ReturnController.getReturnById);

module.exports = router;
