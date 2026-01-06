const prisma = require('../config/mysql.db.js');
const stockService = require('./stock.service');

const createStockOpname = async (opnameData) => {
    try {
        const { product_id, actual_qty, notes, tenant_id, created_by } = opnameData;

        const product = await prisma.m_product.findUnique({
            where: { product_id: parseInt(product_id) }
        });

        if (!product) {
            throw new Error('Product not found');
        }

        const system_qty = product.product_qty;
        const difference = parseInt(actual_qty) - system_qty;

        const opname = await prisma.t_stock_opname.create({
            data: {
                product_id: parseInt(product_id),
                system_qty,
                actual_qty: parseInt(actual_qty),
                difference,
                notes,
                tenant_id: parseInt(tenant_id),
                created_by: created_by ? parseInt(created_by) : null,
                processed: false
            },
            include: {
                m_product: {
                    select: {
                        product_id: true,
                        product_name: true,
                        product_sku: true,
                        product_price: true,
                        product_cost: true
                    }
                }
            }
        });

        return opname;
    } catch (error) {
        throw error;
    }
};

const getStockOpnames = async (filters = {}) => {
    try {
        const {
            tenant_id,
            product_id,
            processed,
            start_date,
            end_date,
            page = 1,
            limit = 20,
            sort_order = 'desc'
        } = filters;

        const where = {};

        if (tenant_id) where.tenant_id = parseInt(tenant_id);
        if (product_id) where.product_id = parseInt(product_id);
        if (processed !== undefined) where.processed = processed === 'true' || processed === true;

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) where.created_at.gte = new Date(start_date);
            if (end_date) where.created_at.lte = new Date(end_date);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [opnames, totalCount] = await Promise.all([
            prisma.t_stock_opname.findMany({
                where,
                include: {
                    m_product: {
                        select: {
                            product_id: true,
                            product_name: true,
                            product_sku: true,
                            product_price: true,
                            product_cost: true
                        }
                    }
                },
                orderBy: {
                    created_at: sort_order === 'asc' ? 'asc' : 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.t_stock_opname.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        return {
            data: opnames,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                limit: parseInt(limit)
            }
        };
    } catch (error) {
        throw error;
    }
};

const processStockOpname = async (opname_id, processed_by) => {
    try {
        const opname = await prisma.t_stock_opname.findUnique({
            where: { opname_id: parseInt(opname_id) },
            include: {
                m_product: true
            }
        });

        if (!opname) {
            throw new Error('Stock opname not found');
        }

        if (opname.processed) {
            throw new Error('Stock opname already processed');
        }

        if (opname.difference === 0) {
            await prisma.t_stock_opname.update({
                where: { opname_id: parseInt(opname_id) },
                data: {
                    processed: true,
                    processed_at: new Date()
                }
            });

            return {
                opname,
                stock_movement: null,
                message: 'No adjustment needed, quantities match'
            };
        }

        const movement = await stockService.createStockMovement({
            product_id: opname.product_id,
            movement_type: 'ADJUSTMENT',
            quantity: opname.actual_qty,
            cost_per_unit: parseFloat(opname.m_product.product_cost),
            reference_type: 'OPNAME',
            reference_id: parseInt(opname_id),
            notes: `Stock opname adjustment: ${opname.difference > 0 ? '+' : ''}${opname.difference} units. ${opname.notes || ''}`,
            tenant_id: opname.tenant_id,
            created_by: processed_by
        });

        const updatedOpname = await prisma.t_stock_opname.update({
            where: { opname_id: parseInt(opname_id) },
            data: {
                processed: true,
                processed_at: new Date()
            },
            include: {
                m_product: true
            }
        });

        return {
            opname: updatedOpname,
            stock_movement: movement,
            message: 'Stock adjustment processed successfully'
        };
    } catch (error) {
        throw error;
    }
};

const bulkCreateStockOpname = async (opnameDataArray, tenant_id, created_by) => {
    try {
        const results = [];

        for (const opnameData of opnameDataArray) {
            const opname = await createStockOpname({
                ...opnameData,
                tenant_id,
                created_by
            });
            results.push(opname);
        }

        return results;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createStockOpname,
    getStockOpnames,
    processStockOpname,
    bulkCreateStockOpname
};
