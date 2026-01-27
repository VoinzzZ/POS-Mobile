const notificationService = require('../services/notification.service');
const prisma = require('../config/mysql.db.js');

class NotificationController {
    static async getLowStockNotifications(req, res) {
        try {
            const { tenantId } = req.user;

            const notifications = await notificationService.getLowStockNotifications(tenantId);

            res.status(200).json({
                success: true,
                message: 'Low stock notifications retrieved successfully',
                data: notifications,
                count: notifications.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async registerPushToken(req, res) {
        try {
            const { userId } = req.user;
            const { pushToken } = req.body;

            if (!pushToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Push token is required'
                });
            }

            await prisma.m_user.update({
                where: {
                    user_id: userId
                },
                data: {
                    push_token: pushToken,
                    push_token_updated_at: new Date()
                }
            });

            res.status(200).json({
                success: true,
                message: 'Push token registered successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = NotificationController;
