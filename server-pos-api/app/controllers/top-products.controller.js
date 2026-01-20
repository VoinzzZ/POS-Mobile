const TopProductsService = require('../services/top-products.service');

class TopProductsController {
    /**
     * Get top selling products
     * @route GET /api/dashboard/top-products
     */
    static async getTopProducts(req, res) {
        try {
            const { tenantId } = req.user;
            const limit = parseInt(req.query.limit) || 5;

            const topProducts = await TopProductsService.getTodayTopProducts(limit, tenantId);

            res.status(200).json({
                success: true,
                message: 'Top products retrieved successfully',
                data: {
                    topProducts
                }
            });
        } catch (error) {
            console.error('Error in getTopProducts controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get top products'
            });
        }
    }
}

module.exports = TopProductsController;
