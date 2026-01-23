const FinancialReportService = require('../services/financial-report.service');

class FinancialReportController {
    static async getFinancialSummary(req, res) {
        try {
            const { tenantId } = req.user;
            const { start_date, end_date } = req.query;

            const filters = {};
            if (start_date) filters.startDate = start_date;
            if (end_date) filters.endDate = end_date;

            const summary = await FinancialReportService.getFinancialSummary(tenantId, filters);

            res.status(200).json({
                success: true,
                message: 'Financial summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            console.error('Error in getFinancialSummary:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getRevenueReport(req, res) {
        try {
            const { tenantId } = req.user;
            const { start_date, end_date, group_by = 'day' } = req.query;

            const filters = {
                groupBy: group_by
            };
            if (start_date) filters.startDate = start_date;
            if (end_date) filters.endDate = end_date;

            const report = await FinancialReportService.getRevenueReport(tenantId, filters);

            // Prevent caching to ensure fresh data
            res.set({
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
                'Pragma': 'no-cache',
                'Expires': '0'
            });

            res.status(200).json({
                success: true,
                message: 'Revenue report retrieved successfully',
                data: report
            });
        } catch (error) {
            console.error('Error in getRevenueReport:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getEmployeePerformance(req, res) {
        try {
            const { tenantId } = req.user;
            const { start_date, end_date, limit } = req.query;

            const filters = {};
            if (start_date) filters.startDate = start_date;
            if (end_date) filters.endDate = end_date;
            if (limit) filters.limit = parseInt(limit);

            const performance = await FinancialReportService.getEmployeePerformance(tenantId, filters);

            res.status(200).json({
                success: true,
                message: 'Employee performance retrieved successfully',
                data: performance
            });
        } catch (error) {
            console.error('Error in getEmployeePerformance:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = FinancialReportController;
