const StoreService = require('../services/store.service');

class StoreController {
  static async getStoreSettings(req, res) {
    try {
      const { tenantId } = req.user;

      const storeData = await StoreService.getStoreSettings(tenantId);

      res.status(200).json({
        success: true,
        message: 'Store settings retrieved successfully',
        data: storeData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateStoreSettings(req, res) {
    try {
      const { tenantId, userId } = req.user;
      const {
        store_name,
        store_address,
        store_phone,
        store_email,
        store_description
      } = req.body;

      const updateData = {
        store_name,
        store_address,
        store_phone,
        store_email,
        store_description
      };

      const storeData = await StoreService.updateStoreSettings(tenantId, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Store settings updated successfully',
        data: storeData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async uploadStoreLogo(req, res) {
    try {
      const { tenantId, userId } = req.user;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await StoreService.uploadStoreLogo(tenantId, req.file, userId);

      res.status(200).json({
        success: true,
        message: 'Store logo uploaded successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteStoreLogo(req, res) {
    try {
      const { tenantId, userId } = req.user;

      const storeData = await StoreService.deleteStoreLogo(tenantId, userId);

      res.status(200).json({
        success: true,
        message: 'Store logo deleted successfully',
        data: storeData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = StoreController;