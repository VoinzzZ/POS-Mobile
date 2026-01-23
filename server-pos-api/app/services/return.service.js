const prisma = require('../config/mysql.db.js');

class ReturnService {
    static async getReturnableTransactions(tenant_id, cashier_id = null) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        threeDaysAgo.setHours(0, 0, 0, 0);

        const where = {
            tenant_id,
            transaction_status: 'COMPLETED',
            transaction_completed_at: {
                gte: threeDaysAgo
            },
            deleted_at: null
        };

        if (cashier_id) {
            where.transaction_cashier_id = parseInt(cashier_id);
        }

        const transactions = await prisma.t_transaction.findMany({
            where,
            include: {
                t_transaction_item: {
                    include: {
                        m_product: true
                    }
                },
                m_user: true
            },
            orderBy: { transaction_completed_at: 'desc' }
        });

        return transactions;
    }

    static async createReturn(data) {
        const { tenant_id, cashier_id, transaction_id, items, notes } = data;

        return await prisma.$transaction(async (tx) => {
            const transaction = await tx.t_transaction.findFirst({
                where: {
                    transaction_id: parseInt(transaction_id),
                    tenant_id,
                    transaction_status: 'COMPLETED',
                    deleted_at: null
                },
                include: {
                    t_transaction_item: {
                        include: {
                            m_product: true
                        }
                    }
                }
            });

            if (!transaction) {
                throw new Error('Transaction not found or not eligible for return');
            }

            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            threeDaysAgo.setHours(0, 0, 0, 0);

            if (new Date(transaction.transaction_completed_at) < threeDaysAgo) {
                throw new Error('Transaction is older than 3 days and cannot be returned');
            }

            const existingReturns = await tx.t_return.findMany({
                where: {
                    original_transaction_id: parseInt(transaction_id)
                },
                include: {
                    t_return_item: true
                }
            });

            const returnedQuantities = new Map();
            existingReturns.forEach(ret => {
                ret.t_return_item.forEach(item => {
                    const current = returnedQuantities.get(item.product_id) || 0;
                    returnedQuantities.set(item.product_id, current + item.quantity);
                });
            });

            let return_total = 0;
            const return_items = [];
            const stockMovements = [];
            const productUpdates = [];

            for (const item of items) {
                const transactionItem = transaction.t_transaction_item.find(
                    ti => ti.transaction_item_product_id === item.product_id
                );

                if (!transactionItem) {
                    throw new Error(`Product ${item.product_id} not found in transaction`);
                }

                const alreadyReturned = returnedQuantities.get(item.product_id) || 0;
                const maxReturnableQty = transactionItem.transaction_item_quantity - alreadyReturned;

                if (item.quantity > maxReturnableQty) {
                    throw new Error(`Cannot return ${item.quantity} of product ${transactionItem.m_product.product_name}. Maximum returnable: ${maxReturnableQty}`);
                }

                const product = transactionItem.m_product;
                const return_item_price = transactionItem.transaction_item_price;
                const return_item_subtotal = return_item_price * item.quantity;
                return_total += return_item_subtotal;

                return_items.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: return_item_price,
                    subtotal: return_item_subtotal
                });

                const before_qty = product.product_qty;
                const after_qty = before_qty + item.quantity;

                productUpdates.push(
                    tx.m_product.update({
                        where: { product_id: item.product_id },
                        data: {
                            product_qty: {
                                increment: item.quantity
                            }
                        }
                    })
                );

                stockMovements.push({
                    product_id: item.product_id,
                    movement_type: 'RETURN',
                    quantity: item.quantity,
                    cost_per_unit: product.product_cost ? parseFloat(product.product_cost) : null,
                    reference_type: 'RETURN',
                    notes: `Retur - Transaksi #${transaction.transaction_number}`,
                    before_qty,
                    after_qty,
                    tenant_id: parseInt(tenant_id),
                    created_by: parseInt(cashier_id)
                });
            }

            await Promise.all(productUpdates);

            await tx.t_stock_movement.createMany({
                data: stockMovements
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayCount = await tx.t_return.count({
                where: {
                    tenant_id,
                    created_at: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            });

            const return_number = todayCount + 1;

            const returnRecord = await tx.t_return.create({
                data: {
                    return_number,
                    original_transaction_id: parseInt(transaction_id),
                    tenant_id,
                    cashier_id,
                    return_total,
                    refund_amount: return_total,
                    refund_method: 'CASH',
                    notes,
                    created_by: cashier_id
                }
            });

            for (const item of return_items) {
                await tx.t_return_item.create({
                    data: {
                        return_id: returnRecord.return_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.subtotal
                    }
                });
            }

            stockMovements.forEach(movement => {
                movement.reference_id = returnRecord.return_id;
            });

            await tx.t_stock_movement.updateMany({
                where: {
                    product_id: {
                        in: stockMovements.map(m => m.product_id)
                    },
                    reference_type: 'RETURN',
                    reference_id: null,
                    created_by: cashier_id,
                    created_at: {
                        gte: new Date(Date.now() - 5000)
                    }
                },
                data: {
                    reference_id: returnRecord.return_id
                }
            });

            let returnCategory = await tx.t_expense_category.findFirst({
                where: {
                    category_code: 'RETURN_REFUND',
                    OR: [
                        { tenant_id: parseInt(tenant_id) },
                        { tenant_id: null, is_system: true }
                    ]
                }
            });

            if (!returnCategory) {
                returnCategory = await tx.t_expense_category.create({
                    data: {
                        category_code: 'RETURN_REFUND',
                        category_name: 'Retur Barang',
                        category_description: 'Pengembalian uang untuk retur barang',
                        tenant_id: parseInt(tenant_id),
                        is_system: false,
                        is_active: true,
                        created_by: cashier_id ? parseInt(cashier_id) : null
                    }
                });
            }

            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            const lastCashTransaction = await tx.t_cash_transaction.findFirst({
                where: {
                    tenant_id: parseInt(tenant_id),
                    transaction_number: {
                        startsWith: `CSH-${year}${month}${day}`
                    }
                },
                orderBy: {
                    transaction_number: 'desc'
                }
            });

            let sequence = 1;
            if (lastCashTransaction) {
                const lastSequence = parseInt(lastCashTransaction.transaction_number.split('-')[2]);
                sequence = lastSequence + 1;
            }

            const cashTransactionNumber = `CSH-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;

            await tx.t_cash_transaction.create({
                data: {
                    transaction_number: cashTransactionNumber,
                    tenant_id: parseInt(tenant_id),
                    transaction_type: 'EXPENSE',
                    amount: parseFloat(return_total),
                    payment_method: 'CASH',
                    category_id: returnCategory.category_id,
                    category_type: 'RETURN',
                    description: `Retur #${return_number} - Transaksi #${transaction.transaction_number}`,
                    notes: notes || null,
                    transaction_date: new Date(),
                    created_by: cashier_id ? parseInt(cashier_id) : null
                }
            });

            return await tx.t_return.findUnique({
                where: { return_id: returnRecord.return_id },
                include: {
                    t_return_item: {
                        include: {
                            m_product: true
                        }
                    },
                    m_user: true
                }
            });
        }, {
            maxWait: 10000,
            timeout: 15000
        });
    }

    static async getReturns(filters) {
        const {
            tenant_id,
            start_date,
            end_date,
            cashier_id,
            page = 1,
            limit = 50
        } = filters;

        const where = {
            tenant_id
        };

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) where.created_at.gte = new Date(start_date);
            if (end_date) where.created_at.lte = new Date(end_date);
        }

        if (cashier_id) where.cashier_id = parseInt(cashier_id);

        const skip = (page - 1) * limit;

        const [returns, total] = await Promise.all([
            prisma.t_return.findMany({
                where,
                include: {
                    t_return_item: {
                        include: {
                            m_product: true
                        }
                    },
                    m_user: true
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.t_return.count({ where })
        ]);

        return {
            data: returns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getReturnById(return_id, tenant_id) {
        return await prisma.t_return.findFirst({
            where: {
                return_id: parseInt(return_id),
                tenant_id
            },
            include: {
                t_return_item: {
                    include: {
                        m_product: true
                    }
                },
                m_user: true
            }
        });
    }
}

module.exports = ReturnService;
