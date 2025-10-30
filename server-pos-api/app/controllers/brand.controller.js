const brandService = require('../services/brand.service');
const { checkValidate } = require('../utils/checkValidate');
const { createBrandValidation, updateBrandValidation } = require('../validation/brand.validation');

class BrandController {
  /**
   * Create a new brand
   */
  static async createBrand(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(createBrandValidation, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const { tenantId, userId } = req.user;
      const brandData = {
        ...value,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      };

      // Check if brand name already exists for the same tenant
      const existingBrand = await brandService.getBrandByName(
        brandData.brand_name,
        brandData.tenant_id
      );

      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'Brand name already exists for this tenant'
        });
      }

      const brand = await brandService.createBrand(brandData);

      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: brand
      });
    } catch (error) {
      console.error('Create brand error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all brands with filtering
   */
  static async getBrands(req, res) {
    try {
      const { tenantId } = req.user;
      const {
        is_active,
        search
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(is_active !== undefined && { is_active }),
        ...(search && { search })
      };

      const brands = await brandService.getBrands(filters);

      res.status(200).json({
        success: true,
        message: 'Brands retrieved successfully',
        data: brands
      });
    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(req, res) {
    try {
      const { brandId } = req.params;
      const { tenantId } = req.user;

      const brand = await brandService.getBrandById(brandId);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      // Check if brand belongs to the user's tenant
      if (brand.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Brand retrieved successfully',
        data: brand
      });
    } catch (error) {
      console.error('Get brand by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update brand
   */
  static async updateBrand(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(updateBrandValidation, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const { brandId } = req.params;
      const { tenantId, userId } = req.user;
      const updateData = {
        ...value,
        updated_by: userId
      };

      // Check if brand exists and belongs to tenant
      const existingBrand = await brandService.getBrandById(brandId, false);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      if (existingBrand.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if brand name already exists (if updating name)
      if (updateData.brand_name && updateData.brand_name !== existingBrand.brand_name) {
        const duplicateBrand = await brandService.getBrandByName(
          updateData.brand_name,
          tenantId
        );

        if (duplicateBrand && duplicateBrand.brand_id !== parseInt(brandId)) {
          return res.status(400).json({
            success: false,
            message: 'Brand name already exists for this tenant'
          });
        }
      }

      const brand = await brandService.updateBrand(brandId, updateData);

      res.status(200).json({
        success: true,
        message: 'Brand updated successfully',
        data: brand
      });
    } catch (error) {
      console.error('Update brand error:', error);

      if (error.message === 'Brand not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete brand (soft delete)
   */
  static async deleteBrand(req, res) {
    try {
      const { brandId } = req.params;
      const { tenantId, userId } = req.user;

      // Check if brand exists and belongs to tenant
      const existingBrand = await brandService.getBrandById(brandId, false);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      if (existingBrand.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const brand = await brandService.deleteBrand(brandId, userId);

      res.status(200).json({
        success: true,
        message: 'Brand deleted successfully',
        data: brand
      });
    } catch (error) {
      console.error('Delete brand error:', error);

      if (error.message === 'Brand not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Cannot delete brand that has associated')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Toggle brand status (active/inactive)
   */
  static async toggleBrandStatus(req, res) {
    try {
      const { brandId } = req.params;
      const { tenantId, userId } = req.user;

      // Check if brand exists and belongs to tenant
      const existingBrand = await brandService.getBrandById(brandId, false);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      if (existingBrand.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const brand = await brandService.toggleBrandStatus(brandId, userId);

      res.status(200).json({
        success: true,
        message: `Brand ${brand.is_active ? 'activated' : 'deactivated'} successfully`,
        data: brand
      });
    } catch (error) {
      console.error('Toggle brand status error:', error);

      if (error.message === 'Brand not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = BrandController;