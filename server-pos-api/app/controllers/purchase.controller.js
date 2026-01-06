const purchaseService = require('../services/purchase.service');
const { checkValidate } = require('../utils/checkValidate');
const { createPurchaseOrderValidation, updatePurchaseOrderValidation, purchaseOrderFiltersValidation } = require('../validation/purchase.validation');

class PurchaseController {
    static async createPurchaseOrder(req, res) {
        try {
            const { error, value } = checkValidate(createPurchaseOrderValidation, req);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validasi gagal',
                    errors: error
                });
            }

            const { tenantId, userId } = req.user;
            const poData = {
                ...value,
                tenant_id: tenantId,
                created_by: userId
            };

            const purchaseOrder = await purchaseService.createPurchaseOrder(poData);

            res.status(201).json({
                success: true,
                message: 'Purchase order created successfully',
                data: purchaseOrder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getPurchaseOrders(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                tenant_id: tenantId,
                ...req.query
            };

            const result = await purchaseService.getPurchaseOrders(filters);

            res.status(200).json({
                success: true,
                message: 'Purchase orders retrieved successfully',
                ...result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getPurchaseOrderById(req, res) {
        try {
            const { poId } = req.params;
            const { tenantId } = req.user;

            const purchaseOrder = await purchaseService.getPurchaseOrderById(poId);

            if (!purchaseOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase order not found'
                });
            }

            if (purchaseOrder.tenant_id !== tenantId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Purchase order retrieved successfully',
                data: purchaseOrder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async updatePurchaseOrder(req, res) {
        try {
            const { error, value } = checkValidate(updatePurchaseOrderValidation, req);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validasi gagal',
                    errors: error
                });
            }

            const { poId } = req.params;
            const { tenantId, userId } = req.user;

            const existingPO = await purchaseService.getPurchaseOrderById(poId);
            if (!existingPO) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase order not found'
                });
            }

            if (existingPO.tenant_id !== tenantId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const updateData = {
                ...value,
                updated_by: userId
            };

            const purchaseOrder = await purchaseService.updatePurchaseOrder(poId, updateData);

            res.status(200).json({
                success: true,
                message: 'Purchase order updated successfully',
                data: purchaseOrder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async receivePurchaseOrder(req, res) {
        try {
            const { poId } = req.params;
            const { tenantId, userId } = req.user;

            const existingPO = await purchaseService.getPurchaseOrderById(poId);
            if (!existingPO) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase order not found'
                });
            }

            if (existingPO.tenant_id !== tenantId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const result = await purchaseService.receivePurchaseOrder(poId, userId);

            res.status(200).json({
                success: true,
                message: 'Purchase order received successfully',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async cancelPurchaseOrder(req, res) {
        try {
            const { poId } = req.params;
            const { tenantId, userId } = req.user;

            const existingPO = await purchaseService.getPurchaseOrderById(poId);
            if (!existingPO) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase order not found'
                });
            }

            if (existingPO.tenant_id !== tenantId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const purchaseOrder = await purchaseService.cancelPurchaseOrder(poId, userId);

            res.status(200).json({
                success: true,
                message: 'Purchase order cancelled successfully',
                data: purchaseOrder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = PurchaseController;
