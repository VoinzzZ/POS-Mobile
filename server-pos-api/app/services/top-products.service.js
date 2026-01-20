const prisma = require('../config/mysql.db.js');

class TopProductsService {
    /**
     * Get top selling products for a specific date
     * @param {Date} startDate - Start of date range
     * @param {Date} endDate - End of date range
     * @param {number} limit - Number of top products to return
     * @returns {Promise<Array>} Top selling products with quantity and revenue
     */
    static async getTopProducts(startDate, endDate, limit = 5) {
        try {
            // Get top products by aggregating transaction items
            const topProducts = await prisma.$queryRaw`
        SELECT 
          p.product_id,
          p.product_name,
          p.product_image_url,
          SUM(ti.transaction_item_quantity) as total_quantity,
          SUM(ti.transaction_item_subtotal) as total_revenue
        FROM t_transaction_item ti
        INNER JOIN t_transaction t ON ti.transaction_id = t.transaction_id
        INNER JOIN m_product p ON ti.transaction_item_product_id = p.product_id
        WHERE t.transaction_status = 'COMPLETED'
          AND t.transaction_created_at >= ${startDate}
          AND t.transaction_created_at < ${endDate}
          AND t.deleted_at IS NULL
          AND p.deleted_at IS NULL
        GROUP BY p.product_id, p.product_name, p.product_image_url
        ORDER BY total_quantity DESC
        LIMIT ${limit}
      `;

            // Convert BigInt to Number for JSON serialization
            return topProducts.map(product => ({
                product_id: Number(product.product_id),
                product_name: product.product_name,
                product_image_url: product.product_image_url,
                total_quantity: Number(product.total_quantity),
                total_revenue: Number(product.total_revenue)
            }));
        } catch (error) {
            console.error('Error fetching top products:', error);
            throw new Error('Failed to fetch top products');
        }
    }

    /**
     * Get top selling products for today
     * @param {number} limit - Number of top products to return
     * @param {number} tenantId - Tenant ID for filtering
     * @returns {Promise<Array>} Top selling products
     */
    static async getTodayTopProducts(limit = 5, tenantId) {
        // Get today's date range
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        return await this.getTopProducts(startOfDay, endOfDay, limit);
    }
}

module.exports = TopProductsService;
