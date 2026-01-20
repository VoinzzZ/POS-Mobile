const prisma = require('../config/mysql.db.js');
const stockService = require('./stock.service');

class TransactionService {
    static async createTransaction(data) {
        const { tenant_id, cashier_id, items } = data;

        return await prisma.$transaction(async (tx) => {
            let transaction_total = 0;
            const transaction_items = [];

            for (const item of items) {
                const product = await tx.m_product.findFirst({
                    where: {
                        product_id: item.product_id,
                        tenant_id,
                        is_active: true,
                        deleted_at: null
                    }
                });

                if (!product) {
                    throw new Error(`Product with ID ${item.product_id} not found`);
                }

                if (product.product_qty < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.product_name}`);
                }

                const transaction_item_price = product.product_price;
                const transaction_item_subtotal = transaction_item_price * item.quantity;
                transaction_total += transaction_item_subtotal;

                transaction_items.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: transaction_item_price,
                    subtotal: transaction_item_subtotal
                });
            }

            // Calculate daily transaction number
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayCount = await tx.t_transaction.count({
                where: {
                    tenant_id,
                    transaction_created_at: {
                        gte: today,
                        lt: tomorrow
                    },
                    deleted_at: null
                }
            });

            const transaction_number = todayCount + 1;

            const transaction = await tx.t_transaction.create({
                data: {
                    tenant_id,
                    transaction_cashier_id: cashier_id,
                    transaction_total,
                    transaction_number,
                    transaction_status: 'DRAFT',
                    transaction_created_at: new Date()
                }
            });

            for (const item of transaction_items) {
                await tx.t_transaction_item.create({
                    data: {
                        transaction_id: transaction.transaction_id,
                        transaction_item_product_id: item.product_id,
                        transaction_item_quantity: item.quantity,
                        transaction_item_price: item.price,
                        transaction_item_subtotal: item.subtotal
                    }
                });
            }

            return await tx.t_transaction.findUnique({
                where: { transaction_id: transaction.transaction_id },
                include: {
                    t_transaction_item: {
                        include: {
                            m_product: true
                        }
                    },
                    m_user: true
                }
            });
        });
    }

    static async getTransactions(filters) {
        const {
            tenant_id,
            start_date,
            end_date,
            cashier_id,
            status,
            page = 1,
            limit = 50
        } = filters;

        const where = {
            tenant_id,
            deleted_at: null
        };

        if (start_date || end_date) {
            where.transaction_created_at = {};
            if (start_date) where.transaction_created_at.gte = new Date(start_date);
            if (end_date) where.transaction_created_at.lte = new Date(end_date);
        }

        if (cashier_id) where.transaction_cashier_id = parseInt(cashier_id);
        if (status) where.transaction_status = status;

        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.t_transaction.findMany({
                where,
                include: {
                    t_transaction_item: {
                        include: {
                            m_product: true
                        }
                    },
                    m_user: true
                },
                orderBy: { transaction_created_at: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.t_transaction.count({ where })
        ]);

        return {
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getTransactionById(transaction_id, tenant_id) {
        return await prisma.t_transaction.findFirst({
            where: {
                transaction_id: parseInt(transaction_id),
                tenant_id,
                deleted_at: null
            },
            include: {
                t_transaction_item: {
                    include: {
                        m_product: true
                    }
                },
                m_user: true
            }
        });
    }

    static async completeTransaction(transaction_id, data, tenant_id) {
        const { payment_amount, payment_method } = data;

        return await prisma.$transaction(async (tx) => {
            const transaction = await tx.t_transaction.findFirst({
                where: {
                    transaction_id: parseInt(transaction_id),
                    tenant_id,
                    transaction_status: 'DRAFT',
                    deleted_at: null
                },
                include: {
                    t_transaction_item: true
                }
            });

            if (!transaction) {
                throw new Error('Transaction not found or already completed');
            }

            if (payment_amount < transaction.transaction_total) {
                throw new Error('Payment amount is less than transaction total');
            }

            const productIds = transaction.t_transaction_item.map(item => item.transaction_item_product_id);
            const products = await tx.m_product.findMany({
                where: {
                    product_id: { in: productIds }
                },
                select: {
                    product_id: true,
                    product_name: true,
                    product_qty: true,
                    product_cost: true
                }
            });

            const productMap = new Map(products.map(p => [p.product_id, p]));

            const stockMovements = [];
            const productUpdates = [];

            for (const item of transaction.t_transaction_item) {
                const product = productMap.get(item.transaction_item_product_id);

                if (!product) {
                    throw new Error(`Product with ID ${item.transaction_item_product_id} not found`);
                }

                const before_qty = product.product_qty;
                const after_qty = Math.max(0, before_qty - item.transaction_item_quantity);

                productUpdates.push(
                    tx.m_product.update({
                        where: { product_id: item.transaction_item_product_id },
                        data: {
                            product_qty: {
                                decrement: item.transaction_item_quantity
                            }
                        }
                    })
                );

                stockMovements.push({
                    product_id: item.transaction_item_product_id,
                    movement_type: 'OUT',
                    quantity: item.transaction_item_quantity,
                    cost_per_unit: product.product_cost ? parseFloat(product.product_cost) : null,
                    reference_type: 'SALE',
                    reference_id: transaction.transaction_id,
                    notes: `Penjualan - Transaksi #${transaction.transaction_number}`,
                    before_qty,
                    after_qty,
                    tenant_id: tenant_id,
                    created_by: transaction.transaction_cashier_id
                });

                product.product_qty = after_qty;
            }

            await Promise.all(productUpdates);

            await tx.t_stock_movement.createMany({
                data: stockMovements
            });

            const change_amount = payment_amount - transaction.transaction_total;

            return await tx.t_transaction.update({
                where: { transaction_id: parseInt(transaction_id) },
                data: {
                    transaction_status: 'COMPLETED',
                    transaction_payment_amount: payment_amount,
                    transaction_change_amount: change_amount,
                    transaction_payment_method: payment_method,
                    transaction_completed_at: new Date(),
                },
                include: {
                    t_transaction_item: {
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


    static async deleteTransaction(transaction_id, tenant_id, user_id) {
        return await prisma.$transaction(async (tx) => {
            const transaction = await tx.t_transaction.findFirst({
                where: {
                    transaction_id: parseInt(transaction_id),
                    tenant_id,
                    deleted_at: null
                },
                include: {
                    t_transaction_item: true
                }
            });

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            if (transaction.transaction_status === 'COMPLETED') {
                const productIds = transaction.t_transaction_item.map(item => item.transaction_item_product_id);
                const products = await tx.m_product.findMany({
                    where: {
                        product_id: { in: productIds }
                    },
                    select: {
                        product_id: true,
                        product_name: true,
                        product_qty: true,
                        product_cost: true
                    }
                });

                const productMap = new Map(products.map(p => [p.product_id, p]));
                const stockMovements = [];
                const productUpdates = [];

                for (const item of transaction.t_transaction_item) {
                    const product = productMap.get(item.transaction_item_product_id);

                    if (product) {
                        const before_qty = product.product_qty;
                        const after_qty = before_qty + item.transaction_item_quantity;

                        productUpdates.push(
                            tx.m_product.update({
                                where: { product_id: item.transaction_item_product_id },
                                data: {
                                    product_qty: {
                                        increment: item.transaction_item_quantity
                                    }
                                }
                            })
                        );

                        stockMovements.push({
                            product_id: item.transaction_item_product_id,
                            movement_type: 'RETURN',
                            quantity: item.transaction_item_quantity,
                            cost_per_unit: product.product_cost ? parseFloat(product.product_cost) : null,
                            reference_type: 'RETURN',
                            reference_id: transaction.transaction_id,
                            notes: `Pembatalan penjualan - Transaksi #${transaction.transaction_number}`,
                            before_qty,
                            after_qty,
                            tenant_id: tenant_id,
                            created_by: user_id
                        });

                        product.product_qty = after_qty;
                    }
                }

                await Promise.all(productUpdates);

                if (stockMovements.length > 0) {
                    await tx.t_stock_movement.createMany({
                        data: stockMovements
                    });
                }
            }

            return await tx.t_transaction.update({
                where: { transaction_id: parseInt(transaction_id) },
                data: {
                    deleted_at: new Date(),
                    deleted_by: user_id
                }
            });
        }, {
            maxWait: 10000,
            timeout: 15000
        });
    }

    static async getDashboardStats(tenant_id, cashier_id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const where = {
            tenant_id,
            transaction_status: 'COMPLETED',
            transaction_completed_at: {
                gte: today,
                lt: tomorrow
            },
            deleted_at: null
        };

        if (cashier_id) {
            where.transaction_cashier_id = parseInt(cashier_id);
        }

        const [completedTransactions, recentTransactions] = await Promise.all([
            prisma.t_transaction.findMany({
                where,
                select: {
                    transaction_total: true,
                    transaction_payment_method: true
                }
            }),
            prisma.t_transaction.findMany({
                where,
                include: {
                    t_transaction_item: {
                        include: {
                            m_product: true
                        }
                    },
                    m_user: true
                },
                orderBy: { transaction_completed_at: 'desc' },
                take: 5
            })
        ]);

        const todaySales = completedTransactions.reduce(
            (sum, t) => sum + parseFloat(t.transaction_total),
            0
        );
        const transactionCount = completedTransactions.length;
        const averageSale = transactionCount > 0 ? todaySales / transactionCount : 0;

        // Calculate payment method breakdown
        const paymentMethodBreakdown = {
            CASH: { total: 0, count: 0 },
            QRIS: { total: 0, count: 0 },
            DEBIT: { total: 0, count: 0 }
        };

        completedTransactions.forEach(transaction => {
            const method = transaction.transaction_payment_method || 'CASH';
            if (paymentMethodBreakdown[method]) {
                paymentMethodBreakdown[method].total += parseFloat(transaction.transaction_total);
                paymentMethodBreakdown[method].count += 1;
            }
        });

        return {
            todaySales,
            transactionCount,
            averageSale: Math.round(averageSale),
            recentTransactions,
            paymentMethodBreakdown
        };
    }
}

module.exports = TransactionService;
