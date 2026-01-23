const productService = require('../services/product.service');
const { checkValidate } = require('../utils/checkValidate');
const { createProductValidation, updateProductValidation } = require('../validation/product.validation');

class ProductController {
  static async createProduct(req, res) {
    try {
      const { error, value } = checkValidate(createProductValidation, req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: error
        });
      }

      const { tenantId, userId } = req.user;

      // Handle Cloudinary image upload
      let product_image_url = value.product_image_url || null;
      if (req.file) {
        product_image_url = req.file.path; // Cloudinary URL
      }

      const productData = {
        ...value,
        product_image_url,
        brand_id: value.brand_id || value.product_brand_id || null,
        category_id: value.category_id || value.product_category_id || null,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      };
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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateProduct(req, res) {
    try {
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

      // Handle Cloudinary image upload
      let updateData = {
        ...value,
        updated_by: userId
      };

      // Map frontend field names to backend field names
      if (value.product_brand_id !== undefined) {
        updateData.brand_id = value.product_brand_id;
        delete updateData.product_brand_id;
      }
      if (value.product_category_id !== undefined) {
        updateData.category_id = value.product_category_id;
        delete updateData.product_category_id;
      }

      if (req.file) {
        updateData.product_image_url = req.file.path; // Cloudinary URL
      }
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

  static async deleteProduct(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;

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

      if (existingProduct.product_qty > 0) {
        return res.status(400).json({
          success: false,
          message: 'Produk tidak dapat dihapus karena produk ini sedang digunakan.'
        });
      }

      const product = await productService.deleteProduct(productId, userId);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: product
      });
    } catch (error) {
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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async toggleProductStatus(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;

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

  static async toggleProductSellableStatus(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;

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

  static async updateProductStock(req, res) {
    try {
      const { productId } = req.params;
      const { tenantId, userId } = req.user;
      const { stock, operation = 'set' } = req.body;

      if (!stock || isNaN(stock)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stock value'
        });
      }

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

  static async getAvailableProductsForBrand(req, res) {
    try {
      const { brandId } = req.params;
      const { tenantId } = req.user;

      const products = await productService.getAvailableProductsForBrand(
        brandId,
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Available products retrieved successfully',
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAvailableProductsForCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { tenantId } = req.user;

      const products = await productService.getAvailableProductsForCategory(
        categoryId,
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Available products retrieved successfully',
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async linkProductsToBrand(req, res) {
    try {
      const { brandId } = req.params;
      const { tenantId, userId } = req.user;
      const { product_ids } = req.body;

      if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'product_ids array is required and must not be empty'
        });
      }

      const result = await productService.linkProductsToBrand(
        brandId,
        product_ids,
        userId
      );

      res.status(200).json({
        success: true,
        message: `${result.count} product(s) linked to brand successfully`,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async linkProductsToCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { tenantId, userId } = req.user;
      const { product_ids } = req.body;

      if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'product_ids array is required and must not be empty'
        });
      }

      const result = await productService.linkProductsToCategory(
        categoryId,
        product_ids,
        userId
      );

      res.status(200).json({
        success: true,
        message: `${result.count} product(s) linked to category successfully`,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ProductController;