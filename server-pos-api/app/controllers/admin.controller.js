const AdminService = require('../services/admin.service');
const { AppError } = require('../utils/errors');

class AdminController {
    constructor() {
        this.adminService = new AdminService();
    }

    // Generate PIN dengan try-catch
    generatePin = async (req, res) => {
        try {
            const { expiresInHours } = req.body;
            const { userId: adminId } = req.user;

            const data = await this.adminService.generatePin(adminId, expiresInHours);

            return res.status(201).json({
                success: true,
                status: 'success',
                message: 'Registration PIN generated successfully',
                data
            });

        } catch (error) {
            return res.status(error instanceof ValidationError ? 400 : 500).json({
                success: false,
                status: error instanceof ValidationError ? 'fail' : 'error',
                message: error.message || 'Internal Server Error',
                error: error.code || 'INTERNAL_SERVER_ERROR',
                details: error.stack
            });
        }
    };


    listPins = async (req, res, next) => {
        try {
            const { status, page, limit } = req.query;
            const data = await this.adminService.listPins(status, page, limit);

            res.json({
                success: true,
                message: 'Registration PINs retrieved successfully',
                data
            });
        } catch (error) {
            next(error);
        }
    };

    revokePin = async (req, res, next) => {
        try {
            const { pinId } = req.params;
            const { userId: adminId } = req.user;

            await this.adminService.revokePin(pinId, adminId);

            res.json({
                success: true,
                message: 'Registration PIN revoked successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getPinStats = async (req, res, next) => {
        try {
            const data = await this.adminService.getPinStats();

            res.json({
                success: true,
                message: 'PIN statistics retrieved successfully',
                data
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = AdminController;