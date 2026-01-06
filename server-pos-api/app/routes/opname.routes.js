const express = require('express');
const router = express.Router();
const OpnameController = require('../controllers/opname.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');

router.post('/',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    OpnameController.createStockOpname
);

router.post('/bulk',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    OpnameController.bulkCreateStockOpname
);

router.get('/',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    OpnameController.getStockOpnames
);

router.post('/:opnameId/process',
    verifyToken,
    requireRole(['ADMIN', 'OWNER']),
    OpnameController.processStockOpname
);

module.exports = router;
