const BaseController = require('./base.controller');
const AdminService = require('../services/admin.service');

class AdminController extends BaseController {
    constructor() {
        super();
        this.adminService = new AdminService();
    }

    generatePin = this.asyncHandler(async (req, res) => {
        const { expiresInHours } = req.body;
        const { userId: adminId } = req.user;

        const data = await this.adminService.generatePin(adminId, expiresInHours);
        return this.sendSuccess(res, {
            statusCode: 201,
            message: 'Registration PIN generated successfully',
            data
        });
    });

    listPins = this.asyncHandler(async (req, res) => {
        const { status, page, limit } = req.query;
        const data = await this.adminService.listPins(status, page, limit);
        return this.sendSuccess(res, {
            message: 'Registration PINs retrieved successfully',
            data
        });
    });

    revokePin = this.asyncHandler(async (req, res) => {
        const { pinId } = req.params;
        const { userId: adminId } = req.user;

        await this.adminService.revokePin(pinId, adminId);
        return this.sendSuccess(res, {
            message: 'Registration PIN revoked successfully'
        });
    });

    getPinStats = this.asyncHandler(async (req, res) => {
        const data = await this.adminService.getPinStats();
        return this.sendSuccess(res, {
            message: 'PIN statistics retrieved successfully',
            data
        });
    });
}

module.exports = AdminController;
