const CashDrawerService = require('../services/cash-drawer.service');

class CashDrawerController {
    static async openDrawer(req, res) {
        try {
            const { tenantId, userId } = req.user;
            const { opening_balance } = req.body;

            const drawer = await CashDrawerService.openDrawer({
                tenant_id: tenantId,
                cashier_id: userId,
                opening_balance: opening_balance || 0,
            });

            res.status(201).json({
                success: true,
                message: 'Drawer opened successfully',
                data: drawer
            });
        } catch (error) {
            console.error('Error in openDrawer:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getCurrentDrawer(req, res) {
        try {
            const { userId } = req.user;

            const drawer = await CashDrawerService.getCurrentDrawer(userId);

            if (!drawer) {
                return res.status(404).json({
                    success: false,
                    message: 'No open drawer found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Current drawer retrieved successfully',
                data: drawer
            });
        } catch (error) {
            console.error('Error in getCurrentDrawer:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async closeDrawer(req, res) {
        try {
            const { drawer_id, closing_balance, notes } = req.body;

            if (!drawer_id || closing_balance === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Drawer ID and closing balance are required'
                });
            }

            const drawer = await CashDrawerService.closeDrawer(
                drawer_id,
                closing_balance,
                notes
            );

            res.status(200).json({
                success: true,
                message: 'Drawer closed successfully',
                data: drawer
            });
        } catch (error) {
            console.error('Error in closeDrawer:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getDrawerHistory(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                ...req.query,
            };

            const result = await CashDrawerService.getDrawerHistory(tenantId, filters);

            res.status(200).json({
                success: true,
                message: 'Drawer history retrieved successfully',
                ...result
            });
        } catch (error) {
            console.error('Error in getDrawerHistory:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getDrawerById(req, res) {
        try {
            const { tenantId } = req.user;
            const { drawerId } = req.params;

            const drawer = await CashDrawerService.getDrawerById(parseInt(drawerId), tenantId);

            if (!drawer) {
                return res.status(404).json({
                    success: false,
                    message: 'Drawer not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Drawer retrieved successfully',
                data: drawer
            });
        } catch (error) {
            console.error('Error in getDrawerById:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = CashDrawerController;
