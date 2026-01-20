import api from "./axiosInstance";

export type CashTransactionType = "INCOME" | "EXPENSE";
export type PaymentMethod = "CASH" | "QRIS" | "DEBIT";

export interface CashTransaction {
    cash_transaction_id: number;
    transaction_number: string;
    tenant_id: number;
    transaction_type: CashTransactionType;
    amount: number;
    payment_method: PaymentMethod;
    category_id: number | null;
    category_type: string | null;
    sale_transaction_id: number | null;
    description: string | null;
    notes: string | null;
    receipt_image_url: string | null;
    is_verified: boolean;
    verified_by: number | null;
    verified_at: string | null;
    transaction_date: string;
    created_by: number | null;
    updated_by: number | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    t_expense_category?: {
        category_id: number;
        category_code: string;
        category_name: string;
    } | null;
}

export interface CreateCashTransactionData {
    transaction_type: CashTransactionType;
    amount: number;
    payment_method: PaymentMethod;
    category_id?: number | null;
    category_type?: string | null;
    sale_transaction_id?: number | null;
    description?: string | null;
    notes?: string | null;
    receipt_image_url?: string | null;
    transaction_date?: string;
}

export interface CashBalance {
    total_balance: number;
    balance_by_method: {
        CASH: number;
        QRIS: number;
        DEBIT: number;
    };
}

export interface CashFlowSummary {
    total_income: number;
    total_expense: number;
    net_cash_flow: number;
    income_by_method: {
        CASH: number;
        QRIS: number;
        DEBIT: number;
    };
    expense_by_method: {
        CASH: number;
        QRIS: number;
        DEBIT: number;
    };
    transaction_count: number;
}

export interface ExpenseByCategory {
    total_expense: number;
    categories: Array<{
        category_code: string;
        category_name: string;
        total_amount: number;
        transaction_count: number;
    }>;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
    };
    error?: string;
}

export const getAllCashTransactions = async (
    transaction_type?: CashTransactionType,
    payment_method?: PaymentMethod,
    category_id?: number,
    start_date?: string,
    end_date?: string,
    is_verified?: boolean,
    page?: number,
    limit?: number
): Promise<ApiResponse<CashTransaction[]>> => {
    const params: any = {};
    if (transaction_type) params.transaction_type = transaction_type;
    if (payment_method) params.payment_method = payment_method;
    if (category_id) params.category_id = category_id;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    if (is_verified !== undefined) params.is_verified = is_verified;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const res = await api.get("/cash-transactions", { params });
    return res.data;
};

export const getCashTransactionById = async (
    id: number
): Promise<ApiResponse<CashTransaction>> => {
    const res = await api.get(`/cash-transactions/${id}`);
    return res.data;
};

export const createCashTransaction = async (
    data: CreateCashTransactionData
): Promise<ApiResponse<CashTransaction>> => {
    const res = await api.post("/cash-transactions", data);
    return res.data;
};

export const updateCashTransaction = async (
    id: number,
    data: Partial<CreateCashTransactionData>
): Promise<ApiResponse<CashTransaction>> => {
    const res = await api.put(`/cash-transactions/${id}`, data);
    return res.data;
};

export const deleteCashTransaction = async (
    id: number
): Promise<ApiResponse> => {
    const res = await api.delete(`/cash-transactions/${id}`);
    return res.data;
};

export const verifyCashTransaction = async (
    id: number
): Promise<ApiResponse<CashTransaction>> => {
    const res = await api.post(`/cash-transactions/${id}/verify`);
    return res.data;
};

export const getCashBalance = async (
    payment_method?: PaymentMethod
): Promise<ApiResponse<CashBalance>> => {
    const params: any = {};
    if (payment_method) params.payment_method = payment_method;

    const res = await api.get("/cash-transactions/balance", { params });
    return res.data;
};

export const getCashFlowSummary = async (
    start_date?: string,
    end_date?: string
): Promise<ApiResponse<CashFlowSummary>> => {
    const params: any = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const res = await api.get("/cash-transactions/summary", { params });
    return res.data;
};

export const getExpenseByCategory = async (
    start_date?: string,
    end_date?: string
): Promise<ApiResponse<ExpenseByCategory>> => {
    const params: any = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const res = await api.get("/cash-transactions/expenses/by-category", { params });
    return res.data;
};

export const syncFromSaleTransaction = async (
    transaction_id: number
): Promise<ApiResponse<CashTransaction>> => {
    const res = await api.post(`/cash-transactions/sync/${transaction_id}`);
    return res.data;
};
