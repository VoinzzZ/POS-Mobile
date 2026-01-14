const prisma = require('../config/mysql.db.js');

class CashDrawerService {
    static async openDrawer(data) {
        const { tenant_id, cashier_id, opening_balance } = data;

        const existingOpen = await prisma.t_cash_drawer.findFirst({
            where: {
                cashier_id,
                status: 'OPEN',
            },
        });

        if (existingOpen) {
            throw new Error('Cashier already has an open drawer. Please close it first.');
        }

        const drawer = await prisma.t_cash_drawer.create({
            data: {
                tenant_id,
                cashier_id,
                opening_balance: opening_balance || 0,
                status: 'OPEN',
            },
        });

        return drawer;
    }

    static async getCurrentDrawer(cashierId) {
        const drawer = await prisma.t_cash_drawer.findFirst({
            where: {
                cashier_id: cashierId,
                status: 'OPEN',
            },
        });

        if (!drawer) {
            return null;
        }

        const expectedBalance =
            parseFloat(drawer.opening_balance) +
            parseFloat(drawer.cash_in_transactions) -
            parseFloat(drawer.cash_out_refunds);

        return {
            ...drawer,
            expected_balance: expectedBalance,
        };
    }

    static async recordCashTransaction(drawerId, amount) {
        const drawer = await prisma.t_cash_drawer.findUnique({
            where: { drawer_id: drawerId },
        });

        if (!drawer || drawer.status !== 'OPEN') {
            throw new Error('Drawer not found or not open');
        }

        await prisma.t_cash_drawer.update({
            where: { drawer_id: drawerId },
            data: {
                cash_in_transactions: {
                    increment: amount,
                },
            },
        });
    }

    static async closeDrawer(drawerId, closingBalance, notes = null) {
        const drawer = await prisma.t_cash_drawer.findUnique({
            where: { drawer_id: drawerId },
        });

        if (!drawer || drawer.status !== 'OPEN') {
            throw new Error('Drawer not found or not open');
        }

        const expectedBalance =
            parseFloat(drawer.opening_balance) +
            parseFloat(drawer.cash_in_transactions) -
            parseFloat(drawer.cash_out_refunds);

        const difference = parseFloat(closingBalance) - expectedBalance;

        let status = 'BALANCED';
        if (difference > 0) {
            status = 'OVER';
        } else if (difference < 0) {
            status = 'SHORT';
        }

        const updatedDrawer = await prisma.t_cash_drawer.update({
            where: { drawer_id: drawerId },
            data: {
                shift_end_time: new Date(),
                closing_balance: closingBalance,
                expected_balance: expectedBalance,
                difference: difference,
                status: status,
                notes: notes,
            },
        });

        return updatedDrawer;
    }

    static async getDrawerHistory(tenantId, filters = {}) {
        const { cashier_id, start_date, end_date, status, page = 1, limit = 20 } = filters;

        const where = {
            tenant_id: tenantId,
        };

        if (cashier_id) {
            where.cashier_id = parseInt(cashier_id);
        }

        if (status) {
            where.status = status;
        }

        if (start_date || end_date) {
            where.shift_start_time = {};
            if (start_date) where.shift_start_time.gte = new Date(start_date);
            if (end_date) where.shift_start_time.lte = new Date(end_date);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [drawers, total] = await Promise.all([
            prisma.t_cash_drawer.findMany({
                where,
                include: {
                    m_user: {
                        select: {
                            user_id: true,
                            user_full_name: true,
                            user_name: true,
                        },
                    },
                },
                orderBy: {
                    shift_start_time: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.t_cash_drawer.count({ where }),
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));

        return {
            data: drawers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
            },
        };
    }

    static async getDrawerById(drawerId, tenantId) {
        const drawer = await prisma.t_cash_drawer.findFirst({
            where: {
                drawer_id: drawerId,
                tenant_id: tenantId,
            },
            include: {
                m_user: {
                    select: {
                        user_id: true,
                        user_full_name: true,
                        user_name: true,
                    },
                },
                t_transaction: {
                    where: {
                        transaction_payment_method: 'CASH',
                        transaction_status: 'COMPLETED',
                    },
                    select: {
                        transaction_id: true,
                        transaction_total: true,
                        transaction_completed_at: true,
                    },
                },
            },
        });

        return drawer;
    }
}

module.exports = CashDrawerService;
