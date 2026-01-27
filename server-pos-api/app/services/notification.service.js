const prisma = require('../config/mysql.db.js');

const getLowStockNotifications = async (tenant_id) => {
    try {
        const tenantIdInt = parseInt(tenant_id);

        const productsBackToNormal = await prisma.$queryRaw`
            SELECT p.product_id
            FROM m_product p
            WHERE p.tenant_id = ${tenantIdInt}
                AND p.deleted_at IS NULL
                AND p.is_active = 1
                AND p.product_min_stock IS NOT NULL
                AND p.product_qty >= p.product_min_stock
        `;

        const normalProductIds = productsBackToNormal.map(p => p.product_id);

        if (normalProductIds.length > 0) {
            await prisma.t_low_stock_notification.updateMany({
                where: {
                    tenant_id: tenantIdInt,
                    product_id: { in: normalProductIds },
                    is_active: true
                },
                data: {
                    is_active: false,
                    resolved_at: new Date()
                }
            });
        }

        const lowStockProducts = await prisma.$queryRaw`
            SELECT 
                p.product_id,
                p.product_name,
                p.product_sku,
                p.product_qty,
                p.product_min_stock,
                p.product_image_url,
                c.category_id,
                c.category_name,
                b.brand_id,
                b.brand_name
            FROM m_product p
            LEFT JOIN m_category c ON p.category_id = c.category_id
            LEFT JOIN m_brand b ON p.brand_id = b.brand_id
            WHERE p.tenant_id = ${tenantIdInt}
                AND p.deleted_at IS NULL
                AND p.is_active = 1
                AND p.product_min_stock IS NOT NULL
                AND p.product_qty < p.product_min_stock
            ORDER BY p.product_qty ASC, p.product_name ASC
        `;

        for (const product of lowStockProducts) {
            const existingNotification = await prisma.t_low_stock_notification.findFirst({
                where: {
                    product_id: product.product_id,
                    tenant_id: tenantIdInt,
                    is_active: true
                }
            });

            if (!existingNotification) {
                await prisma.t_low_stock_notification.create({
                    data: {
                        product_id: product.product_id,
                        tenant_id: tenantIdInt,
                        is_active: true
                    }
                });
            }
        }

        const notifications = lowStockProducts.map(product => ({
            product_id: product.product_id,
            product_name: product.product_name,
            product_sku: product.product_sku,
            product_qty: product.product_qty,
            product_min_stock: product.product_min_stock,
            product_image_url: product.product_image_url,
            category: product.category_id ? {
                category_id: product.category_id,
                category_name: product.category_name
            } : null,
            brand: product.brand_id ? {
                brand_id: product.brand_id,
                brand_name: product.brand_name
            } : null,
            severity: product.product_min_stock > 0
                ? (product.product_qty / product.product_min_stock)
                : 0
        }));

        if (notifications.length > 0) {
            const pushTokens = await getAdminPushTokens(tenantIdInt);
            if (pushTokens.length > 0) {
                const pushService = require('./pushNotification.service');
                try {
                    await pushService.sendLowStockAlert(pushTokens, notifications);
                } catch (error) {
                    console.error('Failed to send push notifications:', error);
                }
            }
        }

        return notifications;
    } catch (error) {
        throw error;
    }
};

const getAdminPushTokens = async (tenant_id) => {
    try {
        const tenantIdInt = parseInt(tenant_id);

        const adminRole = await prisma.m_role.findFirst({
            where: {
                role_code: 'ADMIN'
            }
        });

        if (!adminRole) {
            return [];
        }

        const admins = await prisma.m_user.findMany({
            where: {
                tenant_id: tenantIdInt,
                role_id: adminRole.role_id,
                is_active: true,
                deleted_at: null,
                push_token: {
                    not: null
                }
            },
            select: {
                push_token: true
            }
        });

        return admins.map(admin => admin.push_token).filter(token => token !== null);
    } catch (error) {
        console.error('Error getting admin push tokens:', error);
        return [];
    }
};

module.exports = {
    getLowStockNotifications,
    getAdminPushTokens
};
