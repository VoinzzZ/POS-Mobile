const stockService = require('../services/stock.service');
const { checkValidate } = require('../utils/checkValidate');
const { createStockMovementValidation, stockMovementFiltersValidation } = require('../validation/stock.validation');

class StockController {
    static async createStockMovement(req, res) {
        try {
            const { error, value } = checkValidate(createStockMovementValidation, req);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validasi gagal',
                    errors: error
                });
            }

            const { tenantId, userId } = req.user;
            const movementData = {
                ...value,
                tenant_id: tenantId,
                created_by: userId
            };

            const movement = await stockService.createStockMovement(movementData);

            res.status(201).json({
                success: true,
                message: 'Stock movement created successfully',
                data: movement
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStockMovements(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                tenant_id: tenantId,
                ...req.query
            };

            const result = await stockService.getStockMovements(filters);

            res.status(200).json({
                success: true,
                message: 'Stock movements retrieved successfully',
                ...result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStockMovementsByProduct(req, res) {
        try {
            const { productId } = req.params;
            const { tenantId } = req.user;
            const { limit } = req.query;

            const movements = await stockService.getStockMovementsByProduct(productId, tenantId, limit);

            res.status(200).json({
                success: true,
                message: 'Product stock movements retrieved successfully',
                data: movements
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getInventoryValuation(req, res) {
        try {
            const { tenantId } = req.user;

            const valuation = await stockService.calculateInventoryValuation(tenantId);

            res.status(200).json({
                success: true,
                message: 'Inventory valuation retrieved successfully',
                data: valuation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getLowStockProducts(req, res) {
        try {
            const { tenantId } = req.user;

            const products = await stockService.getLowStockProducts(tenantId);

            res.status(200).json({
                success: true,
                message: 'Low stock products retrieved successfully',
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getDeadStockProducts(req, res) {
        try {
            const { tenantId } = req.user;
            const { days = 90 } = req.query;

            const products = await stockService.getDeadStockProducts(tenantId, parseInt(days));

            res.status(200).json({
                success: true,
                message: 'Dead stock products retrieved successfully',
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = StockController;
