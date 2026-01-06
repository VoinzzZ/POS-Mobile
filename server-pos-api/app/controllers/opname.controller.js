const opnameService = require('../services/opname.service');
const { checkValidate } = require('../utils/checkValidate');
const { createStockOpnameValidation, bulkCreateStockOpnameValidation, stockOpnameFiltersValidation } = require('../validation/opname.validation');

class OpnameController {
    static async createStockOpname(req, res) {
        try {
            const { error, value } = checkValidate(createStockOpnameValidation, req);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validasi gagal',
                    errors: error
                });
            }

            const { tenantId, userId } = req.user;
            const opnameData = {
                ...value,
                tenant_id: tenantId,
                created_by: userId
            };

            const opname = await opnameService.createStockOpname(opnameData);

            res.status(201).json({
                success: true,
                message: 'Stock opname created successfully',
                data: opname
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async bulkCreateStockOpname(req, res) {
        try {
            const { error, value } = checkValidate(bulkCreateStockOpnameValidation, req);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validasi gagal',
                    errors: error
                });
            }

            const { tenantId, userId } = req.user;

            const opnames = await opnameService.bulkCreateStockOpname(value.opnames, tenantId, userId);

            res.status(201).json({
                success: true,
                message: 'Bulk stock opname created successfully',
                data: opnames
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStockOpnames(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                tenant_id: tenantId,
                ...req.query
            };

            const result = await opnameService.getStockOpnames(filters);

            res.status(200).json({
                success: true,
                message: 'Stock opnames retrieved successfully',
                ...result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async processStockOpname(req, res) {
        try {
            const { opnameId } = req.params;
            const { tenantId, userId } = req.user;

            const existingOpname = await opnameService.getStockOpnames({
                tenant_id: tenantId,
                limit: 1
            });

            const result = await opnameService.processStockOpname(opnameId, userId);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = OpnameController;
