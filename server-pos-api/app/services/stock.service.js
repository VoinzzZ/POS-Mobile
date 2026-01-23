const prisma = require('../config/mysql.db.js');

const createStockMovement = async (movementData, skipProductUpdate = false) => {
    try {
        const { product_id, movement_type, quantity, cost_per_unit, reference_type, reference_id, notes, tenant_id, created_by } = movementData;

        const product = await prisma.m_product.findUnique({
            where: { product_id: parseInt(product_id) }
        });

        if (!product) {
            throw new Error('Product not found');
        }

        const before_qty = product.product_qty;
        let after_qty = before_qty;

        if (movement_type === 'IN' || movement_type === 'RETURN') {
            after_qty = before_qty + parseInt(quantity);
        } else if (movement_type === 'OUT') {
            after_qty = before_qty - parseInt(quantity);
            if (after_qty < 0) after_qty = 0;
        } else if (movement_type === 'ADJUSTMENT') {
            after_qty = parseInt(quantity);
        }

        const movement = await prisma.t_stock_movement.create({
            data: {
                product_id: parseInt(product_id),
                movement_type,
                quantity: parseInt(quantity),
                cost_per_unit: cost_per_unit ? parseFloat(cost_per_unit) : null,
                reference_type,
                reference_id: reference_id ? parseInt(reference_id) : null,
                notes,
                before_qty,
                after_qty,
                tenant_id: parseInt(tenant_id),
                created_by: created_by ? parseInt(created_by) : null
            },
            include: {
                m_product: {
                    select: {
                        product_id: true,
                        product_name: true,
                        product_sku: true
                    }
                }
            }
        });

        if (!skipProductUpdate) {
            await prisma.m_product.update({
                where: { product_id: parseInt(product_id) },
                data: { product_qty: after_qty }
            });
        }

        return movement;
    } catch (error) {
        throw error;
    }
};

const getStockMovements = async (filters = {}) => {
    try {
        const {
            tenant_id,
            product_id,
            movement_type,
            reference_type,
            start_date,
            end_date,
            page = 1,
            limit = 20,
            sort_order = 'desc'
        } = filters;

        const where = {};

        if (tenant_id) where.tenant_id = parseInt(tenant_id);
        if (product_id) where.product_id = parseInt(product_id);
        if (movement_type) where.movement_type = movement_type;
        if (reference_type) where.reference_type = reference_type;

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) where.created_at.gte = new Date(start_date);
            if (end_date) where.created_at.lte = new Date(end_date);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [movements, totalCount] = await Promise.all([
            prisma.t_stock_movement.findMany({
                where,
                include: {
                    m_product: {
                        select: {
                            product_id: true,
                            product_name: true,
                            product_sku: true,
                            product_price: true
                        }
                    }
                },
                orderBy: {
                    created_at: sort_order === 'asc' ? 'asc' : 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.t_stock_movement.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        return {
            data: movements,
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

const getStockMovementsByProduct = async (product_id, tenant_id, limit = 50) => {
    try {
        const movements = await prisma.t_stock_movement.findMany({
            where: {
                product_id: parseInt(product_id),
                tenant_id: parseInt(tenant_id)
            },
            orderBy: {
                created_at: 'desc'
            },
            take: parseInt(limit)
        });

        return movements;
    } catch (error) {
        throw error;
    }
};

const calculateInventoryValuation = async (tenant_id) => {
    try {
        const products = await prisma.m_product.findMany({
            where: {
                tenant_id: parseInt(tenant_id),
                is_active: true,
                deleted_at: null
            },
            select: {
                product_id: true,
                product_name: true,
                product_sku: true,
                product_price: true,
                product_cost: true,
                product_qty: true,
                product_min_stock: true
            }
        });

        let totalCostValue = 0;
        let totalSellingValue = 0;
        let totalPotentialProfit = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        const productMetrics = products.map(product => {
            const costValue = (parseFloat(product.product_cost) || 0) * product.product_qty;
            const sellingValue = parseFloat(product.product_price) * product.product_qty;
            const potentialProfit = sellingValue - costValue;
            const profitMargin = costValue > 0 ? ((potentialProfit / costValue) * 100) : 0;

            totalCostValue += costValue;
            totalSellingValue += sellingValue;
            totalPotentialProfit += potentialProfit;

            if (product.product_qty === 0) outOfStockCount++;
            else if (product.product_qty <= (product.product_min_stock || 0)) lowStockCount++;

            return {
                product_id: product.product_id,
                product_name: product.product_name,
                product_sku: product.product_sku,
                quantity: product.product_qty,
                cost_per_unit: parseFloat(product.product_cost) || 0,
                price_per_unit: parseFloat(product.product_price),
                cost_value: costValue,
                selling_value: sellingValue,
                potential_profit: potentialProfit,
                profit_margin: profitMargin
            };
        });

        return {
            summary: {
                total_products: products.length,
                total_cost_value: totalCostValue,
                total_selling_value: totalSellingValue,
                total_potential_profit: totalPotentialProfit,
                average_profit_margin: totalCostValue > 0 ? ((totalPotentialProfit / totalCostValue) * 100) : 0,
                low_stock_count: lowStockCount,
                out_of_stock_count: outOfStockCount
            },
            products: productMetrics
        };
    } catch (error) {
        throw error;
    }
};

const getLowStockProducts = async (tenant_id) => {
    try {
        const products = await prisma.$queryRaw`
      SELECT 
        product_id,
        product_name,
        product_sku,
        product_qty,
        product_min_stock,
        product_price,
        product_cost,
        (product_min_stock - product_qty) as shortage
      FROM m_product
      WHERE tenant_id = ${parseInt(tenant_id)}
        AND product_qty <= product_min_stock
        AND is_active = true
        AND deleted_at IS NULL
        AND is_track_stock = true
      ORDER BY shortage DESC
    `;

        // Convert BigInt values to Numbers for JSON serialization
        const serializedProducts = products.map(product => ({
            product_id: Number(product.product_id),
            product_name: product.product_name,
            product_sku: product.product_sku,
            product_qty: Number(product.product_qty),
            product_min_stock: Number(product.product_min_stock),
            product_price: parseFloat(product.product_price),
            product_cost: product.product_cost ? parseFloat(product.product_cost) : null,
            shortage: Number(product.shortage)
        }));

        return serializedProducts;
    } catch (error) {
        throw error;
    }
};

const getDeadStockProducts = async (tenant_id, days = 90) => {
    try {
        const deadStockProducts = await prisma.$queryRaw`
      SELECT 
        p.product_id,
        p.product_name,
        p.product_sku,
        p.product_qty,
        p.product_price,
        p.product_cost,
        (p.product_qty * p.product_cost) as tied_capital,
        MAX(sm.created_at) as last_movement_date,
        DATEDIFF(NOW(), MAX(sm.created_at)) as days_no_movement
      FROM m_product p
      LEFT JOIN t_stock_movement sm ON p.product_id = sm.product_id AND sm.movement_type = 'OUT'
      WHERE p.tenant_id = ${parseInt(tenant_id)}
        AND p.is_active = true
        AND p.deleted_at IS NULL
        AND p.product_qty > 0
      GROUP BY p.product_id
      HAVING days_no_movement > ${days} OR last_movement_date IS NULL
      ORDER BY tied_capital DESC
    `;

        // Convert BigInt values to Numbers for JSON serialization
        const serializedProducts = deadStockProducts.map(product => ({
            product_id: Number(product.product_id),
            product_name: product.product_name,
            product_sku: product.product_sku,
            product_qty: Number(product.product_qty),
            product_price: parseFloat(product.product_price),
            product_cost: product.product_cost ? parseFloat(product.product_cost) : null,
            tied_capital: product.tied_capital ? parseFloat(product.tied_capital) : 0,
            last_movement_date: product.last_movement_date,
            days_no_movement: product.days_no_movement ? Number(product.days_no_movement) : null
        }));

        return serializedProducts;
    } catch (error) {
        throw error;
    }
};

const updateProductCostWAC = async (product_id, new_cost, new_qty) => {
    try {
        const product = await prisma.m_product.findUnique({
            where: { product_id: parseInt(product_id) }
        });

        if (!product) {
            throw new Error('Product not found');
        }

        const existing_cost = parseFloat(product.product_cost) || 0;
        const existing_qty = product.product_qty;

        const total_cost = (existing_cost * existing_qty) + (parseFloat(new_cost) * parseInt(new_qty));
        const total_qty = existing_qty + parseInt(new_qty);

        const weighted_avg_cost = total_qty > 0 ? total_cost / total_qty : 0;

        await prisma.m_product.update({
            where: { product_id: parseInt(product_id) },
            data: {
                product_cost: weighted_avg_cost
            }
        });

        return {
            product_id: parseInt(product_id),
            old_cost: existing_cost,
            new_cost: weighted_avg_cost,
            old_qty: existing_qty,
            new_qty: total_qty
        };
    } catch (error) {
        throw error;
    }
};

const getStockMovementStatistics = async (tenant_id, start_date, end_date) => {
    try {
        const where = {
            tenant_id: parseInt(tenant_id)
        };

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) where.created_at.gte = new Date(start_date);
            if (end_date) where.created_at.lte = new Date(end_date);
        }

        const [incomingMovements, returnMovements, outgoingTransactionMovements, outgoingNonTransactionMovements, adjustmentMovements] = await Promise.all([
            prisma.t_stock_movement.aggregate({
                where: {
                    ...where,
                    movement_type: 'IN'
                },
                _sum: {
                    quantity: true
                }
            }),
            prisma.t_stock_movement.aggregate({
                where: {
                    ...where,
                    movement_type: 'RETURN'
                },
                _sum: {
                    quantity: true
                }
            }),
            prisma.t_stock_movement.aggregate({
                where: {
                    ...where,
                    movement_type: 'OUT',
                    reference_type: 'SALE'
                },
                _sum: {
                    quantity: true
                }
            }),
            prisma.t_stock_movement.aggregate({
                where: {
                    ...where,
                    movement_type: 'OUT',
                    reference_type: {
                        not: 'SALE'
                    }
                },
                _sum: {
                    quantity: true
                }
            }),
            prisma.t_stock_movement.findMany({
                where: {
                    ...where,
                    movement_type: 'ADJUSTMENT'
                },
                select: {
                    before_qty: true,
                    after_qty: true
                }
            })
        ]);

        let adjustmentTotal = 0;
        for (const adj of adjustmentMovements) {
            const delta = adj.after_qty - adj.before_qty;
            if (delta < 0) {
                adjustmentTotal += Math.abs(delta);
            }
        }

        return {
            incoming_total: incomingMovements._sum.quantity || 0,
            return_total: returnMovements._sum.quantity || 0,
            outgoing_transaction_total: outgoingTransactionMovements._sum.quantity || 0,
            outgoing_nontransaction_total: (outgoingNonTransactionMovements._sum.quantity || 0) + adjustmentTotal
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createStockMovement,
    getStockMovements,
    getStockMovementsByProduct,
    calculateInventoryValuation,
    getLowStockProducts,
    getDeadStockProducts,
    updateProductCostWAC,
    getStockMovementStatistics
};
