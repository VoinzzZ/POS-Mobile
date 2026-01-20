import api from "./axiosInstance";

export interface CashDrawer {
    drawer_id: number;
    tenant_id: number;
    cashier_id: number;
    shift_start_time: string;
    shift_end_time: string | null;
    opening_balance: number;
    closing_balance: number | null;
    expected_balance: number | null;
    cash_in_transactions: number;
    cash_out_refunds: number;
    difference: number | null;
    notes: string | null;
    status: 'OPEN' | 'CLOSED' | 'BALANCED' | 'OVER' | 'SHORT';
    created_at: string;
    updated_at: string;
}

export interface CashDrawerWithUser extends CashDrawer {
    m_user?: {
        user_id: number;
        user_full_name: string | null;
        user_name: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CashDrawerFilters {
    cashier_id?: number;
    start_date?: string;
    end_date?: string;
    status?: 'OPEN' | 'CLOSED' | 'BALANCED' | 'OVER' | 'SHORT';
    page?: number;
    limit?: number;
}

export const openCashDrawer = async (
    opening_balance: number = 0
): Promise<ApiResponse<CashDrawer>> => {
    const res = await api.post("/cash-drawer/open", { opening_balance });
    return res.data;
};

export const getCurrentCashDrawer = async (): Promise<ApiResponse<CashDrawer>> => {
    const res = await api.get("/cash-drawer/current");
    return res.data;
};

export const closeCashDrawer = async (
    drawer_id: number,
    closing_balance: number,
    notes?: string
): Promise<ApiResponse<CashDrawer>> => {
    const res = await api.post("/cash-drawer/close", {
        drawer_id,
        closing_balance,
        notes,
    });
    return res.data;
};

export const getCashDrawerHistory = async (
    filters?: CashDrawerFilters
): Promise<ApiResponse<CashDrawerWithUser[]>> => {
    const res = await api.get("/cash-drawer/history", { params: filters });
    return res.data;
};

export const getCashDrawerById = async (
    drawerId: number
): Promise<ApiResponse<CashDrawerWithUser>> => {
    const res = await api.get(`/cash-drawer/${drawerId}`);
    return res.data;
};
