const BaseController = require('./base.controller');
const prisma = require('../config/mysql.db');
const crypto = require('crypto');
const { ValidationError, NotFoundError } = require('../utils/errors');

class AdminController extends BaseController {
    constructor() {
        super();
        this.prisma = prisma;
    }

    // Helper Methods
    #generatePinCode() {
        return crypto.randomInt(100000, 999999).toString();
    }

    #calculateExpiryDate(hours) {
        return new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    // Generate Registration PIN
    generatePin = this.asyncHandler(async (req, res) => {
        const { expiresInHours = 24 } = req.body;
        const { userId: adminId } = req.user;

        // Validate expiry hours
        if (expiresInHours < 1 || expiresInHours > 168) { // max 1 week
            throw new ValidationError('Expiry hours must be between 1 and 168');
        }

        const code = this.#generatePinCode();
        const expiresAt = this.#calculateExpiryDate(expiresInHours);

        const pin = await this.prisma.registrationPin.create({
            data: {
                code,
                expiresAt,
                createdById: adminId
            }
        });

        return this.sendSuccess(res, {
            statusCode: 201,
            message: 'Registration PIN generated successfully',
            data: {
                pin: pin.code,
                expiresAt: pin.expiresAt
            }
        });
    });

    // List all generated PINs
    listPins = this.asyncHandler(async (req, res) => {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Build where clause based on status filter
        const where = {};
        if (status === 'active') {
            where.AND = [
                { used: false },
                { expiresAt: { gt: new Date() } }
            ];
        } else if (status === 'used') {
            where.used = true;
        } else if (status === 'expired') {
            where.AND = [
                { used: false },
                { expiresAt: { lt: new Date() } }
            ];
        }

        // Get pins with pagination
        const [pins, total] = await Promise.all([
            this.prisma.registrationPin.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            this.prisma.registrationPin.count({ where })
        ]);

        return this.sendSuccess(res, {
            message: 'Registration PINs retrieved successfully',
            data: {
                pins,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    });

    // Revoke a PIN
    revokePin = this.asyncHandler(async (req, res) => {
        const { pinId } = req.params;
        const { userId: adminId } = req.user;

        const pin = await this.prisma.registrationPin.findUnique({
            where: { id: pinId }
        });

        if (!pin) {
            throw new NotFoundError('Registration PIN not found');
        }

        if (pin.used) {
            throw new ValidationError('Cannot revoke already used PIN');
        }

        await this.prisma.registrationPin.update({
            where: { id: pinId },
            data: {
                expiresAt: new Date(), // Expire immediately
                revokedById: adminId,
                revokedAt: new Date()
            }
        });

        return this.sendSuccess(res, {
            message: 'Registration PIN revoked successfully'
        });
    });

    // Get PIN usage statistics
    getPinStats = this.asyncHandler(async (req, res) => {
        const stats = await this.prisma.$transaction([
            // Total active PINs
            this.prisma.registrationPin.count({
                where: {
                    used: false,
                    expiresAt: { gt: new Date() }
                }
            }),
            // Total used PINs
            this.prisma.registrationPin.count({
                where: { used: true }
            }),
            // Total expired PINs
            this.prisma.registrationPin.count({
                where: {
                    used: false,
                    expiresAt: { lt: new Date() }
                }
            }),
            // Recent activity
            this.prisma.registrationPin.findMany({
                where: {
                    OR: [
                        { used: true },
                        { expiresAt: { lt: new Date() } }
                    ]
                },
                orderBy: { 
                    updatedAt: 'desc'
                },
                take: 5,
                include: {
                    createdBy: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            })
        ]);

        return this.sendSuccess(res, {
            message: 'PIN statistics retrieved successfully',
            data: {
                activePins: stats[0],
                usedPins: stats[1],
                expiredPins: stats[2],
                recentActivity: stats[3]
            }
        });
    });
}

module.exports = AdminController;
