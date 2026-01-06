const prisma = require('../config/mysql.db.js');
const { logError } = require('../utils/logger');

const findProductById = async (productId, tenantId, includeRelations = true) => {
    try {
        const where = {
            product_id: productId,
            tenant_id: tenantId,
            deleted_at: null,
        };

        const include = includeRelations ? {
            m_brand: {
                where: { deleted_at: null },
            },
            m_category: {
                where: { deleted_at: null },
            },
        } : undefined;

        return await prisma.m_product.findFirst({
            where,
            include,
        });
    } catch (error) {
        logError(error, { context: 'findProductById', productId, tenantId });
        throw error;
    }
};

const findProductsByFilters = async (filters = {}, pagination = {}) => {
    try {
        const {
            tenant_id,
            search,
            brand_id,
            category_id,
            is_active,
            is_sellable,
            is_track_stock,
            low_stock,
        } = filters;

        const {
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc',
        } = pagination;

        const where = {
            tenant_id,
            deleted_at: null,
        };

        if (search) {
            where.OR = [
                { product_name: { contains: search } },
                { product_sku: { contains: search } },
                { product_description: { contains: search } },
            ];
        }

        if (brand_id) {
            where.brand_id = brand_id;
        }

        if (category_id) {
            where.category_id = category_id;
        }

        if (typeof is_active !== 'undefined') {
            where.is_active = is_active;
        }

        if (typeof is_sellable !== 'undefined') {
            where.is_sellable = is_sellable;
        }

        if (typeof is_track_stock !== 'undefined') {
            where.is_track_stock = is_track_stock;
        }

        if (low_stock) {
            where.AND = [
                { product_qty: { lte: prisma.raw('product_min_stock') } },
                { is_track_stock: true },
            ];
        }

        const skip = (page - 1) * limit;
        const take = limit;

        const orderBy = {};
        orderBy[sortBy] = sortOrder;

        const [products, totalCount] = await Promise.all([
            prisma.m_product.findMany({
                where,
                include: {
                    m_brand: {
                        where: { deleted_at: null },
                    },
                    m_category: {
                        where: { deleted_at: null },
                    },
                },
                orderBy,
                skip,
                take,
            }),
            prisma.m_product.count({ where }),
        ]);

        return {
            products,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        };
    } catch (error) {
        logError(error, { context: 'findProductsByFilters', filters });
        throw error;
    }
};

const createProduct = async (productData) => {
    try {
        return await prisma.m_product.create({
            data: productData,
            include: {
                m_brand: {
                    where: { deleted_at: null },
                },
                m_category: {
                    where: { deleted_at: null },
                },
            },
        });
    } catch (error) {
        logError(error, { context: 'createProduct', productData });
        throw error;
    }
};

const updateProduct = async (productId, tenantId, updateData) => {
    try {
        return await prisma.m_product.update({
            where: {
                product_id: productId,
                tenant_id: tenantId,
                deleted_at: null,
            },
            data: updateData,
            include: {
                m_brand: {
                    where: { deleted_at: null },
                },
                m_category: {
                    where: { deleted_at: null },
                },
            },
        });
    } catch (error) {
        logError(error, { context: 'updateProduct', productId, updateData });
        throw error;
    }
};

const softDeleteProduct = async (productId, tenantId, deletedBy = null) => {
    try {
        return await prisma.m_product.update({
            where: {
                product_id: productId,
                tenant_id: tenantId,
                deleted_at: null,
            },
            data: {
                deleted_at: new Date(),
                deleted_by: deletedBy,
                is_active: false,
                is_sellable: false,
            },
        });
    } catch (error) {
        logError(error, { context: 'softDeleteProduct', productId });
        throw error;
    }
};

const bulkCreateProducts = async (productsData) => {
    try {
        return await prisma.$transaction(
            productsData.map(data => prisma.m_product.create({ data }))
        );
    } catch (error) {
        logError(error, { context: 'bulkCreateProducts', count: productsData.length });
        throw error;
    }
};

const bulkUpdateProducts = async (updates) => {
    try {
        return await prisma.$transaction(
            updates.map(({ productId, tenantId, data }) =>
                prisma.m_product.update({
                    where: {
                        product_id: productId,
                        tenant_id: tenantId,
                        deleted_at: null,
                    },
                    data,
                })
            )
        );
    } catch (error) {
        logError(error, { context: 'bulkUpdateProducts', count: updates.length });
        throw error;
    }
};

const bulkDeleteProducts = async (productIds, tenantId, deletedBy = null) => {
    try {
        return await prisma.m_product.updateMany({
            where: {
                product_id: { in: productIds },
                tenant_id: tenantId,
                deleted_at: null,
            },
            data: {
                deleted_at: new Date(),
                deleted_by: deletedBy,
                is_active: false,
                is_sellable: false,
            },
        });
    } catch (error) {
        logError(error, { context: 'bulkDeleteProducts', productIds });
        throw error;
    }
};

const countProducts = async (filters = {}) => {
    try {
        const where = {
            tenant_id: filters.tenant_id,
            deleted_at: null,
        };

        if (typeof filters.is_active !== 'undefined') {
            where.is_active = filters.is_active;
        }

        if (typeof filters.is_sellable !== 'undefined') {
            where.is_sellable = filters.is_sellable;
        }

        return await prisma.m_product.count({ where });
    } catch (error) {
        logError(error, { context: 'countProducts', filters });
        throw error;
    }
};

const findProductBySku = async (sku, tenantId) => {
    try {
        return await prisma.m_product.findFirst({
            where: {
                product_sku: sku,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
    } catch (error) {
        logError(error, { context: 'findProductBySku', sku, tenantId });
        throw error;
    }
};

const updateProductStock = async (productId, tenantId, quantity, operation = 'set') => {
    try {
        const product = await findProductById(productId, tenantId, false);

        if (!product) {
            throw new Error('Product not found');
        }

        let newQty;
        if (operation === 'add') {
            newQty = product.product_qty + quantity;
        } else if (operation === 'subtract') {
            newQty = product.product_qty - quantity;
        } else {
            newQty = quantity;
        }

        if (newQty < 0) {
            throw new Error('Stock cannot be negative');
        }

        return await prisma.m_product.update({
            where: {
                product_id: productId,
                tenant_id: tenantId,
                deleted_at: null,
            },
            data: {
                product_qty: newQty,
                updated_at: new Date(),
            },
        });
    } catch (error) {
        logError(error, { context: 'updateProductStock', productId, quantity, operation });
        throw error;
    }
};

module.exports = {
    findProductById,
    findProductsByFilters,
    createProduct,
    updateProduct,
    softDeleteProduct,
    bulkCreateProducts,
    bulkUpdateProducts,
    bulkDeleteProducts,
    countProducts,
    findProductBySku,
    updateProductStock,
};
