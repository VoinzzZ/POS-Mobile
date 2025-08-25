const prisma = require('../config/mysql.db');
const crypto = require('crypto');

class AdminController {
    static async generatePin(req, res) {
        try {
            const { expiresInHours = 24 } = req.body;

            // Generate PIN random 6 digit
            const code = crypto.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

            const pin = await prisma.registrationPin.create({
                data: {
                    code,
                    expiresAt,
                    createdById: req.user.userId // admin yang bikin
                }
            });

            res.status(201).json({
                success: true,
                message: 'Registration PIN generated',
                data: {
                    pin: pin.code,
                    expiresAt: pin.expiresAt
                }
            });

        } catch (error) {
            console.error('Generate PIN error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate registration PIN',
                error: 'GENERATE_PIN_ERROR'
            });
        }
    }
}

module.exports = AdminController;
