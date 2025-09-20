const transactionService = require("../services/transaction.service");

// Create Transaction
const createTransaction = async (req, res) => {
  try {
    const cashierId = req.user?.userId;
    if (!cashierId) return res.status(401).json({ success: false, message: "User belum login" });

    const result = await transactionService.createTransaction(req.body, cashierId);
    return res.status(201).json({ success: true, message: "Transaksi berhasil dibuat", data: result });
  } catch (error) {
    console.error("Create Transaction Error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Transactions
const getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, cashierId, page, limit } = req.query;

    const result = await transactionService.getAllTransactions({
      startDate,
      endDate,
      cashierId,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    res.json({ success: true, message: 'Transactions retrieved successfully', ...result });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

// Get Transaction Detail
const getTransactionDetail = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const result = await transactionService.getTransactionDetail(transactionId);
    res.json({ success: true, message: 'Transaction detail retrieved', data: result });
  } catch (error) {
    console.error('Error fetching transaction detail:', error);
    res.status(404).json({ success: false, message: error.message });
  }
};

// Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const cashierId = req.user?.userId;
    const result = await transactionService.deleteTransaction(transactionId, cashierId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionDetail,
  deleteTransaction
};
