const express = require('express');
const AuthMiddleware = require('../middlewares/auth.middleware');
const brandController = require('../controllers/brand.controller');

const router = express.Router();

router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.requireCashierOrAdmin, brandController.getAllBrands);
router.get('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireCashierOrAdmin, brandController.getBrandById);
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, brandController.createBrand);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, brandController.updateBrand);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, brandController.deleteBrand);

module.exports = router;