const expenseCategoryService = require('../services/expense-category.service');

class ExpenseCategoryController {
    static async createCategory(req, res) {
        try {
            const { tenantId, userId } = req.user;
            const categoryData = {
                ...req.body,
                tenant_id: tenantId,
                created_by: userId,
                updated_by: userId
            };

            const existingCategory = await expenseCategoryService.getCategoryByCode(
                categoryData.category_code,
                tenantId
            );

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category code already exists'
                });
            }

            const category = await expenseCategoryService.createCategory(categoryData);

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getCategories(req, res) {
        try {
            const { tenantId } = req.user;
            const filters = {
                tenant_id: tenantId,
                ...req.query
            };

            const categories = await expenseCategoryService.getCategories(filters);

            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getCategoryById(req, res) {
        try {
            const { categoryId } = req.params;
            const { tenantId } = req.user;

            const category = await expenseCategoryService.getCategoryById(categoryId);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            if (category.tenant_id && category.tenant_id !== tenantId) {
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
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async updateCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { tenantId, userId } = req.user;
            const updateData = {
                ...req.body,
                updated_by: userId
            };

            const existingCategory = await expenseCategoryService.getCategoryById(categoryId);

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            if (existingCategory.tenant_id && existingCategory.tenant_id !== tenantId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const category = await expenseCategoryService.updateCategory(categoryId, updateData);

            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: category
            });
        } catch (error) {
            if (error.message === 'Category not found' || error.message === 'Cannot update system category') {
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

    static async deleteCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { tenantId } = req.user;

            const existingCategory = await expenseCategoryService.getCategoryById(categoryId);

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            if (existingCategory.tenant_id && existingCategory.tenant_id !== tenantId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await expenseCategoryService.deleteCategory(categoryId);

            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            if (error.message.includes('Cannot delete')) {
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

    static async seedDefaultCategories(req, res) {
        try {
            const { tenantId, userId } = req.user;

            const result = await expenseCategoryService.seedDefaultCategories(null, userId);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data || { count: result.count }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ExpenseCategoryController;
