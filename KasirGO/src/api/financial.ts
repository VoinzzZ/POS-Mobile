import api from "./axiosInstance";

export interface FinancialSummary {
    revenue: {
        total: number;
        totalCost: number;
        grossProfit: number;
        netProfit: number;
        profitMargin: number;
        netProfitMargin: number;
    };
    transactions: {
        total: number;
        byPaymentMethod: {
            CASH: number;
            QRIS: number;
            DEBIT: number;
        };
    };
    expenses: {
        total: number;
    } | null;
    inventory: {
        totalValue: number;
    };
    cashDrawer: {
        openDrawers: number;
        totalCashInOpenDrawers: number;
        totalClosedCash: number;
    };
}

export interface RevenueReportItem {
    period: string;
    revenue: number;
    cost: number;
    profit: number;
    profitMargin: number;
    transactions: number;
}

export interface EmployeePerformance {
    userId: number;
    name: string;
    transactions: number;
    revenue: number;
    averageTransaction: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface FinancialFilters {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month' | 'year';
    limit?: number;
}

export const getFinancialSummary = async (
    filters?: FinancialFilters
): Promise<ApiResponse<FinancialSummary>> => {
    const res = await api.get("/financial/summary", { params: filters });
    return res.data;
};

export const getRevenueReport = async (
    filters?: FinancialFilters
): Promise<ApiResponse<RevenueReportItem[]>> => {
    const res = await api.get("/financial/revenue", { params: filters });
    return res.data;
};

export const getEmployeePerformance = async (
    filters?: FinancialFilters
): Promise<ApiResponse<EmployeePerformance[]>> => {
    const res = await api.get("/financial/employee-performance", { params: filters });
    return res.data;
};
