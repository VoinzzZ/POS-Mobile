const productService = require('../services/product.service');
const { checkValidate } = require('../utils/checkValidate');
const { createProductValidation, updateProductValidation } = require('../validation/product.validation');

class ProductController {
  /**
   * Create a new product
   */
  static async createProduct(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(createProductValidation, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const { tenantId, userId } = req.user;
      const productData = {
        ...value,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      };

      // Check if product SKU already exists for the same tenant
      if (productData.product_sku) {
        const existingProduct = await productService.getProductBySku(
          productData.product_sku,
          productData.tenant_id
        );

        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: 'Product SKU already exists for this tenant'
          });
        }
      }

      const product = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(req, res) {
    try {
      const { tenantId } = req.user;
      const {
        brand_id,
        category_id,
        is_active,
        is_sellable,
        search,
        min_price,
        max_price,
        low_stock,
        page,
        limit,
        sort_by,
        sort_order,
        cursor,
        cursor_direction
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(brand_id && { brand_id }),
        ...(category_id && { category_id }),
        ...(is_active !== undefined && { is_active }),
        ...(is_sellable !== undefined && { is_sellable }),
        ...(search && { search }),
        ...(min_price && { min_price }),
        ...(max_price && { max_price }),
        ...(low_stock && { low_stock }),
        ...(page && { page }),
        ...(limit && { limit }),
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order }),
        ...(cursor && { cursor }),
        ...(cursor_direction && { cursor_direction })
      };

      const result = await productService.getProducts(filters);

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get products with infinite scroll (optimized for frontend)
   */
  static async getProductsInfinite(req, res) {
    try {
      const { tenantId } = req.user;
      const {
        brand_id,
        category_id,
        is_active,
        is_sellable,
        search,
        min_price,
        max_price,
        low_stock,
        cursor,
        limit,
        sort_by,
        sort_order
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(brand_id && { brand_id }),
        ...(category_id && { category_id }),
        ...(is_active !== undefined && { is_active }),
        ...(is_sellable !== undefined && { is_sellable }),
        ...(search && { search }),
        ...(min_price && { min_price }),
        ...(max_price && { max_price }),
        ...(low_stock && { low_stock }),
        ...(cursor && { cursor }),
        ...(limit && { limit }),
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order })
      };

      const result = await productService.getProductsInfinite(filters);

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Get products infinite error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search products with infinite scroll
   */
  static async searchProductsInfinite(req, res) {
    try {
      const { tenantId } = req.user;
      const { q: searchTerm } = req.query;

      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const {
        cursor,
        limit,
        sort_by,
        sort_order
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(cursor && { cursor }),
        ...(limit && { limit }),
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order })
      };

      const result = await productService.searchProductsInfinite(searchTerm.trim(), filters);

      res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Search products infinite error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get products optimized for mobile (20 items per request)
   */
  static async getProductsMobile(req, res) {
    try {
      const { tenantId } = req.user;
      const {
        brand_id,
        category_id,
        is_active,
        is_sellable,
        search,
        min_price,
        max_price,
        low_stock,
        cursor,
        limit,
        sort_by,
        sort_order
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(brand_id && { brand_id }),
        ...(category_id && { category_id }),
        ...(is_active !== undefined && { is_active }),
        ...(is_sellable !== undefined && { is_sellable }),
        ...(search && { search }),
        ...(min_price && { min_price }),
        ...(max_price && { max_price }),
        ...(low_stock && { low_stock }),
        ...(cursor && { cursor }),
        ...(limit && { limit }),
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order })
      };

      const result = await productService.getProductsMobile(filters);

      res.status(200).json({
        success: true,
        message: 'Mobile products retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Get mobile products error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search products optimized for mobile (20 items per request)
   */
  static async searchProductsMobile(req, res) {
    try {
      const { tenantId } = req.user;
      const { q: searchTerm } = req.query;

      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const {
        cursor,
        limit,
        sort_by,
        sort_order
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(cursor && { cursor }),
        ...(limit && { limit }),
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order })
      };

      const result = await productService.searchProductsMobile(searchTerm.trim(), filters);

      res.status(200).json({
        success: true,
        message: 'Mobile search results retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Search mobile products error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Quick load products for mobile - minimal data only
   */
  static async getProductsQuickLoad(req, res) {
    try {
      const { tenantId } = req.user;
      const {
        cursor,
        limit
      } = req.query;

      const filters = {
        tenant_id: tenantId,
        ...(cursor && { cursor }),
        ...(limit && { limit })
      };

      const result = await productService.getProductsQuickLoad(filters);

      res.status(200).json({
        success: true,
        message: 'Quick load products retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Quick load products error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId } = req.user;

      const product = await productService.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if product belongs to the user's tenant
      if (product.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update product
   */
  static async updateProduct(req, res) {
    try {
      // Validasi input
      const { error, value } = checkValidate(updateProductValidation, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const { productId } = req.params;
      const { tenantId, userId } = req.user;
      const updateData = {
        ...value,
        updated_by: userId
      };

      // Check if product exists and belongs to tenant
      const existingProduct = await productService.getProductById(productId, false);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if product SKU already exists (if updating SKU)
      if (updateData.product_sku && updateData.product_sku !== existingProduct.product_sku) {
        const duplicateProduct = await productService.getProductBySku(
          updateData.product_sku,
          tenantId
        );

        if (duplicateProduct && duplicateProduct.product_id !== parseInt(productId)) {
          return res.status(400).json({
            success: false,
            message: 'Product SKU already exists for this tenant'
          });
        }
      }

      const product = await productService.updateProduct(productId, updateData);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);

      if (error.message === 'Product not found') {
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
   * Delete product (soft delete)
   */
  static async deleteProduct(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;

      // Check if product exists and belongs to tenant
      const existingProduct = await productService.getProductById(productId, false);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const product = await productService.deleteProduct(productId, userId);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: product
      });
    } catch (error) {
      console.error('Delete product error:', error);

      if (error.message === 'Product not found') {
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
   * Get products by category
   */
  static async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { tenantId } = req.user;
      const { isActiveOnly = true, isSellableOnly = true } = req.query;

      const products = await productService.getProductsByCategory(
        categoryId,
        tenantId,
        isActiveOnly === 'false' ? false : true,
        isSellableOnly === 'false' ? false : true
      );

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: products
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get products by brand
   */
  static async getProductsByBrand(req, res) {
    try {
      const { brandId } = req.params;
      const { tenantId } = req.user;
      const { isActiveOnly = true, isSellableOnly = true } = req.query;

      const products = await productService.getProductsByBrand(
        brandId,
        tenantId,
        isActiveOnly === 'false' ? false : true,
        isSellableOnly === 'false' ? false : true
      );

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: products
      });
    } catch (error) {
      console.error('Get products by brand error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Toggle product status (active/inactive)
   */
  static async toggleProductStatus(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;

      // Check if product exists and belongs to tenant
      const existingProduct = await productService.getProductById(productId, false);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const product = await productService.toggleProductStatus(productId, userId);

      res.status(200).json({
        success: true,
        message: `Product ${product.is_active ? 'activated' : 'deactivated'} successfully`,
        data: product
      });
    } catch (error) {
      console.error('Toggle product status error:', error);

      if (error.message === 'Product not found') {
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
   * Toggle product sellable status
   */
  static async toggleProductSellableStatus(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;

      // Check if product exists and belongs to tenant
      const existingProduct = await productService.getProductById(productId, false);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const product = await productService.toggleProductSellableStatus(productId, userId);

      res.status(200).json({
        success: true,
        message: `Product ${product.is_sellable ? 'marked as sellable' : 'marked as not sellable'} successfully`,
        data: product
      });
    } catch (error) {
      console.error('Toggle product sellable status error:', error);

      if (error.message === 'Product not found') {
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
   * Update product stock
   */
  static async updateProductStock(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;
      const { stock, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

      if (!stock || isNaN(stock)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stock value'
        });
      }

      // Check if product exists and belongs to tenant
      const existingProduct = await productService.getProductById(productId, false);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.tenant_id !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const product = await productService.updateProductStock(productId, stock, operation, userId);

      res.status(200).json({
        success: true,
        message: 'Product stock updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update product stock error:', error);

      if (error.message === 'Product not found') {
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

module.exports = ProductController;