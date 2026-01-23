const ReturnService = require('../services/return.service');

class ReturnController {
    static async getReturnableTransactions(req, res) {
        try {
            const { tenantId, userId, role } = req.user;
            const { cashier_id } = req.query;

            let filterCashierId = null;
            if (role === 'CASHIER') {
                filterCashierId = userId;
            } else if (cashier_id) {
                filterCashierId = cashier_id;
            }

            const transactions = await ReturnService.getReturnableTransactions(tenantId, filterCashierId);

            return res.status(200).json({
                success: true,
                message: 'Returnable transactions retrieved successfully',
                data: transactions
            });
        } catch (error) {
            console.error('Error getting returnable transactions:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get returnable transactions'
            });
        }
    }

    static async createReturn(req, res) {
        try {
            const { tenantId, userId } = req.user;
            const { transaction_id, items, notes } = req.body;

            if (!transaction_id || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID and items are required'
                });
            }

            for (const item of items) {
                if (!item.product_id || !item.quantity || item.quantity <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each item must have product_id and valid quantity'
                    });
                }
            }

            const returnRecord = await ReturnService.createReturn({
                tenant_id: tenantId,
                cashier_id: userId,
                transaction_id,
                items,
                notes
            });

            return res.status(201).json({
                success: true,
                message: 'Return created successfully',
                data: returnRecord
            });
        } catch (error) {
            console.error('Error creating return:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to create return'
            });
        }
    }

    static async getReturns(req, res) {
        try {
            const { tenantId, userId, role } = req.user;
            const { start_date, end_date, cashier_id, page, limit } = req.query;

            let filterCashierId = null;
            if (role === 'CASHIER') {
                filterCashierId = userId;
            } else if (cashier_id) {
                filterCashierId = cashier_id;
            }

            const returns = await ReturnService.getReturns({
                tenant_id: tenantId,
                start_date,
                end_date,
                cashier_id: filterCashierId,
                page,
                limit
            });

            return res.status(200).json({
                success: true,
                message: 'Returns retrieved successfully',
                data: returns.data,
                pagination: returns.pagination
            });
        } catch (error) {
            console.error('Error getting returns:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get returns'
            });
        }
    }

    static async getReturnById(req, res) {
        try {
            const { tenantId } = req.user;
            const { id } = req.params;

            const returnRecord = await ReturnService.getReturnById(id, tenantId);

            if (!returnRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Return not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Return retrieved successfully',
                data: returnRecord
            });
        } catch (error) {
            console.error('Error getting return:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get return'
            });
        }
    }
}

module.exports = ReturnController;
