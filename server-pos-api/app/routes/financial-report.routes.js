const express = require('express');
const router = express.Router();
const FinancialReportController = require('../controllers/financial-report.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.get('/summary',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    FinancialReportController.getFinancialSummary
);

router.get('/revenue',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    FinancialReportController.getRevenueReport
);

router.get('/employee-performance',
    verifyToken,
    requireRole(['OWNER', 'ADMIN']),
    FinancialReportController.getEmployeePerformance
);

module.exports = router;
