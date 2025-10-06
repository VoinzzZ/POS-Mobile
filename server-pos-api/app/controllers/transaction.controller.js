const transactionService = require("../services/transaction.service");

// Create Transaction
const createTransaction = async (req, res) => {
  try {
    const cashierId = req.user?.userId;
    console.log('🔍 Create Transaction Request:');
    console.log('- User ID:', cashierId);
    console.log('- Request Body:', JSON.stringify(req.body, null, 2));
    
    if (!cashierId) return res.status(401).json({ success: false, message: "User belum login" });

    const result = await transactionService.createTransaction(req.body, cashierId);
    console.log('✅ Transaction created successfully:', result.id);
    return res.status(201).json({ success: true, message: "Transaksi berhasil dibuat", data: result });
  } catch (error) {
    console.error('❌ Create Transaction Error:', error.message);
    console.error('❌ Error Stack:', error.stack);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Transactions
const getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, cashierId, status, page, limit } = req.query;

    const result = await transactionService.getAllTransactions({
      startDate,
      endDate,
      cashierId,
      status,
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

// Update Transaction
const updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ success: false, message: "User belum login" });
    
    const result = await transactionService.updateTransaction(transactionId, req.body, userId, userRole);
    return res.json({ success: true, message: "Transaction updated successfully", data: result });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) return res.status(401).json({ success: false, message: "User belum login" });
    
    const result = await transactionService.deleteTransaction(transactionId, userId, userRole);
    return res.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Complete Transaction Payment
const completePayment = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { paymentAmount, paymentMethod } = req.body;
    const cashierId = req.user?.userId;

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Payment amount required" });
    }

    const result = await transactionService.completeTransactionPayment(transactionId, paymentAmount, paymentMethod, cashierId);
    return res.json({ success: true, message: "Payment completed successfully", data: result });
  } catch (error) {
    console.error("Complete Payment Error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get Receipt Data for PDF Generation
const getReceiptData = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const cashierId = req.user?.userId;

    const result = await transactionService.getReceiptData(transactionId, cashierId);
    return res.json({ success: true, message: "Receipt data retrieved", data: result });
  } catch (error) {
    console.error("Get Receipt Data Error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionDetail,
  updateTransaction,
  deleteTransaction,
  completePayment,
  getReceiptData
};
