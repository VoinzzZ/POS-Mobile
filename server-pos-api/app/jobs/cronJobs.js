const cron = require('node-cron');
const prisma = require('../config/mysql.db.js');
const notificationService = require('../services/notification.service');

const startCronJobs = () => {
    cron.schedule('*/30 * * * *', async () => {
        console.log('Running low stock check cron job...');

        try {
            const activeTenants = await prisma.m_tenant.findMany({
                where: {
                    is_active: true,
                    tenant_status: 'APPROVED',
                    deleted_at: null
                },
                select: {
                    tenant_id: true,
                    tenant_name: true
                }
            });

            for (const tenant of activeTenants) {
                try {
                    await notificationService.getLowStockNotifications(tenant.tenant_id);
                    console.log(`Checked low stock for tenant: ${tenant.tenant_name}`);
                } catch (error) {
                    console.error(`Failed to check low stock for tenant ${tenant.tenant_name}:`, error.message);
                }
            }

            console.log('Low stock check completed');
        } catch (error) {
            console.error('Error in low stock cron job:', error);
        }
    });

    console.log('Cron jobs started: Low stock check runs every 30 minutes');
};

module.exports = { startCronJobs };
