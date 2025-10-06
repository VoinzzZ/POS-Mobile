const express = require("express");
const storeController = require("../controllers/store.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadStoreLogo, handleMulterError } = require("../middlewares/upload.middleware");

const router = express.Router();

// Get store settings (public - needed for receipts)
router.get(
  "/",
  storeController.getStoreSettings
);

// Update store settings (admin only)
router.put(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  storeController.updateStoreSettings
);

// Upload store logo (admin only)
router.post(
  "/logo",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  uploadStoreLogo.single('logo'),
  handleMulterError,
  storeController.uploadLogo
);

// Delete store logo (admin only)
router.delete(
  "/logo",
  authMiddleware.verifyToken,
  authMiddleware.requireAdmin,
  storeController.deleteLogo
);

module.exports = router;
