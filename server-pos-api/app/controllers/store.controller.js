const storeService = require("../services/store.service");
const { deleteImage } = require("../middlewares/upload.middleware");

// Get store settings
const getStoreSettings = async (req, res) => {
  try {
    const store = await storeService.getStoreSettings();
    res.json({ 
      success: true, 
      message: "Store settings retrieved successfully", 
      data: store 
    });
  } catch (error) {
    console.error("Error getting store settings:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get store settings", 
      error: error.message 
    });
  }
};

// Update store settings
const updateStoreSettings = async (req, res) => {
  try {
    const store = await storeService.updateStoreSettings(req.body);
    res.json({ 
      success: true, 
      message: "Store settings updated successfully", 
      data: store 
    });
  } catch (error) {
    console.error("Error updating store settings:", error);
    res.status(400).json({ 
      success: false, 
      message: "Failed to update store settings", 
      error: error.message 
    });
  }
};

// Upload store logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No logo file uploaded" 
      });
    }

    // Get current store settings to check if there's an existing logo
    const currentStore = await storeService.getStoreSettings();
    
    // Delete old logo if exists
    if (currentStore && currentStore.logoUrl) {
      try {
        await deleteImage(currentStore.logoUrl, 'store');
      } catch (error) {
        console.warn("Warning: Could not delete old logo:", error.message);
      }
    }

    // Update store with new logo URL
    const updatedStore = await storeService.updateStoreSettings({
      logoUrl: req.file.path // Cloudinary returns the full URL in req.file.path
    });

    res.json({ 
      success: true, 
      message: "Logo uploaded successfully", 
      data: {
        logoUrl: req.file.path,
        store: updatedStore
      }
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload logo", 
      error: error.message 
    });
  }
};

// Delete store logo
const deleteLogo = async (req, res) => {
  try {
    const currentStore = await storeService.getStoreSettings();
    
    if (!currentStore || !currentStore.logoUrl) {
      return res.status(404).json({ 
        success: false, 
        message: "No logo found" 
      });
    }

    // Delete logo from Cloudinary
    try {
      await deleteImage(currentStore.logoUrl, 'store');
    } catch (error) {
      console.warn("Warning: Could not delete logo from Cloudinary:", error.message);
    }

    // Update store to remove logo URL
    const updatedStore = await storeService.updateStoreSettings({
      logoUrl: null
    });

    res.json({ 
      success: true, 
      message: "Logo deleted successfully", 
      data: updatedStore 
    });
  } catch (error) {
    console.error("Error deleting logo:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete logo", 
      error: error.message 
    });
  }
};

module.exports = {
  getStoreSettings,
  updateStoreSettings,
  uploadLogo,
  deleteLogo,
};
