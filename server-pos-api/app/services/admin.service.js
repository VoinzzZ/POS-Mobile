const prisma = require('../config/mysql.db');
const crypto = require('crypto');
const { ValidationError, NotFoundError } = require('../utils/errors');

class AdminService {
    constructor() {
        this.prisma = prisma;
    }

    // Helper Methods
    generatePinCode() {
        return crypto.randomInt(100000, 999999).toString();
    }

    calculateExpiryDate(hours) {
        return new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    // Generate Registration PIN
    async generatePin(adminId, expiresInHours = 24) {
        if (expiresInHours < 1 || expiresInHours > 168) {
            throw new ValidationError('Expiry hours must be between 1 and 168');
        }

        const code = this.generatePinCode();
        const expiresAt = this.calculateExpiryDate(expiresInHours);

        const pin = await this.prisma.registrationPin.create({
            data: {
                code,
                expiresAt,
                createdById: adminId
            }
        });

        return {
            pin: pin.code,
            expiresAt: pin.expiresAt
        };
    }

    // List all generated PINs
    async listPins(status, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
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

        return {
            pins,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Revoke a PIN
    async revokePin(pinId, adminId) {
        const pin = await this.prisma.registrationPin.findUnique({
            where: { id: pinId }
        });

        if (!pin) throw new NotFoundError('Registration PIN not found');
        if (pin.used) throw new ValidationError('Cannot revoke already used PIN');

        await this.prisma.registrationPin.update({
            where: { id: pinId },
            data: {
                expiresAt: new Date(),
                revokedById: adminId,
                revokedAt: new Date()
            }
        });
    }

    // Get PIN usage statistics
    async getPinStats() {
        const stats = await this.prisma.$transaction([
            this.prisma.registrationPin.count({
                where: {
                    used: false,
                    expiresAt: { gt: new Date() }
                }
            }),
            this.prisma.registrationPin.count({
                where: { used: true }
            }),
            this.prisma.registrationPin.count({
                where: {
                    used: false,
                    expiresAt: { lt: new Date() }
                }
            }),
            this.prisma.registrationPin.findMany({
                where: {
                    OR: [
                        { used: true },
                        { expiresAt: { lt: new Date() } }
                    ]
                },
                orderBy: { updatedAt: 'desc' },
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

        return {
            activePins: stats[0],
            usedPins: stats[1],
            expiredPins: stats[2],
            recentActivity: stats[3]
        };
    }
}

module.exports = AdminService;
