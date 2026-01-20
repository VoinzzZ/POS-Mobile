const prisma = require('../config/mysql.db.js');

const generateTransactionNumber = async (tenant_id) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const lastTransaction = await prisma.t_cash_transaction.findFirst({
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
    if (lastTransaction) {
        const lastSequence = parseInt(lastTransaction.transaction_number.split('-')[2]);
        sequence = lastSequence + 1;
    }

    return `CSH-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
};

const createCashTransaction = async (transactionData) => {
    try {
        const {
            tenant_id,
            transaction_type,
            amount,
            payment_method,
            category_id,
            category_type,
            sale_transaction_id,
            description,
            notes,
            receipt_image_url,
            transaction_date,
            created_by
        } = transactionData;

        const transaction_number = await generateTransactionNumber(tenant_id);

        const cashTransaction = await prisma.t_cash_transaction.create({
            data: {
                transaction_number,
                tenant_id: parseInt(tenant_id),
                transaction_type,
                amount: parseFloat(amount),
                payment_method,
                category_id: category_id ? parseInt(category_id) : null,
                category_type: category_type || null,
                sale_transaction_id: sale_transaction_id ? parseInt(sale_transaction_id) : null,
                description: description || null,
                notes: notes || null,
                receipt_image_url: receipt_image_url || null,
                transaction_date: transaction_date ? new Date(transaction_date) : new Date(),
                created_by: created_by ? parseInt(created_by) : null
            },
            include: {
                t_expense_category: {
                    select: {
                        category_id: true,
                        category_code: true,
                        category_name: true
                    }
                }
            }
        });

        return cashTransaction;
    } catch (error) {
        throw error;
    }
};

const getCashTransactions = async (filters = {}) => {
    try {
        const {
            tenant_id,
            transaction_type,
            payment_method,
            category_id,
            start_date,
            end_date,
            is_verified,
            page = 1,
            limit = 50,
            sort_order = 'desc'
        } = filters;

        const where = {
            deleted_at: null
        };

        if (tenant_id) where.tenant_id = parseInt(tenant_id);
        if (transaction_type) where.transaction_type = transaction_type;
        if (payment_method) where.payment_method = payment_method;
        if (category_id) where.category_id = parseInt(category_id);
        if (is_verified !== undefined) where.is_verified = is_verified === 'true' || is_verified === true;

        if (start_date || end_date) {
            where.transaction_date = {};
            if (start_date) where.transaction_date.gte = new Date(start_date);
            if (end_date) where.transaction_date.lte = new Date(end_date);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, totalCount] = await Promise.all([
            prisma.t_cash_transaction.findMany({
                where,
                include: {
                    t_expense_category: {
                        select: {
                            category_id: true,
                            category_code: true,
                            category_name: true
                        }
                    }
                },
                orderBy: {
                    transaction_date: sort_order === 'asc' ? 'asc' : 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.t_cash_transaction.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        return {
            data: transactions,
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

const getCashTransactionById = async (cash_transaction_id, tenant_id = null) => {
    try {
        const where = {
            cash_transaction_id: parseInt(cash_transaction_id),
            deleted_at: null
        };

        if (tenant_id) {
            where.tenant_id = parseInt(tenant_id);
        }

        const transaction = await prisma.t_cash_transaction.findFirst({
            where,
            include: {
                t_expense_category: {
                    select: {
                        category_id: true,
                        category_code: true,
                        category_name: true
                    }
                }
            }
        });

        return transaction;
    } catch (error) {
        throw error;
    }
};

const updateCashTransaction = async (cash_transaction_id, updateData, tenant_id = null) => {
    try {
        const where = {
            cash_transaction_id: parseInt(cash_transaction_id),
            deleted_at: null
        };

        if (tenant_id) {
            where.tenant_id = parseInt(tenant_id);
        }

        const existingTransaction = await prisma.t_cash_transaction.findFirst({
            where
        });

        if (!existingTransaction) {
            throw new Error('Cash transaction not found');
        }

        if (existingTransaction.is_verified) {
            throw new Error('Cannot update verified transaction');
        }

        const transaction = await prisma.t_cash_transaction.update({
            where: {
                cash_transaction_id: parseInt(cash_transaction_id)
            },
            data: {
                ...(updateData.amount !== undefined && { amount: parseFloat(updateData.amount) }),
                ...(updateData.payment_method && { payment_method: updateData.payment_method }),
                ...(updateData.category_id !== undefined && { category_id: updateData.category_id ? parseInt(updateData.category_id) : null }),
                ...(updateData.description !== undefined && { description: updateData.description }),
                ...(updateData.notes !== undefined && { notes: updateData.notes }),
                ...(updateData.receipt_image_url !== undefined && { receipt_image_url: updateData.receipt_image_url }),
                ...(updateData.transaction_date && { transaction_date: new Date(updateData.transaction_date) }),
                ...(updateData.updated_by && { updated_by: parseInt(updateData.updated_by) }),
                updated_at: new Date()
            },
            include: {
                t_expense_category: {
                    select: {
                        category_id: true,
                        category_code: true,
                        category_name: true
                    }
                }
            }
        });

        return transaction;
    } catch (error) {
        throw error;
    }
};

const deleteCashTransaction = async (cash_transaction_id, deleted_by, tenant_id = null) => {
    try {
        const where = {
            cash_transaction_id: parseInt(cash_transaction_id),
            deleted_at: null
        };

        if (tenant_id) {
            where.tenant_id = parseInt(tenant_id);
        }

        const existingTransaction = await prisma.t_cash_transaction.findFirst({
            where
        });

        if (!existingTransaction) {
            throw new Error('Cash transaction not found');
        }

        if (existingTransaction.is_verified) {
            throw new Error('Cannot delete verified transaction');
        }

        const transaction = await prisma.t_cash_transaction.update({
            where: {
                cash_transaction_id: parseInt(cash_transaction_id)
            },
            data: {
                deleted_at: new Date(),
                updated_by: deleted_by ? parseInt(deleted_by) : null
            }
        });

        return transaction;
    } catch (error) {
        throw error;
    }
};

const verifyCashTransaction = async (cash_transaction_id, verified_by, tenant_id = null) => {
    try {
        const where = {
            cash_transaction_id: parseInt(cash_transaction_id),
            deleted_at: null
        };

        if (tenant_id) {
            where.tenant_id = parseInt(tenant_id);
        }

        const existingTransaction = await prisma.t_cash_transaction.findFirst({
            where
        });

        if (!existingTransaction) {
            throw new Error('Cash transaction not found');
        }

        if (existingTransaction.is_verified) {
            throw new Error('Transaction already verified');
        }

        const transaction = await prisma.t_cash_transaction.update({
            where: {
                cash_transaction_id: parseInt(cash_transaction_id)
            },
            data: {
                is_verified: true,
                verified_by: parseInt(verified_by),
                verified_at: new Date()
            },
            include: {
                t_expense_category: {
                    select: {
                        category_id: true,
                        category_code: true,
                        category_name: true
                    }
                }
            }
        });

        return transaction;
    } catch (error) {
        throw error;
    }
};

const getCashBalance = async (tenant_id, payment_method = null) => {
    try {
        const where = {
            tenant_id: parseInt(tenant_id),
            deleted_at: null
        };

        if (payment_method) {
            where.payment_method = payment_method;
        }

        const transactions = await prisma.t_cash_transaction.findMany({
            where,
            select: {
                transaction_type: true,
                amount: true,
                payment_method: true
            }
        });

        const balanceByMethod = {};

        transactions.forEach(transaction => {
            const method = transaction.payment_method;
            if (!balanceByMethod[method]) {
                balanceByMethod[method] = 0;
            }

            if (transaction.transaction_type === 'INCOME') {
                balanceByMethod[method] += parseFloat(transaction.amount);
            } else {
                balanceByMethod[method] -= parseFloat(transaction.amount);
            }
        });

        const totalBalance = Object.values(balanceByMethod).reduce((sum, val) => sum + val, 0);

        return {
            total_balance: parseFloat(totalBalance.toFixed(2)),
            balance_by_method: balanceByMethod
        };
    } catch (error) {
        throw error;
    }
};

const getCashFlowSummary = async (tenant_id, start_date, end_date) => {
    try {
        const where = {
            tenant_id: parseInt(tenant_id),
            deleted_at: null
        };

        if (start_date || end_date) {
            where.transaction_date = {};
            if (start_date) where.transaction_date.gte = new Date(start_date);
            if (end_date) where.transaction_date.lte = new Date(end_date);
        }

        const transactions = await prisma.t_cash_transaction.findMany({
            where,
            select: {
                transaction_type: true,
                amount: true,
                payment_method: true
            }
        });

        let totalIncome = 0;
        let totalExpense = 0;
        const incomeByMethod = { CASH: 0, QRIS: 0, DEBIT: 0 };
        const expenseByMethod = { CASH: 0, QRIS: 0, DEBIT: 0 };

        transactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            const method = transaction.payment_method;

            if (transaction.transaction_type === 'INCOME') {
                totalIncome += amount;
                incomeByMethod[method] += amount;
            } else {
                totalExpense += amount;
                expenseByMethod[method] += amount;
            }
        });

        const netCashFlow = totalIncome - totalExpense;

        return {
            total_income: parseFloat(totalIncome.toFixed(2)),
            total_expense: parseFloat(totalExpense.toFixed(2)),
            net_cash_flow: parseFloat(netCashFlow.toFixed(2)),
            income_by_method: incomeByMethod,
            expense_by_method: expenseByMethod,
            transaction_count: transactions.length
        };
    } catch (error) {
        throw error;
    }
};

const getExpenseByCategory = async (tenant_id, start_date, end_date) => {
    try {
        const where = {
            tenant_id: parseInt(tenant_id),
            transaction_type: 'EXPENSE',
            deleted_at: null
        };

        if (start_date || end_date) {
            where.transaction_date = {};
            if (start_date) where.transaction_date.gte = new Date(start_date);
            if (end_date) where.transaction_date.lte = new Date(end_date);
        }

        const expenses = await prisma.t_cash_transaction.findMany({
            where,
            include: {
                t_expense_category: {
                    select: {
                        category_id: true,
                        category_code: true,
                        category_name: true
                    }
                }
            }
        });

        const categoryMap = {};

        expenses.forEach(expense => {
            const category = expense.t_expense_category;
            const categoryKey = category ? category.category_code : 'UNCATEGORIZED';
            const categoryName = category ? category.category_name : 'Tidak Berkategori';

            if (!categoryMap[categoryKey]) {
                categoryMap[categoryKey] = {
                    category_code: categoryKey,
                    category_name: categoryName,
                    total_amount: 0,
                    transaction_count: 0
                };
            }

            categoryMap[categoryKey].total_amount += parseFloat(expense.amount);
            categoryMap[categoryKey].transaction_count += 1;
        });

        const categories = Object.values(categoryMap).map(cat => ({
            ...cat,
            total_amount: parseFloat(cat.total_amount.toFixed(2))
        })).sort((a, b) => b.total_amount - a.total_amount);

        const totalExpense = categories.reduce((sum, cat) => sum + cat.total_amount, 0);

        return {
            total_expense: parseFloat(totalExpense.toFixed(2)),
            categories
        };
    } catch (error) {
        throw error;
    }
};

const syncFromSaleTransaction = async (sale_transaction_id, tenant_id, created_by = null) => {
    try {
        const existingSync = await prisma.t_cash_transaction.findFirst({
            where: {
                sale_transaction_id: parseInt(sale_transaction_id),
                tenant_id: parseInt(tenant_id),
                deleted_at: null
            }
        });

        if (existingSync) {
            throw new Error('Transaction already synced');
        }

        const saleTransaction = await prisma.t_transaction.findFirst({
            where: {
                transaction_id: parseInt(sale_transaction_id),
                tenant_id: parseInt(tenant_id),
                transaction_status: 'COMPLETED',
                deleted_at: null
            }
        });

        if (!saleTransaction) {
            throw new Error('Sale transaction not found or not completed');
        }

        const cashTransaction = await createCashTransaction({
            tenant_id: tenant_id,
            transaction_type: 'INCOME',
            amount: saleTransaction.transaction_total,
            payment_method: saleTransaction.transaction_payment_method || 'CASH',
            category_type: 'SALES',
            sale_transaction_id: sale_transaction_id,
            description: `Penjualan #${saleTransaction.transaction_number || sale_transaction_id}`,
            transaction_date: saleTransaction.transaction_completed_at,
            created_by: created_by
        });

        return cashTransaction;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    generateTransactionNumber,
    createCashTransaction,
    getCashTransactions,
    getCashTransactionById,
    updateCashTransaction,
    deleteCashTransaction,
    verifyCashTransaction,
    getCashBalance,
    getCashFlowSummary,
    getExpenseByCategory,
    syncFromSaleTransaction
};
