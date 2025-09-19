// controllers/transaction.controller.js
const transactionService = require("../services/transaction.service");

const createTransaction = async (req, res) => {
  try {
    const result = await transactionService.createTransaction(req.body);
    return res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat",
      data: result
    });
  } catch (error) {
    console.error("Create Transaction Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

async function getAllTransactions(req, res) {
  try {
    const { startDate, endDate, cashierId, page, limit } = req.query;

    const result = await transactionService.getAllTransactions({
      startDate,
      endDate,
      cashierId,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message,
    });
  }
}

module.exports = {
  createTransaction,
  getAllTransactions
};
