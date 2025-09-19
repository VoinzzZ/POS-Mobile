const express = require("express");
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post("/", authMiddleware.verifyToken, authMiddleware.requireCashierOrAdmin, transactionController.createTransaction);
router.get("/", authMiddleware.verifyToken, authMiddleware.requireCashierOrAdmin, transactionController.getAllTransactions);

module.exports = router;
