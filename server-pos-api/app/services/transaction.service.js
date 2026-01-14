const prisma = require('../config/mysql.db.js');

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

            const transaction = await tx.t_transaction.create({
                data: {
                    tenant_id,
                    transaction_cashier_id: cashier_id,
                    transaction_total,
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

            for (const item of transaction.t_transaction_item) {
                await tx.m_product.update({
                    where: { product_id: item.transaction_item_product_id },
                    data: {
                        product_qty: {
                            decrement: item.transaction_item_quantity
                        }
                    }
                });
            }

            const change_amount = payment_amount - transaction.transaction_total;

            let cash_drawer_id = null;
            if (payment_method === 'CASH') {
                const cashDrawer = await tx.t_cash_drawer.findFirst({
                    where: {
                        cashier_id: transaction.transaction_cashier_id,
                        status: 'OPEN',
                    },
                });

                if (cashDrawer) {
                    cash_drawer_id = cashDrawer.drawer_id;
                    await tx.t_cash_drawer.update({
                        where: { drawer_id: cash_drawer_id },
                        data: {
                            cash_in_transactions: {
                                increment: parseFloat(payment_amount),
                            },
                        },
                    });
                }
            }

            return await tx.t_transaction.update({
                where: { transaction_id: parseInt(transaction_id) },
                data: {
                    transaction_status: 'COMPLETED',
                    transaction_payment_amount: payment_amount,
                    transaction_change_amount: change_amount,
                    transaction_payment_method: payment_method,
                    transaction_completed_at: new Date(),
                    cash_drawer_id: cash_drawer_id,
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
        });
    }

    static async updateTransaction(transaction_id, data, tenant_id, user_id) {
        const { items } = data;

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
                throw new Error('Transaction not found or cannot be edited');
            }

            await tx.t_transaction_item.deleteMany({
                where: { transaction_id: parseInt(transaction_id) }
            });

            let transaction_total = 0;

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

                const transaction_item_price = product.product_price;
                const transaction_item_subtotal = transaction_item_price * item.quantity;
                transaction_total += transaction_item_subtotal;

                await tx.t_transaction_item.create({
                    data: {
                        transaction_id: parseInt(transaction_id),
                        transaction_item_product_id: item.product_id,
                        transaction_item_quantity: item.quantity,
                        transaction_item_price: transaction_item_price,
                        transaction_item_subtotal: transaction_item_subtotal
                    }
                });
            }

            return await tx.t_transaction.update({
                where: { transaction_id: parseInt(transaction_id) },
                data: {
                    transaction_total,
                    transaction_updated_at: new Date(),
                    transaction_updated_by: user_id
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
                for (const item of transaction.t_transaction_item) {
                    await tx.m_product.update({
                        where: { product_id: item.transaction_item_product_id },
                        data: {
                            product_qty: {
                                increment: item.transaction_item_quantity
                            }
                        }
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
        });
    }
}

module.exports = TransactionService;
