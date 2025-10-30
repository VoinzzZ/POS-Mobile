const categoryService = require('../services/category.service');
const { checkValidate } = require('../utils/checkValidate');
const { createCategoryValidation, updateCategoryValidation } = require('../validation/category.validation');

class CategoryController {
  /**
   * Create a new category
   */
  static async createCategory(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(createCategoryValidation, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const { tenantId, userId } = req.user;
      const categoryData = {
        ...value,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      };

      // Check if category name already exists for the same brand and tenant
      const existingCategory = await categoryService.getCategoryByName(
        categoryData.category_name,
        categoryData.tenant_id,
        categoryData.brand_id
      );

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists for this brand'
        });
      }

      const category = await categoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all categories with filtering
   */
  static async getCategories(req, res) {
    try {
      const { tenantId } = req.user;
      const {
        brand_id,
        is_active,
        search
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(brand_id && { brand_id }),
        ...(is_active !== undefined && { is_active }),
        ...(search && { search })
      };

      const categories = await categoryService.getCategories(filters);

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(req, res) {
    try {
      const { categoryId } = req.params;
      const { tenantId } = req.user;

      const category = await categoryService.getCategoryById(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if category belongs to the user's tenant
      if (category.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update category
   */
  static async updateCategory(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(updateCategoryValidation, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const { categoryId } = req.params;
      const { tenantId, userId } = req.user;
      const updateData = {
        ...value,
        updated_by: userId
      };

      // Check if category exists and belongs to tenant
      const existingCategory = await categoryService.getCategoryById(categoryId, false);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (existingCategory.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if category name already exists (if updating name)
      if (updateData.category_name && updateData.category_name !== existingCategory.category_name) {
        const duplicateCategory = await categoryService.getCategoryByName(
          updateData.category_name,
          tenantId,
          updateData.brand_id || existingCategory.brand_id
        );

        if (duplicateCategory && duplicateCategory.category_id !== parseInt(categoryId)) {
          return res.status(400).json({
            success: false,
            message: 'Category name already exists for this brand'
          });
        }
      }

      const category = await categoryService.updateCategory(categoryId, updateData);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);

      if (error.message === 'Category not found') {
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
   * Delete category (soft delete)
   */
  static async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { tenantId, userId } = req.user;

      // Check if category exists and belongs to tenant
      const existingCategory = await categoryService.getCategoryById(categoryId, false);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (existingCategory.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const category = await categoryService.deleteCategory(categoryId, userId);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        data: category
      });
    } catch (error) {
      console.error('Delete category error:', error);

      if (error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Cannot delete category that has associated products')) {
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
   * Get categories by brand
   */
  static async getCategoriesByBrand(req, res) {
    try {
      const { brandId } = req.params;
      const { tenantId } = req.user;
      const { isActiveOnly = true } = req.query;

      const categories = await categoryService.getCategoriesByBrand(
        brandId,
        tenantId,
        isActiveOnly === 'false' ? false : true
      );

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Get categories by brand error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Toggle category status (active/inactive)
   */
  static async toggleCategoryStatus(req, res) {
    try {
      const { categoryId } = req.params;
      const { tenantId, userId } = req.user;

      // Check if category exists and belongs to tenant
      const existingCategory = await categoryService.getCategoryById(categoryId, false);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (existingCategory.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const category = await categoryService.toggleCategoryStatus(categoryId, userId);

      res.status(200).json({
        success: true,
        message: `Category ${category.is_active ? 'activated' : 'deactivated'} successfully`,
        data: category
      });
    } catch (error) {
      console.error('Toggle category status error:', error);

      if (error.message === 'Category not found') {
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

module.exports = CategoryController;