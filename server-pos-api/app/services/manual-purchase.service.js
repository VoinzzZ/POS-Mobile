const prisma = require('../config/mysql.db.js');
const stockService = require('./stock.service');
const cashTransactionService = require('./cash-transaction.service');

const recordManualPurchase = async (purchaseData) => {
    try {
        const {
            product_id,
            quantity,
            total_price,
            notes,
            tenant_id,
            created_by,
            purchase_date
        } = purchaseData;

        let purchaseCategory = await prisma.t_expense_category.findFirst({
            where: {
                category_code: 'PURCHASE_INVENTORY',
                OR: [
                    { tenant_id: parseInt(tenant_id) },
                    { tenant_id: null, is_system: true }
                ]
            }
        });

        if (!purchaseCategory) {
            purchaseCategory = await prisma.t_expense_category.create({
                data: {
                    category_code: 'PURCHASE_INVENTORY',
                    category_name: 'Pembelian Barang',
                    category_description: 'Pembelian barang dagangan dan stok inventory',
                    tenant_id: parseInt(tenant_id),
                    is_system: false,
                    is_active: true,
                    created_by: created_by ? parseInt(created_by) : null
                }
            });
        }

        return await prisma.$transaction(async (tx) => {
            const product = await tx.m_product.findUnique({
                where: { product_id: parseInt(product_id) },
                select: {
                    product_id: true,
                    product_name: true,
                    product_cost: true,
                    product_qty: true
                }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            const cost_per_unit = parseFloat(total_price) / parseInt(quantity);

            await stockService.updateProductCostWAC(
                product_id,
                cost_per_unit,
                quantity
            );

            const stockMovement = await stockService.createStockMovement({
                product_id: parseInt(product_id),
                movement_type: 'IN',
                quantity: parseInt(quantity),
                cost_per_unit: cost_per_unit,
                reference_type: 'PURCHASE',
                reference_id: null,
                notes: notes || `Manual purchase - ${product.product_name}`,
                tenant_id: parseInt(tenant_id),
                created_by: created_by ? parseInt(created_by) : null
            });

            const totalAmount = parseFloat(total_price);

            const cashTransaction = await cashTransactionService.createCashTransaction({
                tenant_id: parseInt(tenant_id),
                transaction_type: 'EXPENSE',
                amount: totalAmount,
                payment_method: 'CASH',
                category_id: purchaseCategory.category_id,
                category_type: 'PURCHASE',
                description: `Pembelian ${product.product_name} (${quantity} unit @ ${cost_per_unit.toFixed(2)})`,
                notes: notes || null,
                transaction_date: purchase_date ? new Date(purchase_date) : new Date(),
                created_by: created_by ? parseInt(created_by) : null
            });

            return {
                stock_movement: stockMovement,
                cash_transaction: cashTransaction,
                product: {
                    product_id: product.product_id,
                    product_name: product.product_name,
                    old_qty: product.product_qty,
                    new_qty: stockMovement.after_qty,
                    old_cost: parseFloat(product.product_cost || 0),
                    total_amount: totalAmount
                }
            };
        });
    } catch (error) {
        throw error;
    }
};

const getBulkPurchaseHistory = async (filters = {}) => {
    try {
        const {
            tenant_id,
            product_id,
            start_date,
            end_date,
            payment_method,
            page = 1,
            limit = 50
        } = filters;

        const where = {
            tenant_id: parseInt(tenant_id),
            transaction_type: 'EXPENSE',
            category_type: 'PURCHASE',
            deleted_at: null
        };

        if (payment_method) where.payment_method = payment_method;

        if (start_date || end_date) {
            where.transaction_date = {};
            if (start_date) where.transaction_date.gte = new Date(start_date);
            if (end_date) where.transaction_date.lte = new Date(end_date);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [purchases, totalCount] = await Promise.all([
            prisma.t_cash_transaction.findMany({
                where,
                orderBy: {
                    transaction_date: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.t_cash_transaction.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        return {
            data: purchases,
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

const getPurchaseSummary = async (tenant_id, start_date, end_date) => {
    try {
        const where = {
            tenant_id: parseInt(tenant_id),
            transaction_type: 'EXPENSE',
            category_type: 'PURCHASE',
            deleted_at: null
        };

        if (start_date || end_date) {
            where.transaction_date = {};
            if (start_date) where.transaction_date.gte = new Date(start_date);
            if (end_date) where.transaction_date.lte = new Date(end_date);
        }

        const purchases = await prisma.t_cash_transaction.findMany({
            where,
            select: {
                amount: true,
                payment_method: true
            }
        });

        let totalPurchase = 0;
        const byPaymentMethod = {
            CASH: 0,
            QRIS: 0,
            DEBIT: 0
        };

        purchases.forEach(purchase => {
            const amount = parseFloat(purchase.amount);
            totalPurchase += amount;
            byPaymentMethod[purchase.payment_method] += amount;
        });

        return {
            total_purchase: parseFloat(totalPurchase.toFixed(2)),
            transaction_count: purchases.length,
            by_payment_method: byPaymentMethod
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    recordManualPurchase,
    getBulkPurchaseHistory,
    getPurchaseSummary
};
