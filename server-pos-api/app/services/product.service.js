const prisma = require('../config/mysql.db.js');

const createProduct = async (productData) => {
  try {
    const product = await prisma.m_product.create({
      data: {
        product_name: productData.product_name,
        product_description: productData.product_description || null,
        product_sku: productData.product_sku || null,
        brand_id: productData.brand_id,
        category_id: productData.category_id,
        tenant_id: productData.tenant_id,
        product_price: productData.product_price,
        product_cost: productData.product_cost || null,
        product_stock: productData.product_stock || 0,
        product_min_stock: productData.product_min_stock || 5,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        is_track_stock: productData.is_track_stock !== undefined ? productData.is_track_stock : true,
        is_sellable: productData.is_sellable !== undefined ? productData.is_sellable : true,
        created_by: productData.created_by || null,
        updated_by: productData.updated_by || null
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        },
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      }
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

const getProducts = async (filters = {}) => {
  try {
    const {
      tenant_id,
      brand_id,
      category_id,
      is_active,
      is_sellable,
      search,
      min_price,
      max_price,
      low_stock,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
      cursor,
      cursor_direction = 'forward'
    } = filters;

    const where = {};

    if (tenant_id) where.tenant_id = parseInt(tenant_id);
    if (brand_id) where.brand_id = parseInt(brand_id);
    if (category_id) where.category_id = parseInt(category_id);
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;
    if (is_sellable !== undefined) where.is_sellable = is_sellable === 'true' || is_sellable === true;

    if (search) {
      where.OR = [
        { product_name: { contains: search } },
        { product_description: { contains: search } },
        { product_sku: { contains: search } }
      ];
    }

    if (min_price || max_price) {
      where.product_price = {};
      if (min_price) where.product_price.gte = parseFloat(min_price);
      if (max_price) where.product_price.lte = parseFloat(max_price);
    }

    if (low_stock === 'true' || low_stock === true) {
      where.product_stock = {
        lte: prisma.m_product.fields.product_min_stock
      };
    }

    // Handle cursor-based pagination for infinite scroll
    let orderBy = {};
    let skip = undefined;
    let cursorCondition = undefined;

    if (cursor) {
      // Cursor-based pagination for infinite scroll
      const sortField = sort_by === 'created_at' ? 'created_at' :
                       sort_by === 'product_name' ? 'product_name' :
                       sort_by === 'product_price' ? 'product_price' :
                       sort_by === 'product_stock' ? 'product_stock' : 'created_at';

      orderBy[sortField] = sort_order === 'asc' ? 'asc' : 'desc';

      // Add secondary sort for consistent ordering
      if (sortField !== 'product_id') {
        orderBy.product_id = 'desc';
      }

      cursorCondition = {
        [sortField]: cursor_direction === 'backward' ?
          { lt: cursor } : { gt: cursor }
      };

      if (cursor_direction === 'backward') {
        // For backward pagination, we need to reverse the order and limit
        orderBy = Object.keys(orderBy).reduce((acc, key) => {
          acc[key] = orderBy[key] === 'asc' ? 'desc' : 'asc';
          return acc;
        }, {});
      }
    } else {
      // Regular offset-based pagination
      const sortField = sort_by === 'created_at' ? 'created_at' :
                       sort_by === 'product_name' ? 'product_name' :
                       sort_by === 'product_price' ? 'product_price' :
                       sort_by === 'product_stock' ? 'product_stock' : 'created_at';

      orderBy[sortField] = sort_order === 'asc' ? 'asc' : 'desc';

      // Add secondary sort for consistent ordering
      if (sortField !== 'product_id') {
        orderBy.product_id = 'desc';
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      skip = offset;
    }

    const products = await prisma.m_product.findMany({
      where: {
        ...where,
        ...cursorCondition
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        },
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      },
      orderBy,
      take: cursor ? parseInt(limit) + 1 : parseInt(limit),
      skip
    });

    // Handle backward pagination result reversal
    let finalProducts = products;
    if (cursor && cursor_direction === 'backward') {
      finalProducts = products.reverse();
    }

    // Get total count for pagination metadata
    const totalCount = await prisma.m_product.count({
      where
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = cursor ?
      finalProducts.length > parseInt(limit) :
      currentPage < totalPages;
    const hasPreviousPage = cursor ? true : currentPage > 1;

    // Remove the extra item if exists (for cursor pagination)
    if (cursor && finalProducts.length > parseInt(limit)) {
      finalProducts = finalProducts.slice(0, parseInt(limit));
    }

    // Generate next and previous cursors
    const nextCursor = hasNextPage && finalProducts.length > 0 ?
      finalProducts[finalProducts.length - 1][sort_by === 'created_at' ? 'created_at' :
                                             sort_by === 'product_name' ? 'product_name' :
                                             sort_by === 'product_price' ? 'product_price' :
                                             sort_by === 'product_stock' ? 'product_stock' : 'created_at'] : null;

    const previousCursor = hasPreviousPage && finalProducts.length > 0 ?
      finalProducts[0][sort_by === 'created_at' ? 'created_at' :
                         sort_by === 'product_name' ? 'product_name' :
                         sort_by === 'product_price' ? 'product_price' :
                         sort_by === 'product_stock' ? 'product_stock' : 'created_at'] : null;

    return {
      data: finalProducts,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPreviousPage,
        nextCursor,
        previousCursor,
        sort_by,
        sort_order
      }
    };
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

const getProductById = async (product_id, includeRelations = true) => {
  try {
    const product = await prisma.m_product.findUnique({
      where: {
        product_id: parseInt(product_id)
      },
      include: includeRelations ? {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true,
            brand_description: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true,
            category_description: true
          }
        },
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      } : undefined
    });
    return product;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    throw error;
  }
};

const updateProduct = async (product_id, updateData) => {
  try {
    const existingProduct = await prisma.m_product.findUnique({
      where: { product_id: parseInt(product_id) }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const product = await prisma.m_product.update({
      where: {
        product_id: parseInt(product_id)
      },
      data: {
        ...(updateData.product_name && { product_name: updateData.product_name }),
        ...(updateData.product_description !== undefined && { product_description: updateData.product_description }),
        ...(updateData.product_sku !== undefined && { product_sku: updateData.product_sku }),
        ...(updateData.brand_id && { brand_id: updateData.brand_id }),
        ...(updateData.category_id && { category_id: updateData.category_id }),
        ...(updateData.product_price && { product_price: updateData.product_price }),
        ...(updateData.product_cost !== undefined && { product_cost: updateData.product_cost }),
        ...(updateData.product_stock !== undefined && { product_stock: updateData.product_stock }),
        ...(updateData.product_min_stock !== undefined && { product_min_stock: updateData.product_min_stock }),
        ...(updateData.is_active !== undefined && { is_active: updateData.is_active }),
        ...(updateData.is_track_stock !== undefined && { is_track_stock: updateData.is_track_stock }),
        ...(updateData.is_sellable !== undefined && { is_sellable: updateData.is_sellable }),
        ...(updateData.updated_by && { updated_by: updateData.updated_by }),
        updated_at: new Date()
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        },
        m_tenant: {
          select: {
            tenant_id: true,
            tenant_name: true
          }
        }
      }
    });
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

const deleteProduct = async (product_id, deleted_by = null) => {
  try {
    const existingProduct = await prisma.m_product.findUnique({
      where: { product_id: parseInt(product_id) }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const product = await prisma.m_product.update({
      where: {
        product_id: parseInt(product_id)
      },
      data: {
        deleted_by,
        deleted_at: new Date(),
        is_active: false,
        is_sellable: false
      }
    });
    return product;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

const getProductBySku = async (product_sku, tenant_id) => {
  try {
    const product = await prisma.m_product.findFirst({
      where: {
        product_sku: product_sku.trim(),
        tenant_id: parseInt(tenant_id),
        deleted_at: null
      }
    });
    return product;
  } catch (error) {
    console.error('Error getting product by SKU:', error);
    throw error;
  }
};

const getProductsByCategory = async (category_id, tenant_id, isActiveOnly = true, isSellableOnly = true) => {
  try {
    const where = {
      category_id: parseInt(category_id),
      tenant_id: parseInt(tenant_id),
      ...(isActiveOnly && { is_active: true }),
      ...(isSellableOnly && { is_sellable: true })
    };

    const products = await prisma.m_product.findMany({
      where,
      select: {
        product_id: true,
        product_name: true,
        product_description: true,
        product_sku: true,
        product_price: true,
        product_stock: true,
        product_min_stock: true,
        is_active: true,
        is_sellable: true,
        is_track_stock: true,
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        }
      },
      orderBy: {
        product_name: 'asc'
      }
    });
    return products;
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw error;
  }
};

const getProductsByBrand = async (brand_id, tenant_id, isActiveOnly = true, isSellableOnly = true) => {
  try {
    const where = {
      brand_id: parseInt(brand_id),
      tenant_id: parseInt(tenant_id),
      ...(isActiveOnly && { is_active: true }),
      ...(isSellableOnly && { is_sellable: true })
    };

    const products = await prisma.m_product.findMany({
      where,
      select: {
        product_id: true,
        product_name: true,
        product_description: true,
        product_sku: true,
        product_price: true,
        product_stock: true,
        product_min_stock: true,
        is_active: true,
        is_sellable: true,
        is_track_stock: true,
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      },
      orderBy: {
        product_name: 'asc'
      }
    });
    return products;
  } catch (error) {
    console.error('Error getting products by brand:', error);
    throw error;
  }
};

const toggleProductStatus = async (product_id, updated_by = null) => {
  try {
    const existingProduct = await prisma.m_product.findUnique({
      where: { product_id: parseInt(product_id) }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const product = await prisma.m_product.update({
      where: {
        product_id: parseInt(product_id)
      },
      data: {
        is_active: !existingProduct.is_active,
        updated_by,
        updated_at: new Date()
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      }
    });
    return product;
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error;
  }
};

const toggleProductSellableStatus = async (product_id, updated_by = null) => {
  try {
    const existingProduct = await prisma.m_product.findUnique({
      where: { product_id: parseInt(product_id) }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const product = await prisma.m_product.update({
      where: {
        product_id: parseInt(product_id)
      },
      data: {
        is_sellable: !existingProduct.is_sellable,
        updated_by,
        updated_at: new Date()
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      }
    });
    return product;
  } catch (error) {
    console.error('Error toggling product sellable status:', error);
    throw error;
  }
};

const updateProductStock = async (product_id, stock, operation = 'set', updated_by = null) => {
  try {
    const existingProduct = await prisma.m_product.findUnique({
      where: { product_id: parseInt(product_id) }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    let newStock;
    switch (operation) {
      case 'add':
        newStock = existingProduct.product_stock + parseInt(stock);
        break;
      case 'subtract':
        newStock = existingProduct.product_stock - parseInt(stock);
        if (newStock < 0) newStock = 0;
        break;
      case 'set':
      default:
        newStock = parseInt(stock);
        break;
    }

    const product = await prisma.m_product.update({
      where: {
        product_id: parseInt(product_id)
      },
      data: {
        product_stock: newStock,
        updated_by,
        updated_at: new Date()
      },
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      }
    });
    return product;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

// Additional function for optimized infinite scroll
const getProductsInfinite = async (filters = {}) => {
  try {
    const {
      tenant_id,
      brand_id,
      category_id,
      is_active,
      is_sellable,
      search,
      min_price,
      max_price,
      low_stock,
      cursor,
      limit = 20, // Mobile-optimized: load 20 items per request
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    const where = {};

    if (tenant_id) where.tenant_id = parseInt(tenant_id);
    if (brand_id) where.brand_id = parseInt(brand_id);
    if (category_id) where.category_id = parseInt(category_id);
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;
    if (is_sellable !== undefined) where.is_sellable = is_sellable === 'true' || is_sellable === true;

    if (search) {
      where.OR = [
        { product_name: { contains: search } },
        { product_description: { contains: search } },
        { product_sku: { contains: search } }
      ];
    }

    if (min_price || max_price) {
      where.product_price = {};
      if (min_price) where.product_price.gte = parseFloat(min_price);
      if (max_price) where.product_price.lte = parseFloat(max_price);
    }

    if (low_stock === 'true' || low_stock === true) {
      where.product_stock = {
        lte: prisma.m_product.fields.product_min_stock
      };
    }

    const sortField = sort_by === 'created_at' ? 'created_at' :
                     sort_by === 'product_name' ? 'product_name' :
                     sort_by === 'product_price' ? 'product_price' :
                     sort_by === 'product_stock' ? 'product_stock' : 'created_at';

    const orderBy = {};
    orderBy[sortField] = sort_order === 'asc' ? 'asc' : 'desc';

    // Add secondary sort for consistent ordering
    if (sortField !== 'product_id') {
      orderBy.product_id = 'desc';
    }

    const cursorOptions = {};
    if (cursor) {
      cursorOptions.cursor = {
        [sortField]: cursor
      };
      cursorOptions.skip = 1; // Skip the cursor item
    }

    const products = await prisma.m_product.findMany({
      where,
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      },
      orderBy,
      take: parseInt(limit) + 1, // +1 to check if there are more items
      ...cursorOptions
    });

    const hasMore = products.length > parseInt(limit);
    const finalProducts = hasMore ? products.slice(0, -1) : products;

    // Generate next cursor
    const nextCursor = hasMore && finalProducts.length > 0 ?
      finalProducts[finalProducts.length - 1][sortField] : null;

    return {
      data: finalProducts,
      hasMore,
      nextCursor,
      sort_by,
      sort_order
    };
  } catch (error) {
    console.error('Error getting products infinite:', error);
    throw error;
  }
};

// Function for search with infinite scroll
const searchProductsInfinite = async (searchTerm, filters = {}) => {
  try {
    const {
      tenant_id,
      cursor,
      limit = 20, // Mobile-optimized: load 20 items per request
      sort_by = 'product_name',
      sort_order = 'asc'
    } = filters;

    const where = {
      tenant_id: parseInt(tenant_id),
      OR: [
        { product_name: { contains: searchTerm } },
        { product_description: { contains: searchTerm } },
        { product_sku: { contains: searchTerm } }
      ]
    };

    const sortField = sort_by === 'created_at' ? 'created_at' :
                     sort_by === 'product_name' ? 'product_name' :
                     sort_by === 'product_price' ? 'product_price' :
                     sort_by === 'product_stock' ? 'product_stock' : 'product_name';

    const orderBy = {};
    orderBy[sortField] = sort_order === 'asc' ? 'asc' : 'desc';

    if (sortField !== 'product_id') {
      orderBy.product_id = 'desc';
    }

    const cursorOptions = {};
    if (cursor) {
      cursorOptions.cursor = {
        [sortField]: cursor
      };
      cursorOptions.skip = 1;
    }

    const products = await prisma.m_product.findMany({
      where,
      include: {
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      },
      orderBy,
      take: parseInt(limit) + 1,
      ...cursorOptions
    });

    const hasMore = products.length > parseInt(limit);
    const finalProducts = hasMore ? products.slice(0, -1) : products;

    const nextCursor = hasMore && finalProducts.length > 0 ?
      finalProducts[finalProducts.length - 1][sortField] : null;

    return {
      data: finalProducts,
      hasMore,
      nextCursor,
      searchTerm,
      totalResults: products.length // Note: This is not the total count, just current page count
    };
  } catch (error) {
    console.error('Error searching products infinite:', error);
    throw error;
  }
};

// Mobile-optimized function with minimal data for faster loading
const getProductsMobile = async (filters = {}) => {
  try {
    const {
      tenant_id,
      brand_id,
      category_id,
      is_active,
      is_sellable,
      search,
      min_price,
      max_price,
      low_stock,
      cursor,
      limit = 20, // Mobile-optimized: exactly 20 items
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    const where = {};

    if (tenant_id) where.tenant_id = parseInt(tenant_id);
    if (brand_id) where.brand_id = parseInt(brand_id);
    if (category_id) where.category_id = parseInt(category_id);
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;
    if (is_sellable !== undefined) where.is_sellable = is_sellable === 'true' || is_sellable === true;

    if (search) {
      where.OR = [
        { product_name: { contains: search } },
        { product_sku: { contains: search } }
        // Removed product_description for mobile performance
      ];
    }

    if (min_price || max_price) {
      where.product_price = {};
      if (min_price) where.product_price.gte = parseFloat(min_price);
      if (max_price) where.product_price.lte = parseFloat(max_price);
    }

    if (low_stock === 'true' || low_stock === true) {
      where.product_stock = {
        lte: prisma.m_product.fields.product_min_stock
      };
    }

    const sortField = sort_by === 'created_at' ? 'created_at' :
                     sort_by === 'product_name' ? 'product_name' :
                     sort_by === 'product_price' ? 'product_price' :
                     sort_by === 'product_stock' ? 'product_stock' : 'created_at';

    const orderBy = {};
    orderBy[sortField] = sort_order === 'asc' ? 'asc' : 'desc';

    if (sortField !== 'product_id') {
      orderBy.product_id = 'desc';
    }

    const cursorOptions = {};
    if (cursor) {
      cursorOptions.cursor = {
        [sortField]: cursor
      };
      cursorOptions.skip = 1;
    }

    const products = await prisma.m_product.findMany({
      where,
      select: {
        // Minimal fields for mobile performance
        product_id: true,
        product_name: true,
        product_sku: true,
        product_price: true,
        product_stock: true,
        product_min_stock: true,
        is_active: true,
        is_sellable: true,
        is_track_stock: true,
        created_at: true,
        // Essential relations for display
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
        // Removed m_tenant and product_description for mobile optimization
      },
      orderBy,
      take: parseInt(limit) + 1,
      ...cursorOptions
    });

    const hasMore = products.length > parseInt(limit);
    const finalProducts = hasMore ? products.slice(0, -1) : products;

    const nextCursor = hasMore && finalProducts.length > 0 ?
      finalProducts[finalProducts.length - 1][sortField] : null;

    return {
      data: finalProducts,
      hasMore,
      nextCursor,
      sort_by,
      sort_order,
      loadedCount: finalProducts.length
    };
  } catch (error) {
    console.error('Error getting mobile products:', error);
    throw error;
  }
};

// Mobile search with optimized results
const searchProductsMobile = async (searchTerm, filters = {}) => {
  try {
    const {
      tenant_id,
      cursor,
      limit = 20, // Mobile-optimized: exactly 20 items
      sort_by = 'product_name',
      sort_order = 'asc'
    } = filters;

    const where = {
      tenant_id: parseInt(tenant_id),
      OR: [
        { product_name: { contains: searchTerm } },
        { product_sku: { contains: searchTerm } }
        // Removed product_description for mobile performance
      ]
    };

    const sortField = sort_by === 'created_at' ? 'created_at' :
                     sort_by === 'product_name' ? 'product_name' :
                     sort_by === 'product_price' ? 'product_price' :
                     sort_by === 'product_stock' ? 'product_stock' : 'product_name';

    const orderBy = {};
    orderBy[sortField] = sort_order === 'asc' ? 'asc' : 'desc';

    if (sortField !== 'product_id') {
      orderBy.product_id = 'desc';
    }

    const cursorOptions = {};
    if (cursor) {
      cursorOptions.cursor = {
        [sortField]: cursor
      };
      cursorOptions.skip = 1;
    }

    const products = await prisma.m_product.findMany({
      where,
      select: {
        // Minimal fields for mobile search
        product_id: true,
        product_name: true,
        product_sku: true,
        product_price: true,
        product_stock: true,
        is_active: true,
        is_sellable: true,
        m_brand: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        m_category: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      },
      orderBy,
      take: parseInt(limit) + 1,
      ...cursorOptions
    });

    const hasMore = products.length > parseInt(limit);
    const finalProducts = hasMore ? products.slice(0, -1) : products;

    const nextCursor = hasMore && finalProducts.length > 0 ?
      finalProducts[finalProducts.length - 1][sortField] : null;

    return {
      data: finalProducts,
      hasMore,
      nextCursor,
      searchTerm,
      loadedCount: finalProducts.length
    };
  } catch (error) {
    console.error('Error searching mobile products:', error);
    throw error;
  }
};

// Quick load for mobile - only essential info
const getProductsQuickLoad = async (filters = {}) => {
  try {
    const {
      tenant_id,
      cursor,
      limit = 20
    } = filters;

    const where = {
      tenant_id: parseInt(tenant_id),
      is_active: true,
      is_sellable: true
    };

    const cursorOptions = {};
    if (cursor) {
      cursorOptions.cursor = {
        product_id: parseInt(cursor)
      };
      cursorOptions.skip = 1;
    }

    const products = await prisma.m_product.findMany({
      where,
      select: {
        // Only essential fields for quick loading
        product_id: true,
        product_name: true,
        product_price: true,
        product_stock: true,
        is_sellable: true
      },
      orderBy: {
        product_id: 'desc'
      },
      take: parseInt(limit) + 1,
      ...cursorOptions
    });

    const hasMore = products.length > parseInt(limit);
    const finalProducts = hasMore ? products.slice(0, -1) : products;

    const nextCursor = hasMore && finalProducts.length > 0 ?
      finalProducts[finalProducts.length - 1].product_id.toString() : null;

    return {
      data: finalProducts,
      hasMore,
      nextCursor,
      loadedCount: finalProducts.length
    };
  } catch (error) {
    console.error('Error quick loading products:', error);
    throw error;
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductBySku,
  getProductsByCategory,
  getProductsByBrand,
  toggleProductStatus,
  toggleProductSellableStatus,
  updateProductStock,
  getProductsInfinite,
  searchProductsInfinite,
  getProductsMobile,
  searchProductsMobile,
  getProductsQuickLoad
};