const TransactionService = require('../services/transaction.service');

const formatTransactionResponse = (transaction) => {
    if (!transaction) return null;

    const formatted = { ...transaction };

    if (transaction.m_user) {
        formatted.cashier = {
            user_name: transaction.m_user.user_name,
            user_email: transaction.m_user.user_email
        };
        delete formatted.m_user;
    }

    if (transaction.t_transaction_item) {
        formatted.items = transaction.t_transaction_item.map(item => ({
            ...item,
            product: item.m_product || item.product
        }));
        formatted.items.forEach(item => {
            if (item.m_product) delete item.m_product;
        });
        delete formatted.t_transaction_item;
    }

    return formatted;
};


class TransactionController {
    static async createTransaction(req, res) {
        try {
            const { tenantId, userId } = req.user;
            const { items } = req.body;

            if (!items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction must have at least one item'
                });
            }

            const transaction = await TransactionService.createTransaction({
                tenant_id: tenantId,
                cashier_id: userId,
                items
            });

            res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: formatTransactionResponse(transaction)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getTransactions(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                tenant_id: tenantId,
                ...req.query
            };

            const result = await TransactionService.getTransactions(filters);

            res.status(200).json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: {
                    data: result.data.map(formatTransactionResponse),
                    pagination: result.pagination
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getTransactionById(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId } = req.user;

            const transaction = await TransactionService.getTransactionById(transactionId, tenantId);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Transaction retrieved successfully',
                data: formatTransactionResponse(transaction)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async completeTransaction(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId } = req.user;
            const { payment_amount, payment_method = 'CASH' } = req.body;

            if (!payment_amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment amount is required'
                });
            }

            const transaction = await TransactionService.completeTransaction(
                transactionId,
                { payment_amount, payment_method },
                tenantId
            );

            res.status(200).json({
                success: true,
                message: 'Transaction completed successfully',
                data: formatTransactionResponse(transaction)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    static async deleteTransaction(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId, userId } = req.user;

            await TransactionService.deleteTransaction(transactionId, tenantId, userId);

            res.status(200).json({
                success: true,
                message: 'Transaction deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getReceiptData(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId } = req.user;

            const transaction = await TransactionService.getTransactionById(transactionId, tenantId);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            if (transaction.transaction_status !== 'COMPLETED') {
                return res.status(400).json({
                    success: false,
                    message: 'Only completed transactions can generate receipts'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Receipt data retrieved successfully',
                data: formatTransactionResponse(transaction)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getDashboardStats(req, res) {
        try {
            const { tenantId, userId, role } = req.user;
            const { cashier_id } = req.query;

            const cashierId = role === 'CASHIER' ? userId : cashier_id;

            const stats = await TransactionService.getDashboardStats(tenantId, cashierId);

            res.status(200).json({
                success: true,
                message: 'Dashboard stats retrieved successfully',
                data: {
                    ...stats,
                    recentTransactions: stats.recentTransactions.map(formatTransactionResponse)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = TransactionController;
