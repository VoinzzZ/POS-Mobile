const prisma = require('../config/mysql.db.js');

class FinancialReportService {
    static async getFinancialSummary(tenantId, filters = {}) {
        const { startDate, endDate } = filters;
        const dateFilter = {};

        if (startDate) {
            const start = new Date(startDate + 'T00:00:00');
            dateFilter.gte = start;
        }
        if (endDate) {
            const endOfDay = new Date(endDate + 'T23:59:59.999');
            dateFilter.lte = endOfDay;
        }

        const transactionFilter = {
            tenant_id: tenantId,
            transaction_status: 'COMPLETED',
            deleted_at: null,
        };

        if (Object.keys(dateFilter).length > 0) {
            transactionFilter.transaction_completed_at = dateFilter;
        }

        const cashTransactionFilter = {
            tenant_id: tenantId,
            transaction_type: 'EXPENSE',
            deleted_at: null,
        };

        if (Object.keys(dateFilter).length > 0) {
            cashTransactionFilter.transaction_date = dateFilter;
        }

        const [
            revenueData,
            totalTransactions,
            revenueByPaymentMethod,
            inventoryValue,
            totalExpenses
        ] = await Promise.all([
            this._calculateRevenue(transactionFilter),
            this._countTransactions(transactionFilter),
            this._getRevenueByPaymentMethod(transactionFilter),
            this._getInventoryValue(tenantId),
            this._calculateExpenses(cashTransactionFilter)
        ]);

        const grossProfit = revenueData.grossProfit;
        const netProfit = grossProfit;
        const profitMargin = revenueData.revenue > 0
            ? ((grossProfit / revenueData.revenue) * 100).toFixed(2)
            : 0;
        const netProfitMargin = profitMargin;

        return {
            revenue: {
                total: parseFloat(revenueData.revenue),
                totalCost: parseFloat(revenueData.totalCost),
                grossProfit: parseFloat(grossProfit),
                netProfit: parseFloat(netProfit),
                profitMargin: parseFloat(profitMargin),
                netProfitMargin: parseFloat(netProfitMargin),
            },
            transactions: {
                total: totalTransactions,
                byPaymentMethod: revenueByPaymentMethod,
            },
            expenses: {
                total: parseFloat(totalExpenses),
            },
            inventory: {
                totalValue: parseFloat(inventoryValue),
            },
            cashDrawer: {
                openDrawers: 0,
                totalCashInOpenDrawers: 0,
                totalClosedCash: 0,
            },
        };
    }

    static async _calculateRevenue(filter) {
        const transactions = await prisma.t_transaction.findMany({
            where: filter,
            include: {
                t_transaction_item: {
                    include: {
                        m_product: {
                            select: {
                                product_id: true,
                                product_name: true,
                                product_cost: true,
                            },
                        },
                    },
                },
            },
        });

        let totalRevenue = 0;
        let totalCost = 0;
        let totalMargin = 0;
        let itemsWithoutCost = 0;

        transactions.forEach(transaction => {
            totalRevenue += parseFloat(transaction.transaction_total);

            transaction.t_transaction_item.forEach(item => {
                const productCost = parseFloat(item.m_product.product_cost || 0);
                const itemQuantity = item.transaction_item_quantity;
                const itemPrice = parseFloat(item.transaction_item_price);

                const itemCost = productCost * itemQuantity;
                const itemRevenue = itemPrice * itemQuantity;
                const itemMargin = itemRevenue - itemCost;

                if (!item.m_product.product_cost || item.m_product.product_cost === 0) {
                    itemsWithoutCost++;
                    console.warn(`Product ${item.m_product.product_name} (ID: ${item.m_product.product_id}) has no cost set`);
                }

                totalCost += itemCost;
                totalMargin += itemMargin;
            });
        });

        if (itemsWithoutCost > 0) {
            console.warn(`Total items sold without cost data: ${itemsWithoutCost}`);
        }

        console.log('Revenue Calculation:', {
            totalRevenue: totalRevenue.toFixed(2),
            totalCost: totalCost.toFixed(2),
            grossProfit: totalMargin.toFixed(2),
            itemsWithoutCost
        });

        return {
            revenue: totalRevenue,
            totalCost: totalCost,
            grossProfit: totalMargin,
        };
    }

    static async _countTransactions(filter) {
        return await prisma.t_transaction.count({
            where: filter,
        });
    }

    static async _getRevenueByPaymentMethod(filter) {
        const transactions = await prisma.t_transaction.findMany({
            where: filter,
            select: {
                transaction_payment_method: true,
                transaction_total: true,
            },
        });

        const byMethod = {
            CASH: 0,
            QRIS: 0,
            DEBIT: 0,
        };

        transactions.forEach(t => {
            const method = t.transaction_payment_method || 'CASH';
            byMethod[method] += parseFloat(t.transaction_total);
        });

        return byMethod;
    }

    static async _getInventoryValue(tenantId) {
        const products = await prisma.m_product.findMany({
            where: {
                tenant_id: tenantId,
                is_active: true,
                deleted_at: null,
            },
            select: {
                product_qty: true,
                product_price: true,
            },
        });

        let totalValue = 0;
        products.forEach(product => {
            totalValue += product.product_qty * parseFloat(product.product_price);
        });

        return totalValue;
    }

    static async _calculateExpenses(filter) {
        const result = await prisma.t_cash_transaction.aggregate({
            where: {
                ...filter,
            },
            _sum: {
                amount: true,
            },
        });

        const totalAllExpenses = result._sum.amount || 0;

        const excludedResult = await prisma.t_cash_transaction.aggregate({
            where: {
                ...filter,
                t_expense_category: {
                    category_code: {
                        in: ['PURCHASE_INVENTORY', 'RETURN_REFUND']
                    }
                }
            },
            _sum: {
                amount: true,
            },
        });

        const excludedExpenses = excludedResult._sum.amount || 0;
        const totalOperationalExpenses = totalAllExpenses - excludedExpenses;

        console.log('Operational Expenses (excluding inventory purchases):', {
            totalAll: parseFloat(totalAllExpenses).toFixed(2),
            excluded: parseFloat(excludedExpenses).toFixed(2),
            total: parseFloat(totalOperationalExpenses).toFixed(2),
        });

        return totalOperationalExpenses;
    }




    static async getRevenueReport(tenantId, filters = {}) {
        const { startDate, endDate, groupBy = 'day' } = filters;

        const dateFilter = {
            tenant_id: tenantId,
            transaction_status: 'COMPLETED',
            deleted_at: null,
        };

        // Make date filters optional - if not provided, get all data
        if (startDate || endDate) {
            dateFilter.transaction_completed_at = {};
            if (startDate) {
                const start = new Date(startDate + 'T00:00:00');
                dateFilter.transaction_completed_at.gte = start;
            }
            if (endDate) {
                const endOfDay = new Date(endDate + 'T23:59:59.999');
                dateFilter.transaction_completed_at.lte = endOfDay;
            }
        }

        const transactions = await prisma.t_transaction.findMany({
            where: dateFilter,
            include: {
                t_transaction_item: {
                    include: {
                        m_product: true,
                    },
                },
            },
            orderBy: {
                transaction_completed_at: 'asc',
            },
        });

        return this._groupTransactionsByPeriod(transactions, groupBy);
    }

    static _groupTransactionsByPeriod(transactions, groupBy) {
        const grouped = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.transaction_completed_at);
            let key;

            if (groupBy === 'day') {
                // Use local date instead of UTC to match user's timezone
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                key = `${year}-${month}-${day}`;
            } else if (groupBy === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                const year = weekStart.getFullYear();
                const month = String(weekStart.getMonth() + 1).padStart(2, '0');
                const day = String(weekStart.getDate()).padStart(2, '0');
                key = `${year}-${month}-${day}`;
            } else if (groupBy === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = date.getFullYear().toString();
            }

            if (!grouped[key]) {
                grouped[key] = {
                    period: key,
                    revenue: 0,
                    cost: 0,
                    profit: 0,
                    transactions: 0,
                };
            }

            const revenue = parseFloat(transaction.transaction_total);
            let cost = 0;
            let profit = 0;

            transaction.t_transaction_item.forEach(item => {
                const productCost = item.m_product.product_cost || 0;
                const itemCost = parseFloat(productCost) * item.transaction_item_quantity;
                const itemRevenue = parseFloat(item.transaction_item_price) * item.transaction_item_quantity;
                const itemMargin = itemRevenue - itemCost;

                cost += itemCost;
                profit += itemMargin;
            });

            grouped[key].revenue += revenue;
            grouped[key].cost += cost;
            grouped[key].profit += profit;
            grouped[key].transactions += 1;
        });

        return Object.values(grouped).map(period => ({
            ...period,
            revenue: parseFloat(period.revenue.toFixed(2)),
            cost: parseFloat(period.cost.toFixed(2)),
            profit: parseFloat(period.profit.toFixed(2)),
            profitMargin: period.revenue > 0
                ? parseFloat(((period.profit / period.revenue) * 100).toFixed(2))
                : 0,
        }));
    }

    static async getEmployeePerformance(tenantId, filters = {}) {
        const { startDate, endDate, limit = 10 } = filters;

        const dateFilter = {
            tenant_id: tenantId,
            transaction_status: 'COMPLETED',
            deleted_at: null,
        };

        if (startDate) {
            const start = new Date(startDate + 'T00:00:00');
            dateFilter.transaction_completed_at = { gte: start };
        }
        if (endDate) {
            const endOfDay = new Date(endDate + 'T23:59:59.999');
            if (dateFilter.transaction_completed_at) {
                dateFilter.transaction_completed_at.lte = endOfDay;
            } else {
                dateFilter.transaction_completed_at = { lte: endOfDay };
            }
        }

        const transactions = await prisma.t_transaction.findMany({
            where: dateFilter,
            include: {
                m_user: {
                    select: {
                        user_id: true,
                        user_full_name: true,
                        user_name: true,
                    },
                },
            },
        });

        const employeeStats = {};

        transactions.forEach(transaction => {
            const userId = transaction.m_user.user_id;

            if (!employeeStats[userId]) {
                employeeStats[userId] = {
                    userId: userId,
                    name: transaction.m_user.user_full_name || transaction.m_user.user_name,
                    transactions: 0,
                    revenue: 0,
                };
            }

            employeeStats[userId].transactions += 1;
            employeeStats[userId].revenue += parseFloat(transaction.transaction_total);
        });

        const performance = Object.values(employeeStats)
            .map(emp => ({
                ...emp,
                revenue: parseFloat(emp.revenue.toFixed(2)),
                averageTransaction: parseFloat((emp.revenue / emp.transactions).toFixed(2)),
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);

        return performance;
    }
}

module.exports = FinancialReportService;
