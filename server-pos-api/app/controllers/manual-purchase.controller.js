const manualPurchaseService = require('../services/manual-purchase.service');

class ManualPurchaseController {
    static async recordPurchase(req, res) {
        try {
            const { tenantId, userId } = req.user;
            const purchaseData = {
                ...req.body,
                tenant_id: tenantId,
                created_by: userId
            };

            if (!purchaseData.product_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            if (!purchaseData.quantity || purchaseData.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be greater than 0'
                });
            }

            if (!purchaseData.total_price || purchaseData.total_price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Total price must be greater than 0'
                });
            }



            const result = await manualPurchaseService.recordManualPurchase(purchaseData);

            res.status(201).json({
                success: true,
                message: 'Purchase recorded successfully',
                data: result
            });
        } catch (error) {
            if (error.message === 'Product not found') {
                return res.status(404).json({
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

    static async getPurchaseHistory(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                tenant_id: tenantId,
                ...req.query
            };

            const result = await manualPurchaseService.getBulkPurchaseHistory(filters);

            res.status(200).json({
                success: true,
                message: 'Purchase history retrieved successfully',
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

    static async getPurchaseSummary(req, res) {
        try {
            const { tenantId } = req.user;
            const { start_date, end_date } = req.query;

            const summary = await manualPurchaseService.getPurchaseSummary(
                tenantId,
                start_date,
                end_date
            );

            res.status(200).json({
                success: true,
                message: 'Purchase summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ManualPurchaseController;
