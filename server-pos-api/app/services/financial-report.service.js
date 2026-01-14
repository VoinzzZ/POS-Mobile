const prisma = require('../config/mysql.db.js');

class FinancialReportService {
    static async getFinancialSummary(tenantId, filters = {}) {
        const { startDate, endDate } = filters;
        const dateFilter = {};

        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const transactionFilter = {
            tenant_id: tenantId,
            transaction_status: 'COMPLETED',
            deleted_at: null,
        };

        if (Object.keys(dateFilter).length > 0) {
            transactionFilter.transaction_completed_at = dateFilter;
        }

        const [
            totalRevenue,
            totalTransactions,
            revenueByPaymentMethod,
            inventoryValue
        ] = await Promise.all([
            this._calculateRevenue(transactionFilter),
            this._countTransactions(transactionFilter),
            this._getRevenueByPaymentMethod(transactionFilter),
            this._getInventoryValue(tenantId)
        ]);

        const grossProfit = totalRevenue.revenue - totalRevenue.totalCost;
        const netProfit = grossProfit > 0 ? grossProfit : 0;
        const profitMargin = totalRevenue.revenue > 0
            ? ((grossProfit / totalRevenue.revenue) * 100).toFixed(2)
            : 0;

        return {
            revenue: {
                total: parseFloat(totalRevenue.revenue),
                totalCost: parseFloat(totalRevenue.totalCost),
                grossProfit: parseFloat(grossProfit),
                netProfit: parseFloat(netProfit),
                profitMargin: parseFloat(profitMargin),
            },
            transactions: {
                total: totalTransactions,
                byPaymentMethod: revenueByPaymentMethod,
            },
            expenses: null,
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
                        m_product: true,
                    },
                },
            },
        });

        let totalRevenue = 0;
        let totalCost = 0;

        transactions.forEach(transaction => {
            totalRevenue += parseFloat(transaction.transaction_total);

            transaction.t_transaction_item.forEach(item => {
                const productCost = item.m_product.product_cost || 0;
                totalCost += parseFloat(productCost) * item.transaction_item_quantity;
            });
        });

        return {
            revenue: totalRevenue,
            totalCost: totalCost,
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
                dateFilter.transaction_completed_at.gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.transaction_completed_at.lte = new Date(endDate);
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
                key = date.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
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

            transaction.t_transaction_item.forEach(item => {
                const productCost = item.m_product.product_cost || 0;
                cost += parseFloat(productCost) * item.transaction_item_quantity;
            });

            grouped[key].revenue += revenue;
            grouped[key].cost += cost;
            grouped[key].profit += (revenue - cost);
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
            dateFilter.transaction_completed_at = { gte: new Date(startDate) };
        }
        if (endDate) {
            if (dateFilter.transaction_completed_at) {
                dateFilter.transaction_completed_at.lte = new Date(endDate);
            } else {
                dateFilter.transaction_completed_at = { lte: new Date(endDate) };
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
