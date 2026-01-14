const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/store.controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRole } = require('../middlewares/verifyRole');
const { uploadStoreLogo, handleMulterError } = require('../middlewares/upload.middleware');

// Get store settings
router.get(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN', 'CASHIER']),
  StoreController.getStoreSettings
);

// Update store settings
router.put(
  '/',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  StoreController.updateStoreSettings
);

// Upload store logo
router.post(
  '/logo',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  uploadStoreLogo.single('logo'),
  handleMulterError,
  StoreController.uploadStoreLogo
);

// Delete store logo
router.delete(
  '/logo',
  verifyToken,
  requireRole(['OWNER', 'ADMIN']),
  StoreController.deleteStoreLogo
);

module.exports = router;