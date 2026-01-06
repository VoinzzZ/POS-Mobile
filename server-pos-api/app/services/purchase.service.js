const prisma = require('../config/mysql.db.js');
const stockService = require('./stock.service');

const generatePONumber = async (tenant_id) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const lastPO = await prisma.t_purchase_order.findFirst({
        where: {
            tenant_id: parseInt(tenant_id),
            po_number: {
                startsWith: `PO-${year}${month}`
            }
        },
        orderBy: {
            po_number: 'desc'
        }
    });

    let sequence = 1;
    if (lastPO) {
        const lastSequence = parseInt(lastPO.po_number.split('-')[2]);
        sequence = lastSequence + 1;
    }

    return `PO-${year}${month}-${String(sequence).padStart(4, '0')}`;
};

const createPurchaseOrder = async (poData) => {
    try {
        const { supplier_name, po_date, items, notes, tenant_id, created_by } = poData;

        const po_number = await generatePONumber(tenant_id);

        let total_amount = 0;
        items.forEach(item => {
            total_amount += parseFloat(item.cost_per_unit) * parseInt(item.quantity);
        });

        const purchaseOrder = await prisma.t_purchase_order.create({
            data: {
                po_number,
                supplier_name,
                po_date: new Date(po_date),
                po_status: 'PENDING',
                total_amount,
                notes,
                tenant_id: parseInt(tenant_id),
                created_by: created_by ? parseInt(created_by) : null,
                t_purchase_order_item: {
                    create: items.map(item => ({
                        product_id: parseInt(item.product_id),
                        quantity: parseInt(item.quantity),
                        cost_per_unit: parseFloat(item.cost_per_unit),
                        subtotal: parseFloat(item.cost_per_unit) * parseInt(item.quantity)
                    }))
                }
            },
            include: {
                t_purchase_order_item: {
                    include: {
                        m_product: {
                            select: {
                                product_id: true,
                                product_name: true,
                                product_sku: true
                            }
                        }
                    }
                }
            }
        });

        return purchaseOrder;
    } catch (error) {
        throw error;
    }
};

const getPurchaseOrders = async (filters = {}) => {
    try {
        const {
            tenant_id,
            po_status,
            start_date,
            end_date,
            page = 1,
            limit = 20,
            sort_order = 'desc'
        } = filters;

        const where = {};

        if (tenant_id) where.tenant_id = parseInt(tenant_id);
        if (po_status) where.po_status = po_status;

        if (start_date || end_date) {
            where.po_date = {};
            if (start_date) where.po_date.gte = new Date(start_date);
            if (end_date) where.po_date.lte = new Date(end_date);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [purchaseOrders, totalCount] = await Promise.all([
            prisma.t_purchase_order.findMany({
                where,
                include: {
                    t_purchase_order_item: {
                        include: {
                            m_product: {
                                select: {
                                    product_id: true,
                                    product_name: true,
                                    product_sku: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    po_date: sort_order === 'asc' ? 'asc' : 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.t_purchase_order.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        return {
            data: purchaseOrders,
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

const getPurchaseOrderById = async (po_id) => {
    try {
        const purchaseOrder = await prisma.t_purchase_order.findUnique({
            where: { po_id: parseInt(po_id) },
            include: {
                t_purchase_order_item: {
                    include: {
                        m_product: {
                            select: {
                                product_id: true,
                                product_name: true,
                                product_sku: true,
                                product_qty: true
                            }
                        }
                    }
                }
            }
        });

        return purchaseOrder;
    } catch (error) {
        throw error;
    }
};

const updatePurchaseOrder = async (po_id, updateData) => {
    try {
        const existingPO = await prisma.t_purchase_order.findUnique({
            where: { po_id: parseInt(po_id) }
        });

        if (!existingPO) {
            throw new Error('Purchase order not found');
        }

        if (existingPO.po_status === 'RECEIVED') {
            throw new Error('Cannot update received purchase order');
        }

        const purchaseOrder = await prisma.t_purchase_order.update({
            where: { po_id: parseInt(po_id) },
            data: {
                ...(updateData.supplier_name && { supplier_name: updateData.supplier_name }),
                ...(updateData.po_date && { po_date: new Date(updateData.po_date) }),
                ...(updateData.notes !== undefined && { notes: updateData.notes }),
                ...(updateData.updated_by && { updated_by: parseInt(updateData.updated_by) })
            },
            include: {
                t_purchase_order_item: {
                    include: {
                        m_product: true
                    }
                }
            }
        });

        return purchaseOrder;
    } catch (error) {
        throw error;
    }
};

const receivePurchaseOrder = async (po_id, received_by) => {
    try {
        const purchaseOrder = await getPurchaseOrderById(po_id);

        if (!purchaseOrder) {
            throw new Error('Purchase order not found');
        }

        if (purchaseOrder.po_status === 'RECEIVED') {
            throw new Error('Purchase order already received');
        }

        if (purchaseOrder.po_status === 'CANCELLED') {
            throw new Error('Cannot receive cancelled purchase order');
        }

        const stockMovements = [];

        for (const item of purchaseOrder.t_purchase_order_item) {
            await stockService.updateProductCostWAC(
                item.product_id,
                item.cost_per_unit,
                item.quantity
            );

            const movement = await stockService.createStockMovement({
                product_id: item.product_id,
                movement_type: 'IN',
                quantity: item.quantity,
                cost_per_unit: item.cost_per_unit,
                reference_type: 'PURCHASE',
                reference_id: parseInt(po_id),
                notes: `Receive PO ${purchaseOrder.po_number}`,
                tenant_id: purchaseOrder.tenant_id,
                created_by: received_by
            });

            stockMovements.push(movement);
        }

        const updatedPO = await prisma.t_purchase_order.update({
            where: { po_id: parseInt(po_id) },
            data: {
                po_status: 'RECEIVED',
                received_at: new Date(),
                updated_by: received_by ? parseInt(received_by) : null
            },
            include: {
                t_purchase_order_item: {
                    include: {
                        m_product: true
                    }
                }
            }
        });

        return {
            purchase_order: updatedPO,
            stock_movements: stockMovements
        };
    } catch (error) {
        throw error;
    }
};

const cancelPurchaseOrder = async (po_id, cancelled_by) => {
    try {
        const existingPO = await prisma.t_purchase_order.findUnique({
            where: { po_id: parseInt(po_id) }
        });

        if (!existingPO) {
            throw new Error('Purchase order not found');
        }

        if (existingPO.po_status === 'RECEIVED') {
            throw new Error('Cannot cancel received purchase order');
        }

        const purchaseOrder = await prisma.t_purchase_order.update({
            where: { po_id: parseInt(po_id) },
            data: {
                po_status: 'CANCELLED',
                updated_by: cancelled_by ? parseInt(cancelled_by) : null
            },
            include: {
                t_purchase_order_item: {
                    include: {
                        m_product: true
                    }
                }
            }
        });

        return purchaseOrder;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    receivePurchaseOrder,
    cancelPurchaseOrder,
    generatePONumber
};
