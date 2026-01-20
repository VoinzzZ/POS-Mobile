const cashTransactionService = require('../services/cash-transaction.service');

class CashTransactionController {
    static async createCashTransaction(req, res) {
        try {
            const { tenantId, userId } = req.user;
            const transactionData = {
                ...req.body,
                tenant_id: tenantId,
                created_by: userId
            };

            if (!transactionData.amount || transactionData.amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
            }

            if (!transactionData.transaction_type) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction type is required'
                });
            }

            if (!transactionData.payment_method) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment method is required'
                });
            }

            const cashTransaction = await cashTransactionService.createCashTransaction(transactionData);

            res.status(201).json({
                success: true,
                message: 'Cash transaction created successfully',
                data: cashTransaction
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getCashTransactions(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                tenant_id: tenantId,
                ...req.query
            };

            const result = await cashTransactionService.getCashTransactions(filters);

            res.status(200).json({
                success: true,
                message: 'Cash transactions retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getCashTransactionById(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId } = req.user;

            const transaction = await cashTransactionService.getCashTransactionById(transactionId, tenantId);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Cash transaction not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Cash transaction retrieved successfully',
                data: transaction
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async updateCashTransaction(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId, userId } = req.user;
            const updateData = {
                ...req.body,
                updated_by: userId
            };

            const transaction = await cashTransactionService.updateCashTransaction(
                transactionId,
                updateData,
                tenantId
            );

            res.status(200).json({
                success: true,
                message: 'Cash transaction updated successfully',
                data: transaction
            });
        } catch (error) {
            if (error.message === 'Cash transaction not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message === 'Cannot update verified transaction') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async deleteCashTransaction(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId, userId } = req.user;

            await cashTransactionService.deleteCashTransaction(transactionId, userId, tenantId);

            res.status(200).json({
                success: true,
                message: 'Cash transaction deleted successfully'
            });
        } catch (error) {
            if (error.message === 'Cash transaction not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message === 'Cannot delete verified transaction') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async verifyCashTransaction(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId, userId } = req.user;

            const transaction = await cashTransactionService.verifyCashTransaction(
                transactionId,
                userId,
                tenantId
            );

            res.status(200).json({
                success: true,
                message: 'Cash transaction verified successfully',
                data: transaction
            });
        } catch (error) {
            if (error.message === 'Cash transaction not found' || error.message === 'Transaction already verified') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getCashBalance(req, res) {
        try {
            const { tenantId } = req.user;
            const { payment_method } = req.query;

            const balance = await cashTransactionService.getCashBalance(tenantId, payment_method);

            res.status(200).json({
                success: true,
                message: 'Cash balance retrieved successfully',
                data: balance
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getCashFlowSummary(req, res) {
        try {
            const { tenantId } = req.user;
            const { start_date, end_date } = req.query;

            const summary = await cashTransactionService.getCashFlowSummary(
                tenantId,
                start_date,
                end_date
            );

            res.status(200).json({
                success: true,
                message: 'Cash flow summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getExpenseByCategory(req, res) {
        try {
            const { tenantId } = req.user;
            const { start_date, end_date } = req.query;

            const expenses = await cashTransactionService.getExpenseByCategory(
                tenantId,
                start_date,
                end_date
            );

            res.status(200).json({
                success: true,
                message: 'Expense by category retrieved successfully',
                data: expenses
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async syncFromSaleTransaction(req, res) {
        try {
            const { transactionId } = req.params;
            const { tenantId, userId } = req.user;

            const cashTransaction = await cashTransactionService.syncFromSaleTransaction(
                transactionId,
                tenantId,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Sale transaction synced successfully',
                data: cashTransaction
            });
        } catch (error) {
            if (error.message === 'Transaction already synced' || error.message === 'Sale transaction not found or not completed') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = CashTransactionController;
